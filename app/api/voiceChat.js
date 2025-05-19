// VoiceChatService.js

import WebSocketManager from './WebSocketManager';

/**
 * 음성 메시지를 WebSocket으로 전송하고, 서버로부터 받은 전체 응답(JSON)을 파싱해
 * 텍스트 메시지, 음성 파일 경로, 클라이언트 액션을 포함한 정보를 반환합니다.
 * @param {string} message - 전송할 텍스트 메시지
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const sendVoiceMessage = async (message) => {
  const manager = WebSocketManager.getInstance();
  return manager.sendMessage(message);
};

/**
 * 초기 메시지 콜백 설정
 * @param {Function} callback - 초기 메시지 처리 콜백
 */
export const setInitialMessageCallback = (callback) => {
  const manager = WebSocketManager.getInstance();
  manager.setInitialMessageCallback(callback);
};

/**
 * 특정 클라이언트 액션에 대한 데이터 핸들러 등록
 * @param {string} action - 처리할 클라이언트 액션
 * @param {Function} handler - 데이터 처리 핸들러
 */
export const registerActionHandler = (action, handler) => {
  const manager = WebSocketManager.getInstance();
  manager.registerDataHandler(action, handler);
};

/**
 * 캐시 디렉터리 내 임시 음성 파일(voice_response_*.mp3)을 조회,
 * 24시간 이상 지난 파일을 삭제합니다.
 */
export const cleanupTempAudioFiles = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.cleanupTempAudioFiles();
};

/**
 * 복약 일정 텍스트 + 음성 응답을 WebSocket으로 가져와 mp3로 저장 후 반환합니다.
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const getRoutineVoice = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.getRoutineVoice();
};

/**
 * 처방전 복용 일정 등록 요청
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const registerPrescription = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.registerPrescription();
};

/**
 * 처방전 사진 업로드 요청
 * @param {string} base64Image - Base64로 인코딩된 이미지 데이터
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const uploadPrescriptionPhoto = async (base64Image) => {
  const manager = WebSocketManager.getInstance();
  return manager.uploadPrescriptionPhoto(base64Image);
};

/**
 * 복약 루틴 목록 등록 요청
 * @param {Array} routineList - 등록할 루틴 데이터 배열
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const registerRoutineList = async (routineList) => {
  const manager = WebSocketManager.getInstance();
  return manager.registerRoutineList(routineList);
};

/**
 * 의약품 촬영 요청
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const capturePillsPhoto = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.capturePillsPhoto();
};

/**
 * 의약품 사진 업로드
 * @param {string} base64Image - Base64로 인코딩된 이미지 데이터
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const uploadPillsPhoto = async (base64Image) => {
  const manager = WebSocketManager.getInstance();
  return manager.uploadPillsPhoto(base64Image);
};

/**
 * 약 검색 요청
 * @param {string} query - 검색할 약 이름이나 키워드
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const searchMedicines = async (query) => {
  const manager = WebSocketManager.getInstance();
  return manager.searchMedicines(query);
};

/**
 * 웹소켓 연결 강제 종료 (앱 종료 시 호출)
 */
export const disconnectWebSocket = () => {
  const manager = WebSocketManager.getInstance();
  manager.disconnect();
};

export default {
  sendVoiceMessage,
  setInitialMessageCallback,
  registerActionHandler,
  cleanupTempAudioFiles,
  getRoutineVoice,
  registerPrescription,
  uploadPrescriptionPhoto,
  registerRoutineList,
  capturePillsPhoto,
  uploadPillsPhoto,
  searchMedicines,
  disconnectWebSocket,
};