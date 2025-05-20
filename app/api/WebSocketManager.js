import RNFS from 'react-native-fs';
import { getAccessToken } from './storage';

// WebSocket 연결 상태 상수 정의
const WebSocketStates = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

class WebSocketManager {
  static instance = null;

  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.pendingCallback = null;
    this.connectCallbacks = [];
    this.messageQueue = [];
    this.initialMessageCallback = null; // 초기 메시지 콜백
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 초기 재연결 딜레이 (ms)
    this.manualDisconnect = false;
    this.dataHandlers = {}; // client_action과 data를 처리하기 위한 핸들러
    this.reconnectTimer = null;
    this.receivedInitialMessage = false; // 초기 메시지 수신 여부 추적
    this.lastReceivedMessage = null; // 마지막으로 수신한 메시지 저장
  }

  static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  async connect() {
    // 이미 연결된 경우 추가 작업 없이 대기 중인 콜백 실행
    if (this.isConnected) {
      console.log('[WebSocketManager] 이미 연결되어 있습니다.');
      this.connectCallbacks.forEach(callback => callback());
      this.connectCallbacks = [];
      return;
    }

    // 이미 연결 시도 중인 경우 중복 연결 방지
    if (this.socket && this.socket.readyState === WebSocketStates.CONNECTING) {
      console.log('[WebSocketManager] 연결 시도 중입니다.');
      return;
    }

    try {
      // 토큰 가져오기
      const token = await getAccessToken();
      if (!token) throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');

      // WebSocket URL 생성
      const socketUrl = `wss://ai.medeasy.dev/ws/message/voice?jwt_token=Bearer%20${token}`;

      // 기존 소켓 종료
      if (this.socket) {
        this.socket.close();
      }

      console.log('[WebSocketManager] 새 WebSocket 연결 생성');

      // 새 WebSocket 연결 생성 - 전역 WebSocket 객체 사용
      try {
        this.socket = new global.WebSocket(socketUrl);
      } catch (wsError) {
        console.error('[WebSocketManager] WebSocket 생성 오류:', wsError);
        throw new Error('WebSocket 연결을 생성할 수 없습니다: ' + wsError.message);
      }

      this.socket.onopen = () => {
        console.log('[WebSocketManager] 연결됨');
        this.isConnected = true;
        this.manualDisconnect = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 3000; // 재연결 성공 시 딜레이 초기화
        this.receivedInitialMessage = false; // 초기 메시지 수신 여부 초기화

        // 대기 중인 연결 콜백 실행
        this.connectCallbacks.forEach(callback => callback());
        this.connectCallbacks = [];

        // 대기열에 있는 메시지 전송
        this.processMessageQueue();
      };

      // 메시지 핸들러 설정
      this.socket.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('[WebSocketManager] 메시지 수신:', JSON.stringify(response).substring(0, 300));

          // 마지막 수신 메시지 저장
          this.lastReceivedMessage = response;

          // 1. 첫 번째 메시지를 항상 초기 메시지로 처리 (웹소켓 연결 후 첫 메시지)
          if (!this.receivedInitialMessage) {
            console.log('[WebSocketManager] 초기 메시지 수신 (첫 메시지)');

            if (this.initialMessageCallback) {
              console.log('[WebSocketManager] 초기 메시지 콜백 실행');
              this.initialMessageCallback(response);
            } else {
              console.warn('[WebSocketManager] 초기 메시지 콜백이 설정되지 않음');
            }

            this.receivedInitialMessage = true;
            return;
          }

          // 2. Client Action 핸들러 실행
          if (response.client_action && this.dataHandlers[response.client_action]) {
            console.log(`[WebSocketManager] 액션 핸들러 실행: ${response.client_action}`);
            // data와 함께 전체 메시지도 전달
            this.dataHandlers[response.client_action](response.data, response);
          }

          // 3. 대기 중인 콜백이 있으면 실행
          if (this.pendingCallback) {
            console.log('[WebSocketManager] 대기 중인 콜백으로 메시지 전달');
            this.pendingCallback(response);
            this.pendingCallback = null;
          } else {
            console.log('[WebSocketManager] 처리할 콜백 없음, 메시지 무시:',
              (response.text_message || '').substring(0, 50));
          }
        } catch (err) {
          console.error('[WebSocketManager] 메시지 처리 중 오류:', err);
        }
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocketManager] 오류 발생:', error);
        this.isConnected = false;
      };

      this.socket.onclose = (event) => {
        console.log(`[WebSocketManager] 연결 종료: 코드=${event.code}, 이유=${event.reason}`);
        this.isConnected = false;

        // 수동 종료가 아니고, 최대 재연결 시도 횟수보다 적게 시도한 경우 재연결
        if (!this.manualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 60000);
          console.log(`[WebSocketManager] ${delay}ms 후 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

          // 예전 타이머 제거하고 새로운 타이머 설정
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
          }

          this.reconnectTimer = setTimeout(() => this.connect(), delay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('[WebSocketManager] 최대 재연결 시도 횟수 초과. 재연결 중단.');
          // 보류 중인 모든 콜백에 오류 통지
          this.rejectAllPendingRequests(new Error('서버 연결이 끊어졌습니다.'));
        }
      };
    } catch (error) {
      console.error('[WebSocketManager] 연결 실패:', error);
      this.rejectAllPendingRequests(error);
      throw error;
    }
  }

  // 모든 대기 중인 요청 거절 처리
  rejectAllPendingRequests(error) {
    if (this.pendingCallback) {
      this.pendingCallback({
        result_code: 500,
        result_message: error.message,
        text_message: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
        audio_base64: null,
        client_action: null,
        data: null
      });
      this.pendingCallback = null;
    }
  }

  // 대기 중인 메시지 큐 처리
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { payload, resolve, reject } = this.messageQueue.shift();
      try {
        this.sendMessageInternal(payload);
      } catch (error) {
        reject(error);
      }
    }
  }

  /**
   * 초기 메시지를 수신할 콜백 함수 설정
   * @param {Function} callback - 초기 메시지를 처리할 콜백 함수
   */
  setInitialMessageCallback(callback) {
    console.log('[WebSocketManager] 초기 메시지 콜백 설정');
    this.initialMessageCallback = callback;

    // 연결 후 첫 메시지를 이미 받았지만 콜백이 없었던 경우를 위한 처리
    if (this.isConnected && this.receivedInitialMessage) {
      console.log('[WebSocketManager] 연결 재설정 - 초기 메시지 상태 초기화');

      // 소켓 연결 재설정
      this.disconnect();

      // 약간의 지연 후 재연결
      setTimeout(() => {
        this.receivedInitialMessage = false;
        this.connect();
      }, 500);
    }
  }

  /**
   * client_action에 따른 데이터 처리 핸들러 등록
   * @param {string} action - 처리할 client_action
   * @param {Function} handler - data를 처리할 핸들러 함수
   */
  registerDataHandler(action, handler) {
    if (!action) return;
    this.dataHandlers[action] = handler;
    console.log(`[WebSocketManager] 핸들러 등록됨: ${action}`);
  }

  /**
   * 연결이 완료될 때까지 대기
   */
  async waitForConnection() {
    if (this.isConnected) return Promise.resolve();
    return new Promise(resolve => {
      this.connectCallbacks.push(resolve);
    });
  }

  /**
   * 실제 메시지 전송 처리
   */
  sendMessageInternal(payload) {
    if (!this.isConnected || !this.socket) {
      console.warn('[WebSocketManager] 연결되지 않은 상태에서 메시지 전송 시도');
      return false;
    }

    try {
      const payloadString = JSON.stringify(payload);
      console.log('[WebSocketManager] 전송 메시지:', payloadString);
      this.socket.send(payloadString);
      return true;
    } catch (error) {
      console.error('[WebSocketManager] 메시지 전송 중 오류:', error);
      return false;
    }
  }

  /**
   * 메시지를 전송하고 서버 응답을 반환합니다.
   */
  async sendMessage(message, serverAction = null, data = null) {
    const payload = {
      message,
      server_action: serverAction,
      data: data === '' ? null : data, // 빈 문자열은 null로 처리
    };

    return new Promise(async (resolve, reject) => {
      try {
        // 콜백 저장 (단일)
        this.pendingCallback = async (response) => {
          try {
            const {
              result_code,
              result_message,
              text_message,
              audio_base64,
              audio_format = 'mp3',
              client_action,
              data: responseData,
            } = response;

            if (result_code !== 200) {
              reject(new Error(`서버 응답 실패: ${result_message}`));
              return;
            }

            // 음성 데이터가 없는 경우 처리
            if (!audio_base64) {
              resolve({
                text: text_message,
                filePath: null,
                action: client_action,
                data: responseData,
              });
              return;
            }

            // 음성 파일 저장
            const timestamp = Date.now();
            const filePath = `${RNFS.CachesDirectoryPath}/voice_response_${timestamp}.${audio_format}`;
            await RNFS.writeFile(filePath, audio_base64, 'base64');

            console.log('[WebSocketManager] 음성 응답 저장 완료:', filePath);

            resolve({
              text: text_message,
              filePath,
              action: client_action,
              data: responseData,
            });
          } catch (err) {
            console.error('[WebSocketManager] 응답 처리 중 오류:', err);
            reject(err);
          }
        };

        // 연결 상태 확인
        if (!this.isConnected) {
          console.log('[WebSocketManager] 연결 시도 중...');
          try {
            await this.connect();
            await this.waitForConnection();
          } catch (error) {
            console.error('[WebSocketManager] 연결 실패:', error);
            this.pendingCallback = null;
            reject(error);
            return;
          }
        }

        // 메시지 전송
        const sent = this.sendMessageInternal(payload);
        if (!sent) {
          // 메시지 큐에 추가 (콜백과 함께)
          this.messageQueue.push({ payload, resolve, reject });
        }
      } catch (error) {
        console.error('[WebSocketManager] 메시지 전송 실패:', error);
        this.pendingCallback = null;
        reject(error);
      }
    });
  }

  /**
   * 복약 루틴 음성 요청 전용
   */
  async getRoutineVoice() {
    return this.sendMessage('오늘 복약 루틴 조회', 'GET_ROUTINE_LIST_TODAY', null);
  }

  /**
   * 처방전 등록 요청
   */
  async registerPrescription() {
    return this.sendMessage('처방전 복용 일정 등록', 'PRESCRIPTION_ROUTINE_REGISTER_REQUEST', null);
  }

  /**
   * 처방전 사진 업로드
   * @param {string} base64Image - Base64로 인코딩된 이미지 데이터
   */
  async uploadPrescriptionPhoto(base64Image) {
    return this.sendMessage('처방전 사진 업로드', 'UPLOAD_PRESCRIPTION_PHOTO', base64Image);
  }

  /**
   * 복약 루틴 목록 등록 요청
   * @param {Array} routineData - 등록할 루틴 데이터 배열
   */
  async registerRoutineList(routineData) {
    return this.sendMessage('루틴 등록', 'REGISTER_ROUTINE_LIST', routineData);
  }

  /**
   * 알약 촬영 요청
   */
  async capturePillsPhoto() {
    return this.sendMessage('의약품 촬영', 'CAPTURE_PILLS_PHOTO_REQUEST', null);
  }

  /**
   * 알약 사진 업로드
   * @param {string} base64Image - Base64로 인코딩된 이미지 데이터
   */
  async uploadPillsPhoto(base64Image) {
    return this.sendMessage('알약 사진 업로드', 'UPLOAD_PILLS_PHOTO', base64Image);
  }

  /**
   * 약 검색 요청
   * @param {string} query - 검색할 약 이름이나 키워드
   */
  async searchMedicines(query) {
    return this.sendMessage(`약 검색: ${query}`, null, null);
  }

  /**
   * 24시간 이상 지난 임시 mp3 파일 삭제
   */
  async cleanupTempAudioFiles() {
    try {
      const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
      const now = Date.now();
      const expireTime = 24 * 60 * 60 * 1000; // 24시간

      for (const file of files) {
        if (file.name.startsWith('voice_response_') && file.name.endsWith('.mp3')) {
          const timestamp = Number(
            file.name.replace('voice_response_', '').replace('.mp3', '')
          );
          if (now - timestamp > expireTime) {
            await RNFS.unlink(file.path);
            console.log('[WebSocketManager] 오래된 임시 오디오 파일 삭제:', file.name);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('[WebSocketManager] 임시 파일 정리 중 오류:', error);
      return false;
    }
  }

  /**
   * 수동 연결 종료 처리 (재연결 방지)
   */
  disconnect() {
    this.manualDisconnect = true;

    // 재연결 타이머 정리
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket && (this.isConnected || this.socket.readyState === WebSocketStates.CONNECTING)) {
      console.log('[WebSocketManager] 웹소켓 연결 종료');
      this.socket.close();
      this.isConnected = false;
    }
    this.socket = null;
  }

  /**
   * 디버깅을 위한 연결 상태 정보 반환
   */
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      receivedInitialMessage: this.receivedInitialMessage,
      hasPendingCallback: !!this.pendingCallback,
      registeredActions: Object.keys(this.dataHandlers),
      queuedMessages: this.messageQueue.length
    };
  }
}

export default WebSocketManager;
