// hooks/useRoutineUrl.js
import { useState, useEffect } from 'react';
import RoutineUrlService from '../services/RoutineUrlService';

/**
 * URL 스킴 처리를 위한 커스텀 훅
 * RoutineUrlService와 컴포넌트 간의 상태 동기화를 담당
 */
const useRoutineUrl = () => {
  // 내부 상태 초기화
  const [state, setState] = useState({
    isModalVisible: false,
    routineData: null
  });
  
  useEffect(() => {
    console.log('[useRoutineUrl] 훅 초기화 - 리스너 등록');
    
    // RoutineUrlService에 상태 변경 리스너 등록
    const removeListener = RoutineUrlService.addListener((newState) => {
      console.log('[useRoutineUrl] 상태 업데이트 수신:', newState);
      setState(newState);
    });
    
    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      console.log('[useRoutineUrl] 훅 정리 - 리스너 제거');
      removeListener();
    };
  }, []);
  
  // 서비스 함수와 현재 상태를 함께 반환
  return {
    ...state,
    closeModal: RoutineUrlService.closeModal
  };
};

export default useRoutineUrl;
