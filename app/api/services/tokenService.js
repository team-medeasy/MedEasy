// api/services/tokenService.js
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, removeAccessToken, removeRefreshToken } from '../storage';
import api from '../index';
import { setAuthToken } from '..';

/**
 * 토큰 유효성 검증 및 필요시 갱신
 * @returns {Promise<boolean>} 토큰이 유효하면 true, 그렇지 않으면 false
 */
export const validateAndRefreshToken = async () => {
  try {
    const accessToken = await getAccessToken();
    
    // 토큰이 없으면 즉시 false 반환
    if (!accessToken) {
      console.log('액세스 토큰이 없습니다');
      return false;
    }
    
    try {
      // API 요청 헤더에 토큰 설정
      setAuthToken(accessToken);
      
      // 액세스 토큰으로 간단한 API 호출 시도 (사용자 정보 조회)
      await api.get('/user');
      console.log('토큰 유효성 확인 성공: 토큰이 유효합니다');
      return true; // API 호출 성공 시 토큰이 유효한 것으로 판단
    } catch (error) {
      // 401 에러 발생 시 토큰 갱신 시도
      if (error.response?.status === 401) {
        console.log('액세스 토큰이 만료되었습니다. 토큰 갱신 시도...');
        return await refreshAuthToken();
      }
      
      console.error('토큰 검증 중 API 오류:', error.response?.status, error.message);
      return false; // 401 이외의 에러는 토큰 유효하지 않은 것으로 처리
    }
  } catch (error) {
    console.error('토큰 검증 중 오류 발생:', error);
    return false;
  }
};

/**
 * 리프레시 토큰을 사용하여 액세스 토큰 갱신
 * @returns {Promise<boolean>} 갱신 성공 시 true, 실패 시 false
 */
export const refreshAuthToken = async () => {
  try {
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      console.log('리프레시 토큰이 없습니다');
      return false;
    }
    
    // 토큰 갱신 API 호출
    const response = await api.post('/open-api/auth/refresh', {
      refresh_token: refreshToken
    });
    
    // 응답에서 토큰 정보 추출
    const { access_token, refresh_token } = response.data.body || {};
    
    if (access_token) {
      // 새 토큰 저장
      await setAccessToken(access_token);
      setAuthToken(access_token);
      
      if (refresh_token) {
        await setRefreshToken(refresh_token);
      }
      
      console.log('토큰 갱신 성공');
      return true;
    } else {
      console.log('토큰 갱신 실패: 새 토큰이 응답에 없습니다');
      return false;
    }
  } catch (error) {
    console.error('토큰 갱신 중 오류 발생:', error.response?.status, error.message);
    
    // 갱신 실패 시 토큰 초기화
    await removeAccessToken();
    await removeRefreshToken();
    setAuthToken(null);
    
    return false;
  }
};