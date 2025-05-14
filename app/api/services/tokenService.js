import { 
  getAccessToken, 
  getRefreshToken, 
  setAccessToken, 
  setRefreshToken, 
  removeAccessToken, 
  removeRefreshToken,
  setTokenExpiryTime,    // 추가
  removeTokenExpiryTime, // 추가
  getTokenExpiryTime     // 추가
} from '../storage';
import api from '../index';
import axios from 'axios';  // 추가
import { API_BASE_URL } from '@env';  // 추가
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
      console.log('[토큰 검증] 액세스 토큰이 없습니다');
      return false;
    }
    
    // 토큰 만료 시간 확인
    const expiryTime = await getTokenExpiryTime();
    const now = Date.now();
    
    // 만료 시간이 설정되어 있고, 5분 이내로 만료되거나 이미 만료된 경우 토큰 갱신
    if (expiryTime && (expiryTime - now < 5 * 60 * 1000)) {
      console.log('[토큰 검증] 토큰이 곧 만료됩니다. 갱신 시도...');
      console.log('[토큰 검증] 현재 시간:', new Date(now).toLocaleString());
      console.log('[토큰 검증] 만료 시간:', new Date(expiryTime).toLocaleString());
      return await refreshAuthToken();
    }
    
    try {
      // API 요청 헤더에 토큰 설정
      setAuthToken(accessToken);
      
      // 액세스 토큰으로 간단한 API 호출 시도 (사용자 정보 조회)
      await api.get('/user');
      console.log(new Date(expiryTime).toLocaleString())
      console.log('[토큰 검증] 토큰 유효성 확인 성공: 토큰이 유효합니다');
      return true; // API 호출 성공 시 토큰이 유효한 것으로 판단
    } catch (error) {
      // 401 또는 400 오류 발생 시 토큰 갱신 시도
      if (error.response?.status === 401 || error.response?.status === 400) {
        console.log(`[토큰 검증] 액세스 토큰이 유효하지 않습니다(${error.response?.status}). 토큰 갱신 시도...`);
        return await refreshAuthToken();
      }
      
      console.error('[토큰 검증] API 오류:', error.response?.status, error.message);
      return false; // 다른 오류는 토큰 유효하지 않은 것으로 처리
    }
  } catch (error) {
    console.error('[토큰 검증] 오류 발생:', error);
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
      console.log('[토큰 갱신] 리프레시 토큰이 없습니다');
      // 토큰 초기화
      await removeAccessToken();
      await removeRefreshToken();
      await removeTokenExpiryTime();  // 추가: 만료 시간도 함께 제거
      setAuthToken(null);
      return false;
    }
    
    // 토큰 갱신 API 호출 전에 로그 추가
    console.log('[토큰 갱신] 리프레시 토큰으로 갱신 시도:', refreshToken.substring(0, 10) + '...');
    
    // 토큰 갱신 API 호출 - 직접 axios 사용하여 인터셉터 순환 방지
    const response = await axios.post(
      `${API_BASE_URL}/open-api/auth/refresh`, 
      { refresh_token: refreshToken },
      { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: undefined  // 인증 헤더 명시적 제거
        }
      }
    );
    
    // 응답에서 토큰 정보 추출
    const { 
      access_token, 
      refresh_token,
      access_token_expired_at 
    } = response.data.body || {};
    
    if (access_token) {
      // 새 토큰 저장
      await setAccessToken(access_token);
      setAuthToken(access_token);
      
      // 토큰 만료 시간 저장
      if (access_token_expired_at) {
        const expiryTime = new Date(access_token_expired_at).getTime();
        await setTokenExpiryTime(expiryTime);
        console.log('[토큰 갱신] 새 토큰 만료 시간 저장:', new Date(expiryTime).toLocaleString());
      } else {
        // 만료 시간이 없으면 기본값으로 1시간 설정
        const oneHourLater = Date.now() + 60 * 60 * 1000;
        await setTokenExpiryTime(oneHourLater);
        console.log('[토큰 갱신] 기본 토큰 만료 시간 설정:', new Date(oneHourLater).toLocaleString());
      }
      
      if (refresh_token) {
        await setRefreshToken(refresh_token);
      }
      
      console.log('[토큰 갱신] 토큰 갱신 성공');
      return true;
    } else {
      console.log('[토큰 갱신] 실패: 새 토큰이 응답에 없습니다');
      // 토큰 초기화
      await removeAccessToken();
      await removeRefreshToken();
      await removeTokenExpiryTime();  // 추가: 만료 시간도 함께 제거
      setAuthToken(null);
      return false;
    }
  } catch (error) {
    console.error('[토큰 갱신] 오류 발생:', error.response?.status, error.message);
    
    // 갱신 실패 시 토큰 초기화
    await removeAccessToken();
    await removeRefreshToken();
    await removeTokenExpiryTime();  // 추가: 만료 시간도 함께 제거
    setAuthToken(null);
    
    return false;
  }
};

/**
 * 토큰의 남은 시간을 확인하는 함수
 * @returns {Promise<{isValid: boolean, timeLeft: number, formattedTimeLeft: string}>}
 */
export const checkTokenValidity = async () => {
  try {
    const expiryTime = await getTokenExpiryTime();
    const now = Date.now();
    
    if (!expiryTime) {
      return {
        isValid: false,
        timeLeft: 0,
        formattedTimeLeft: '만료됨'
      };
    }
    
    const timeLeft = expiryTime - now;
    const isValid = timeLeft > 0;
    
    // 남은 시간 형식화 (분:초)
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const formattedTimeLeft = `${minutes}분 ${seconds}초`;
    
    return {
      isValid,
      timeLeft,
      formattedTimeLeft,
      expiryDate: new Date(expiryTime).toLocaleString()
    };
  } catch (error) {
    console.error('[토큰 확인] 오류 발생:', error);
    return {
      isValid: false,
      timeLeft: 0,
      formattedTimeLeft: '오류'
    };
  }
};