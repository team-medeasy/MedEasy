import WebSocketManager from './WebSocketManager';

/**
 * 음성 메시지를 WebSocket으로 전송하고, 서버로부터 받은 전체 응답(JSON)을 파싱해
 * 텍스트 메시지, 음성 파일 경로, 클라이언트 액션을 포함한 정보를 반환합니다.
 * @param {string} message - 전송할 텍스트 메시지
 * @returns {Promise<{ text: string, filePath: string, action: string }>}
 */
export const sendVoiceMessage = async (message) => {
  const manager = WebSocketManager.getInstance();
  return manager.sendMessage(message);
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
 * @returns {Promise<{ text: string, filePath: string, action: string }>}
 */
export const getRoutineVoice = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.getRoutineVoice();
};

/**
 * 처방전 복용 일정 등록 요청
 * @returns {Promise<{ text: string, filePath: string, action: string }>}
 */
export const registerPrescription = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.registerPrescription();
};

/**
 * 처방전 사진 업로드 요청
 * @param {string} image
 * @returns {Promise<{ text: string, filePath: string, action: string }>}
 */
export const uploadPrescriptionPhoto = async (image) => {
  const manager = WebSocketManager.getInstance();
  return manager.uploadPrescriptionPhoto(image);
};

/**
 * 복약 루틴 목록 등록 요청
 * @returns {Promise<{ text: string, filePath: string, action: string }>}
 */
export const registerRoutineList = async (routineList) => {
  const manager = WebSocketManager.getInstance();
  return manager.registerRoutineList(routineList);
};

/**
 * 의약품 촬영 요청
 * @returns {Promise<{ text: string, filePath: string, action: string }>}
 */
export const capturePillsPhoto = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.capturePillsPhoto();
};


export default {
  sendVoiceMessage,
  cleanupTempAudioFiles,
  getRoutineVoice,
  registerPrescription,
  uploadPrescriptionPhoto,
  registerRoutineList,
  capturePillsPhoto,
};