import { useEffect, useRef } from 'react';
import RNFS from 'react-native-fs';
import WebSocketManager from '../api/WebSocketManager';

/**
 * 웹소켓 통신을 위한 커스텀 훅
 * @returns {Object} 웹소켓 관련 메서드들
 */
export default function useWebSocketChat() {
  const wsManager = useRef(null);
  const initialMessageCallbackRef = useRef(null);

  // 웹소켓 매니저 초기화
  useEffect(() => {
    wsManager.current = WebSocketManager.getInstance();

    // 초기 메시지 콜백 설정
    if (initialMessageCallbackRef.current) {
      wsManager.current.setInitialMessageCallback(initialMessageCallbackRef.current);
    }

    // 웹소켓 연결
    wsManager.current.connect().catch(err => {
      console.error('[WebSocketChat] 연결 실패:', err);
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (wsManager.current) {
        wsManager.current.disconnect();
      }
    };
  }, []);

  /**
   * 초기 메시지 수신 콜백 설정
   */
  const setInitialMessageCallback = (callback) => {
    initialMessageCallbackRef.current = callback;

    if (wsManager.current) {
      wsManager.current.setInitialMessageCallback(callback);
    }
  };

  /**
   * 메시지 전송 및 응답 처리
   * @param {string} message - 전송할 텍스트 메시지
   * @param {string} serverAction - 서버 액션 (옵션)
   * @param {any} data - 추가 데이터 (옵션)
   * @returns {Promise<{ text: string, filePath: string, action: string, data: any }>}
   */
  const sendMessage = async (message, serverAction = null, data = null) => {
    if (!wsManager.current) {
      throw new Error('WebSocket 매니저가 초기화되지 않았습니다.');
    }

    return wsManager.current.sendMessage(message, serverAction, data);
  };

  /**
   * 임시 음성 파일 정리
   */
  const cleanupTempAudioFiles = async () => {
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
  };

  /**
   * 오늘의 복약 루틴 조회
   */
  const getRoutineVoice = async () => {
    return sendMessage('오늘 복약 루틴 조회', 'GET_ROUTINE_LIST_TODAY', null);
  };

  /**
   * 처방전 등록 요청
   */
  const registerPrescription = async () => {
    return sendMessage('처방전 복용 일정 등록', 'PRESCRIPTION_ROUTINE_REGISTER_REQUEST', null);
  };

  /**
   * 처방전 사진 업로드
   * @param {string} base64Image - Base64로 인코딩된 이미지 데이터
   */
  const uploadPrescriptionPhoto = async (base64Image) => {
    return sendMessage('처방전 사진 업로드', 'UPLOAD_PRESCRIPTION_PHOTO', base64Image);
  };

  /**
   * 복약 루틴 목록 등록 요청
   * @param {Array} routineData - 등록할 루틴 데이터 배열
   */
  const registerRoutineList = async (routineData) => {
    return sendMessage('루틴 등록', 'REGISTER_ROUTINE_LIST', routineData);
  };

  /**
   * 알약 촬영 요청
   */
  const capturePillsPhoto = async () => {
    return sendMessage('의약품 촬영', 'CAPTURE_PILLS_PHOTO_REQUEST', null);
  };

  /**
   * 알약 사진 업로드
   * @param {string} base64Image - Base64로 인코딩된 이미지 데이터
   */
  const uploadPillsPhoto = async (base64Image) => {
    return sendMessage('알약 사진 업로드', 'UPLOAD_PILLS_PHOTO', base64Image);
  };

  /**
   * 약 검색 요청
   * @param {string} query - 검색할 약 이름이나 키워드
   */
  const searchMedicines = async (query) => {
    return sendMessage(`약 검색: ${query}`, 'SEARCH_MEDICINES', { query });
  };

  /**
   * 클라이언트 액션에 대한 핸들러 등록
   * @param {string} action - 처리할 클라이언트 액션
   * @param {Function} handler - 데이터 처리 핸들러
   */
  const registerActionHandler = (action, handler) => {
    if (wsManager.current) {
      wsManager.current.registerDataHandler(action, handler);
    }
  };

  /**
   * 웹소켓 연결 강제 종료
   */
  const disconnect = () => {
    if (wsManager.current) {
      wsManager.current.disconnect();
    }
  };

  // 훅에서 제공할 메서드들 반환
  return {
    wsManager: wsManager.current,
    setInitialMessageCallback,
    sendMessage,
    cleanupTempAudioFiles,
    getRoutineVoice,
    registerPrescription,
    uploadPrescriptionPhoto,
    registerRoutineList,
    capturePillsPhoto,
    uploadPillsPhoto,
    searchMedicines,
    registerActionHandler,
    disconnect
  };
}