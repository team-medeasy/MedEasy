// api/services/kakaoAuth.js
import { login, logout, getProfile } from '@react-native-seoul/kakao-login';
import { getFCMToken } from '../storage';
import { setAccessToken, setRefreshToken, setUserInfo } from '../storage';
import { setAuthToken } from '..';
import api from '../index';

/**
 * 카카오 로그인 처리 함수
 * 기존 코드 구조를 최대한 유지하면서 FCM 토큰만 추가
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
    });
    
    console.log('서버 카카오 로그인 응답:', response.data);
    
    // 응답에서 토큰 정보 확인 및 저장
    const { access_token, refresh_token } = response.data.body || {};
    
    if (access_token) {
      await setAccessToken(access_token);
      setAuthToken(access_token);
      
      // 사용자 정보는 최소한으로만 저장 (이름만)
      await setUserInfo({
        name: profile?.nickname || '',
      });
      
      if (refresh_token) {
        await setRefreshToken(refresh_token);
      }
      
      return {
        accessToken: access_token,
        refreshToken: refresh_token
      };
    } else {
      throw new Error('서버에서 토큰을 받지 못했습니다.');
    }
    
  } catch (error) {
    console.error('카카오 로그인 실패', error);
    throw error;
  }
};

/**
 * 카카오 로그아웃 함수
 */
export const kakaoLogout = async () => {
  try {
    const message = await logout();
    console.log('카카오 로그아웃 성공', message);
    return message;
  } catch (error) {
    console.error('카카오 로그아웃 실패', error);
    throw error;
  }
};