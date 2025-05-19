/**
 * 클라이언트 액션 처리 유틸리티
 * 서버로부터 받은 client_action을 처리하는 함수
 */

/**
 * 액션 처리 함수
 * @param {string} action - 서버로부터 받은 client_action
 * @param {object} navigation - React Navigation의 navigation 객체
 * @param {object} options - 추가 옵션 (baseRoute, params 등)
 * @returns {boolean} - 액션이 처리되었는지 여부
 */
export const handleClientAction = (action, navigation, options = {}) => {
  if (!action) return false;

  console.log(`[VOICE] 액션 처리: ${action}`);

  switch (action) {
    case 'CAPTURE_PRESCRIPTION':
      console.log('[VOICE] client_action: CAPTURE_PRESCRIPTION - 카메라 화면으로 이동합니다.');
      navigation.navigate('Camera', {
        mode: 'prescription',
        ...(options.params || {})
      });
      return true;

    case 'REVIEW_PRESCRIPTION_REGISTER_RESPONSE':
      console.log('[VOICE] client_action: REVIEW_PRESCRIPTION_REGISTER_RESPONSE - 처방전 검토 화면을 표시합니다.');
      return true; // 데이터는 메인 컴포넌트에서 처리

    case 'CAPTURE_PILLS_PHOTO':
      console.log('[VOICE] client_action: CAPTURE_PILLS_PHOTO - 약 사진 촬영 화면으로 이동합니다.');
      navigation.navigate('Camera', {
        mode: 'pills',
        ...(options.params || {})
      });
      return true;

    case 'REVIEW_PILLS_PHTO_SEARCH_RESPONSE':
      console.log('[VOICE] client_action: REVIEW_PILLS_PHTO_SEARCH_RESPONSE - 알약 검색 결과를 표시합니다.');
      return true;

    default:
      console.log(`[VOICE] 정의되지 않은 액션: ${action}`);
      return false;
  }
};