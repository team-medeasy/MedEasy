// utils/chatActionHandler.js

import {Linking} from 'react-native';
import Voice from '@react-native-voice/voice';

/**
 * 음성 인식 완전 중지 함수
 */
const stopVoiceRecognition = (voiceControls) => {
  console.log('[ActionHandler] 화면 이동으로 인한 음성 인식 중지');
  
  if (voiceControls) {
    // 음성 관련 모든 상태 초기화
    Voice.cancel().catch(() => {});
    voiceControls.cleanupAudio();
    voiceControls.stopPulseAnimation();
    voiceControls.resetVoiceState();
    voiceControls.setNavigatingAway(true);
    
    // 이미지 분석 상태도 해제 (화면 이동 시)
    if (voiceControls.setImageAnalysisInProgress) {
      voiceControls.setImageAnalysisInProgress(false);
    }
  }
};

/**
 * 클라이언트 액션 처리 함수
 * 서버에서 받은 client_action에 따라 적절한 화면으로 이동하거나 기능을 수행합니다.
 *
 * @param {string} action - 서버에서 전달받은 client_action 값
 * @param {object} navigation - React Navigation의 navigation 객체
 * @param {object} options - 추가 옵션 (data, voiceControls 등)
 */
export const handleClientAction = (action, navigation, options = {}) => {
  const {data, voiceControls} = options;

  console.log('[ActionHandler] 처리할 액션:', action);
  console.log('[ActionHandler] 데이터:', data);

  switch (action) {
    case 'CAPTURE_PRESCRIPTION':
      // 처방전 촬영 액션
      console.log('[ActionHandler] 처방전 촬영 요청');
      
      // 음성 인식 중지
      stopVoiceRecognition(voiceControls);
      
      navigation.navigate('Camera', {
        actionType: 'PRESCRIPTION',
        sourceScreen: 'VoiceChat',
      });
      break;

    case 'REVIEW_PRESCRIPTION_REGISTER_RESPONSE':
      // 처방전 정보 검토 액션
      console.log('[ActionHandler] 처방전 정보 검토');
      if (!data || data.length === 0) {
        console.warn('[ActionHandler] 처방전 데이터 없음');
        return;
      }

      // 음성 인식 중지
      stopVoiceRecognition(voiceControls);

      // 처방전 정보를 담아서 검토 화면으로 이동
      navigation.navigate('PrescriptionSearchResults', {
        prescriptionData: data,
        fromVoiceChat: true,
        onRoutineRegistered: options?.onRoutineRegistered,
      });
      break;

    case 'CAPTURE_PILLS_PHOTO':
      // 알약 촬영 액션
      console.log('[ActionHandler] 알약 촬영 요청');
      
      // 음성 인식 중지
      stopVoiceRecognition(voiceControls);
      
      navigation.navigate('Camera', {
        actionType: 'PILLS',
        sourceScreen: 'VoiceChat',
      });
      break;

    case 'UPLOAD_PILLS_PHOTO':
      // 알약 촬영 액션
      console.log('[ActionHandler] 알약 사진 업로드 요청');
      
      // 음성 인식 중지
      stopVoiceRecognition(voiceControls);
      
      navigation.navigate('Camera', {
        actionType: 'PILLS',
        sourceScreen: 'VoiceChat',
      });
      break;

    case 'REVIEW_PILLS_PHOTO_SEARCH_RESPONSE':
      // 알약 검색 결과 검토 액션
      console.log('[ActionHandler] 알약 검색 결과 검토');
      if (!data || data.length === 0) {
        console.warn('[ActionHandler] 알약 데이터 없음');
        return;
      }

      // 음성 인식 중지
      stopVoiceRecognition(voiceControls);

      // 알약 검색 결과를 담아서 검토 화면으로 이동
      navigation.navigate('CameraSearchResults', {
        pillsData: data,
        fromVoiceChat: true,
      });
      break;

    default:
      console.log('[ActionHandler] 처리되지 않은 액션:', action);
      break;
  }
};

export default handleClientAction;