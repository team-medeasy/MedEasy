import WebSocketManager from './WebSocketManager';

/**
 * 음성 챗봇 서비스 클래스
 * 웹소켓을 통해 메시지를 주고받고 응답을 처리합니다.
 */
class VoiceChatService {
  static instance = null;

  constructor() {
    this.wsManager = WebSocketManager.getInstance();
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance() {
    if (!VoiceChatService.instance) {
      VoiceChatService.instance = new VoiceChatService();
    }
    return VoiceChatService.instance;
  }

  /**
   * 음성 메시지를 WebSocket으로 전송하고, 서버로부터 받은 전체 응답(JSON)을 파싱해
   * 텍스트 메시지, 음성 파일 경로, 클라이언트 액션을 포함한 정보를 반환합니다.
   * @param {string} message - 전송할 텍스트 메시지
   * @param {string} serverAction - 서버 액션 (옵션)
   * @param {any} data - 추가 데이터 (옵션)
   * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
   */
  async sendMessage(message, serverAction = null, data = null) {
    return this.wsManager.sendMessage(message, serverAction, data);
  }

  /**
   * 초기 메시지 콜백 설정
   * 앱 시작 시 웹소켓 연결 후 서버에서 보내는 첫 메시지를 처리합니다.
   * @param {Function} callback - 초기 메시지 처리 콜백
   */
  setInitialMessageCallback(callback) {
    this.wsManager.setInitialMessageCallback(callback);
  }

  /**
   * 특정 클라이언트 액션에 대한 데이터 핸들러 등록
   * @param {string} action - 처리할 클라이언트 액션 (CAPTURE_PRESCRIPTION, REVIEW_PRESCRIPTION_REGISTER_RESPONSE 등)
   * @param {Function} handler - 데이터 처리 핸들러
   */
  registerActionHandler(action, handler) {
    this.wsManager.registerDataHandler(action, handler);
  }

  /**
   * 캐시 디렉터리 내 임시 음성 파일(voice_response_*.mp3)을 조회,
   * 24시간 이상 지난 파일을 삭제합니다.
   * @returns {Promise<boolean>} 작업 성공 여부
   */
  async cleanupTempAudioFiles() {
    return this.wsManager.cleanupTempAudioFiles();
  }

  /**
   * 복약 일정 텍스트 + 음성 응답을 WebSocket으로 가져와 mp3로 저장 후 반환합니다.
   * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
   */
  async getRoutineVoice() {
    return this.wsManager.getRoutineVoice();
  }

  /**
   * 처방전 복용 일정 등록 요청
   * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
   */
  async registerPrescription() {
    return this.wsManager.registerPrescription();
  }

  /**
   * 처방전 사진 업로드 요청
   * @param {string} base64Image - Base64로 인코딩된 이미지 데이터
   * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
   */
  async uploadPrescriptionPhoto(base64Image) {
    return this.wsManager.uploadPrescriptionPhoto(base64Image);
  }

  /**
   * 복약 루틴 목록 등록 요청
   * @param {Array} routineList - 등록할 루틴 데이터 배열
   * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
   */
  async registerRoutineList(routineList) {
    return this.wsManager.registerRoutineList(routineList);
  }

  /**
   * 의약품 촬영 요청
   * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
   */
  async capturePillsPhoto() {
    return this.wsManager.capturePillsPhoto();
  }

  /**
   * 의약품 사진 업로드
   * @param {string} base64Image - Base64로 인코딩된 이미지 데이터
   * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
   */
  async uploadPillsPhoto(base64Image) {
    return this.wsManager.uploadPillsPhoto(base64Image);
  }

  /**
   * 약 검색 요청
   * @param {string} query - 검색할 약 이름이나 키워드
   * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
   */
  async searchMedicines(query) {
    return this.wsManager.searchMedicines(query);
  }

  /**
   * 웹소켓 연결 강제 종료 (앱 종료 시 호출)
   */
  disconnect() {
    this.wsManager.disconnect();
  }

  /**
   * 웹소켓 연결 - 필요시 수동 연결에 사용
   * @returns {Promise<void>}
   */
  async connect() {
    return this.wsManager.connect();
  }
}

// 싱글톤 인스턴스와 함수형 인터페이스 모두 제공
const voiceChatService = VoiceChatService.getInstance();

// 함수형 내보내기
export const sendVoiceMessage = async (message, serverAction = null, data = null) => {
  return voiceChatService.sendMessage(message, serverAction, data);
};

export const setInitialMessageCallback = (callback) => {
  voiceChatService.setInitialMessageCallback(callback);
};

export const registerActionHandler = (action, handler) => {
  voiceChatService.registerActionHandler(action, handler);
};

export const cleanupTempAudioFiles = async () => {
  return voiceChatService.cleanupTempAudioFiles();
};

export const getRoutineVoice = async () => {
  return voiceChatService.getRoutineVoice();
};

export const registerPrescription = async () => {
  return voiceChatService.registerPrescription();
};

export const uploadPrescriptionPhoto = async (base64Image) => {
  return voiceChatService.uploadPrescriptionPhoto(base64Image);
};

export const registerRoutineList = async (routineList) => {
  return voiceChatService.registerRoutineList(routineList);
};

export const capturePillsPhoto = async () => {
  return voiceChatService.capturePillsPhoto();
};

export const uploadPillsPhoto = async (base64Image) => {
  return voiceChatService.uploadPillsPhoto(base64Image);
};

export const searchMedicines = async (query) => {
  return voiceChatService.searchMedicines(query);
};

export const disconnectWebSocket = () => {
  voiceChatService.disconnect();
};

export const connectWebSocket = async () => {
  return voiceChatService.connect();
};

// 클래스도 export
export default voiceChatService;