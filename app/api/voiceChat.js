// api/voiceChat.js
import WebSocketManager from './WebSocketManager';
import RNFS from 'react-native-fs';

/**
 * 웹소켓 연결을 초기화합니다
 * @returns {Promise<void>}
 */
export const initializeConnection = async () => {
  const manager = WebSocketManager.getInstance();
  await manager.connect();
};

/**
 * 초기 메시지 콜백 설정 (사용자 접속 시 인사말 등을 처리)
 * @param {Function} callback - 초기 메시지를 처리할 콜백 함수
 */
export const setInitialMessageCallback = (callback) => {
  const manager = WebSocketManager.getInstance();
  manager.setInitialMessageCallback(callback);
};

/**
 * 웹소켓 연결을 종료합니다
 */
export const disconnectWebSocket = () => {
  const manager = WebSocketManager.getInstance();
  manager.disconnect();
};

/**
 * 음성 메시지를 WebSocket으로 전송하고, 서버로부터 받은 전체 응답(JSON)을 파싱해
 * 텍스트 메시지, 음성 파일 경로, 클라이언트 액션, 추가 데이터를 포함한 정보를 반환합니다.
 * @param {string} message - 전송할 텍스트 메시지
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
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
 * 오늘의 복약 일정 텍스트 + 음성 응답을 WebSocket으로 가져와 mp3로 저장 후 반환합니다.
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const getRoutineVoice = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.sendMessage(
    "오늘 복약 루틴 조회",
    "GET_ROUTINE_LIST_TODAY",
    null
  );
};

/**
 * 처방전 촬영 요청을 보냅니다
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const requestPrescriptionCapture = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.sendMessage(
    "처방전 복용 일정 등록",
    "PRESCRIPTION_ROUTINE_REGISTER_REQUEST",
    null
  );
};

/**
 * 처방전 이미지를 서버에 업로드합니다
 * @param {string} imageUri - 처방전 이미지 경로
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const uploadPrescriptionImage = async (imageUri) => {
  try {
    // 이미지 파일을 base64로 변환
    const base64Image = await RNFS.readFile(imageUri, 'base64');

    const manager = WebSocketManager.getInstance();
    return manager.sendMessage(
      "처방전 사진 업로드",
      "UPLOAD_PRESCRIPTION_PHOTO",
      base64Image
    );
  } catch (error) {
    console.error('[voiceChat] 처방전 이미지 업로드 오류:', error);
    throw error;
  }
};

/**
 * 처방전 분석 결과를 기반으로 약 복용 루틴을 등록합니다
 * @param {Array} routineList - 등록할 루틴 목록
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const registerRoutineList = async (routineList) => {
  const manager = WebSocketManager.getInstance();
  return manager.sendMessage(
    "루틴 등록",
    "REGISTER_ROUTINE_LIST",
    routineList
  );
};

/**
 * 의약품 이미지를 검색합니다
 * @param {string} imageUri - 의약품 이미지 경로
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const searchMedicineByImage = async (imageUri) => {
  try {
    // 이미지 파일을 base64로 변환
    const base64Image = await RNFS.readFile(imageUri, 'base64');

    const manager = WebSocketManager.getInstance();
    return manager.sendMessage(
      "의약품 사진 검색",
      null, // 서버 액션 없음 (서버가 메시지 내용으로 판단)
      base64Image
    );
  } catch (error) {
    console.error('[voiceChat] 의약품 이미지 검색 오류:', error);
    throw error;
  }
};

/**
 * 텍스트로 약품을 검색합니다
 * @param {string} keyword - 검색 키워드
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const searchMedicineByText = async (keyword) => {
  const manager = WebSocketManager.getInstance();
  return manager.sendMessage(
    `약품 검색: ${keyword}`,
    null, // 서버 액션 없음 (서버가 메시지 내용으로 판단)
    null
  );
};

/**
 * 처방전 수정 요청을 처리합니다 - AI가 사용자의 의도를 이해하고 데이터를 수정
 * @param {string} modificationRequest - 수정 요청 메시지
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const modifyPrescription = async (modificationRequest) => {
  const manager = WebSocketManager.getInstance();
  return manager.sendMessage(
    modificationRequest,
    null, // 서버 액션 없음 (AI가 메시지 내용으로 판단)
    null
  );
};

/**
 * 사용자가 명시적으로 루틴 등록 승인
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const confirmRoutineRegistration = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.sendMessage(
    "그대로 등록",
    null,
    null
  );
};

/**
 * 사용자가 명시적으로 루틴 등록 거부
 * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
 */
export const rejectRoutineRegistration = async () => {
  const manager = WebSocketManager.getInstance();
  return manager.sendMessage(
    "등록하지 않을래요",
    null,
    null
  );
};

export default {
  initializeConnection,
  setInitialMessageCallback,
  disconnectWebSocket,
  sendVoiceMessage,
  cleanupTempAudioFiles,
  getRoutineVoice,
  requestPrescriptionCapture,
  uploadPrescriptionImage,
  registerRoutineList,
  searchMedicineByImage,
  searchMedicineByText,
  modifyPrescription,
  confirmRoutineRegistration,
  rejectRoutineRegistration
};