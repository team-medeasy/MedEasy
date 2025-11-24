import { useEffect, useRef, useCallback } from 'react';
import voiceChatService from '../api/VoiceChatService';

/**
 * 웹소켓 채팅 사용을 위한 React 훅
 * 컴포넌트 라이프사이클에 맞춰 웹소켓 연결을 관리합니다.
 * @returns {Object} 웹소켓 채팅 기능을 제공하는 객체
 */
export default function useWebSocketChat() {
  const initialMessageCallbackRef = useRef(null);
  const actionHandlersRef = useRef({});

  // 컴포넌트 마운트 시 웹소켓 연결 설정
  useEffect(() => {
    // 초기 메시지 콜백 설정 (이전에 저장된 콜백이 있는 경우)
    if (initialMessageCallbackRef.current) {
      voiceChatService.setInitialMessageCallback(initialMessageCallbackRef.current);
    }

    // 저장된 액션 핸들러 다시 등록
    Object.entries(actionHandlersRef.current).forEach(([action, handler]) => {
      voiceChatService.registerActionHandler(action, handler);
    });

    // 웹소켓 연결
    voiceChatService.connect().catch(err => {
      console.error('[useWebSocketChat] 웹소켓 연결 실패:', err);
    });

    // 임시 오디오 파일 정리
    voiceChatService.cleanupTempAudioFiles();

    // 컴포넌트 언마운트 시 리소스 정리
    return () => {
      // 연결 종료는 앱 종료 시에만 수행
      // 화면 전환 시에는 연결 유지
    };
  }, []);

  /**
   * 초기 메시지 수신 콜백 설정
   */
  const setInitialMessageCallback = useCallback((callback) => {
    initialMessageCallbackRef.current = callback;

    // 단순히 voiceChatService에 콜백 전달
    voiceChatService.setInitialMessageCallback(callback);
  }, []);

  /**
   * 클라이언트 액션에 대한 핸들러 등록
   */
  const registerActionHandler = useCallback((action, handler) => {
    if (!action) return;

    // 액션 핸들러 참조 저장 (컴포넌트 재렌더링 시 사용)
    actionHandlersRef.current[action] = handler;
    voiceChatService.registerActionHandler(action, handler);
  }, []);

  /**
   * 메시지 전송 및 응답 처리
   */
  const sendMessage = useCallback(async (message, serverAction = null, data = null) => {
    return voiceChatService.sendMessage(message, serverAction, data);
  }, []);

  /**
   * 오늘의 복약 루틴 조회
   */
  const getRoutineVoice = useCallback(async () => {
    return voiceChatService.getRoutineVoice();
  }, []);

  /**
   * 처방전 등록 요청
   */
  const registerPrescription = useCallback(async () => {
    return voiceChatService.registerPrescription();
  }, []);

  /**
   * 처방전 사진 업로드
   */
  const uploadPrescriptionPhoto = useCallback(async (base64Image) => {
    return voiceChatService.uploadPrescriptionPhoto(base64Image);
  }, []);

  /**
   * 복약 루틴 목록 등록
   */
  const registerRoutineList = useCallback(async (routineData) => {
    return voiceChatService.registerRoutineList(routineData);
  }, []);

  /**
   * 알약 촬영 요청
   */
  const capturePillsPhoto = useCallback(async () => {
    return voiceChatService.capturePillsPhoto();
  }, []);

  /**
   * 알약 사진 업로드
   */
  const uploadPillsPhoto = useCallback(async (base64Image) => {
    return voiceChatService.uploadPillsPhoto(base64Image);
  }, []);

  /**
   * 약 검색 요청
   */
  const searchMedicines = useCallback(async (query) => {
    return voiceChatService.searchMedicines(query);
  }, []);

  /**
   * 임시 음성 파일 정리
   */
  const cleanupTempAudioFiles = useCallback(async () => {
    return voiceChatService.cleanupTempAudioFiles();
  }, []);

  return {
    setInitialMessageCallback,
    sendMessage,
    registerActionHandler,
    cleanupTempAudioFiles,
    getRoutineVoice,
    registerPrescription,
    uploadPrescriptionPhoto,
    registerRoutineList,
    capturePillsPhoto,
    uploadPillsPhoto,
    searchMedicines,
    disconnect: voiceChatService.disconnectWebSocket
  };
}