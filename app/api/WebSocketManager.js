import RNFS from 'react-native-fs';
import { getAccessToken } from './storage';

class WebSocketManager {
  static instance = null;
  
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.pendingCallback = null;
    this.connectCallbacks = [];
    this.messageQueue = [];
    this.initialMessageCallback = null; // 초기 메시지 콜백
    this.manualDisconnect = false;
  }

  static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  async connect() {
    if (this.isConnected) {
      console.log('[WebSocketManager] 이미 연결되어 있습니다.');
      this.connectCallbacks.forEach(callback => callback());
      this.connectCallbacks = [];
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');

      const socketUrl = `wss://ai.medeasy.dev/ws/message/voice?jwt_token=Bearer%20${token}`;
      this.socket = new WebSocket(socketUrl);

      this.socket.onopen = () => {
        console.log('[WebSocketManager] 연결됨');
        this.isConnected = true;
        this.manualDisconnect = false;

        this.connectCallbacks.forEach(callback => callback());
        this.connectCallbacks = [];

        while (this.messageQueue.length > 0) {
          const payload = this.messageQueue.shift();
          this.sendMessageInternal(payload);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('[WebSocketManager] 응답 받음:', response);

          // 초기 메시지 처리 (콜백이 있고 pending 콜백이 없는 경우)
          if (this.initialMessageCallback && !this.pendingCallback) {
            this.initialMessageCallback(response);
            console.log("[WebSocketManager] 초기 응답 텍스트: ", response.text_message);
            return;
          }

          // 일반 메시지 처리
          if (this.pendingCallback) {
            this.pendingCallback(response);
            console.log("[WebSocketManager] 응답 텍스트: ", response.text_message);
            this.pendingCallback = null;
          } else {
            console.log('[WebSocketManager] 처리할 콜백이 없습니다:', response);
          }
        } catch (err) {
          console.error('[WebSocketManager] 응답 처리 중 오류:', err);
        }
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocketManager] 오류 발생:', error);
        this.isConnected = false;
      };

      this.socket.onclose = (event) => {
        console.log(`[WebSocketManager] 연결 종료: 코드=${event.code}, 이유=${event.reason}`);
        this.isConnected = false;

        if (!this.manualDisconnect) {
          console.log('[WebSocketManager] 자동 재연결 로직은 구현되지 않았습니다.');
        }
      };
    } catch (error) {
      console.error('[WebSocketManager] 연결 실패:', error);
      throw error;
    }
  }

  /**
   * 초기 메시지를 수신할 콜백 함수 설정
   * @param {Function} callback - 초기 메시지를 처리할 콜백 함수
   */
  setInitialMessageCallback(callback) {
    this.initialMessageCallback = callback;
  }

  async waitForConnection() {
    if (this.isConnected) return Promise.resolve();
    return new Promise(resolve => {
      this.connectCallbacks.push(resolve);
    });
  }

  sendMessageInternal(payload) {
    if (!this.isConnected || !this.socket) {
      console.warn('[WebSocketManager] 연결되지 않은 상태에서 메시지 전송 시도');
      return false;
    }

    const payloadString = JSON.stringify(payload);
    console.log('[WebSocketManager] 전송 메시지:', payloadString);

    this.socket.send(payloadString);
    return true;
  }

  /**
   * 메시지를 전송하고 서버 응답을 반환합니다.
   */
  async sendMessage(message, serverAction = null, data = null) {
    const payload = {
      message,
      server_action: serverAction,
      data,
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
              });
              return;
            }

            const timestamp = Date.now();
            const filePath = `${RNFS.CachesDirectoryPath}/voice_response_${timestamp}.${audio_format}`;
            await RNFS.writeFile(filePath, audio_base64, 'base64');

            console.log('음성 응답 저장 완료:', filePath);

            resolve({
              text: text_message,
              filePath,
              action: client_action,
            });
          } catch (err) {
            console.error('[WebSocketManager] 응답 처리 중 오류:', err);
            reject(err);
          }
        };

        if (!this.isConnected) {
          console.log('[WebSocketManager] 연결 대기 중...');
          await this.connect();
          await this.waitForConnection();
        }

        const sent = this.sendMessageInternal(payload);
        if (!sent) {
          this.messageQueue.push(payload);
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
 */
async uploadPrescriptionPhoto() {
  return this.sendMessage('처방전 사진 업로드', 'UPLOAD_PRESCRIPTION_PHOTO', null);
}

/**
 * 복약 루틴 목록 등록 요청
 */
async registerRoutineList(data) {
  return this.sendMessage('루틴 등록', 'REGISTER_ROUTINE_LIST', data);
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
            console.log('오래된 임시 오디오 파일 삭제:', file.name);
          }
        }
      }
    } catch (error) {
      console.error('임시 파일 정리 중 오류:', error);
    }
  }

  /**
   * 수동 연결 종료 처리 (재연결 방지)
   */
  disconnect() {
    this.manualDisconnect = true;
    if (this.socket && this.isConnected) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default WebSocketManager;
