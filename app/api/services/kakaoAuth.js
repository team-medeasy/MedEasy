// api/services/kakaoAuth.js
import { login, logout, getProfile } from '@react-native-seoul/kakao-login';
import { 
  getFCMToken, 
  setAccessToken, 
  setRefreshToken, 
  setUserInfo,
  setTokenExpiryTime  // 추가: 토큰 만료 시간 저장 함수
} from '../storage';
import { setAuthToken } from '..';
import api from '../index';

/**
 * 카카오 로그인 처리 함수
 */
export const kakaoLogin = async () => {
  try {
    // 카카오 SDK로 로그인
    const token = await login();
    console.log('카카오 로그인 성공', token);
    
    // 카카오 프로필 정보 가져오기 (선택사항)
    const profile = await getProfile();
    console.log('카카오 프로필', profile);
    
    // FCM 토큰 가져오기
    const fcmToken = await getFCMToken();
    console.log('FCM 토큰:', fcmToken || '없음');
    
    // 서버에 카카오 토큰 전송하여 자체 토큰 받기
    const response = await api.post('/open-api/auth/kakao', {
      access_token: token.accessToken,
      fcm_token: fcmToken || ''
    }, {
      headers: {
        Authorization: undefined, // 이전 인증 헤더가 있을 경우 제거
        'Content-Type': 'application/json',
      },
    });
    
    console.log('서버 카카오 로그인 응답:', response.data);
    
    // 응답에서 토큰 정보 확인 및 저장
    const { 
      access_token, 
      refresh_token,
      access_token_expired_at  // 만료 시간 추출
    } = response.data.body || {};
    
    if (access_token) {
      // 액세스 토큰 저장 및 설정
      await setAccessToken(access_token);
      setAuthToken(access_token);
      
      // 토큰 만료 시간 저장
      if (access_token_expired_at) {
        const expiryTime = new Date(access_token_expired_at).getTime();
        await setTokenExpiryTime(expiryTime);
        console.log('[카카오 로그인] 토큰 만료 시간 저장:', new Date(expiryTime).toLocaleString());
      } else {
        // 만료 시간이 없으면 기본값으로 1시간 설정
        const oneHourLater = Date.now() + 60 * 60 * 1000;
        await setTokenExpiryTime(oneHourLater);
        console.log('[카카오 로그인] 기본 토큰 만료 시간 설정:', new Date(oneHourLater).toLocaleString());
      }
      
      // 사용자 정보는 최소한으로만 저장 (이름만)
      await setUserInfo({
        name: profile?.nickname || '',
      });
      
      // 리프레시 토큰 저장
      if (refresh_token) {
        await setRefreshToken(refresh_token);
      }
      
      // 결과 반환 (만료 시간 포함)
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        accessTokenExpiredAt: access_token_expired_at
      };
    } else {
      throw new Error('서버에서 토큰을 받지 못했습니다.');
    }
    
  } catch (error) {
    console.error('카카오 로그인 실패:', error.response?.data || error);
    
    // 사용자 친화적인 에러 메시지를 오류 객체에 추가
    if (error.response?.status === 404) {
      error.userMessage = '카카오 계정으로 먼저 회원가입이 필요합니다.';
    } else {
      error.userMessage = '카카오 로그인에 실패했습니다: ' + (error.message || '알 수 없는 오류');
    }
    
    throw error;
  }
};

/**
 * 카카오 로그아웃 함수
 */
export const kakaoLogout = async () => {
  try {
    const message = await logout();
    console.log('카카오 로그아웃 성공:', message);
    return message;
  } catch (error) {
    console.error('카카오 로그아웃 실패:', error);
    throw error;
  }
};