// hooks/useRoutineUrl.js
import { useState, useEffect } from 'react';
import RoutineUrlService from '../services/RoutineUrlService';

const useRoutineUrl = () => {
  const [state, setState] = useState({
    isModalVisible: false,
    routineData: null
  });
  
  useEffect(() => {
    // 서비스에 리스너 등록
    const removeListener = RoutineUrlService.addListener(setState);
    
    return removeListener; // 컴포넌트 언마운트 시 리스너 제거
  }, []);
  
  return {
    ...state,
    closeModal: RoutineUrlService.closeModal,
    handleUrlScheme: RoutineUrlService.handleUrlScheme
  };
};

export default useRoutineUrl;
