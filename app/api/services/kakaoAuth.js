import { login, logout, getProfile } from '@react-native-seoul/kakao-login';
import {
  getFCMToken,
  setAccessToken,
  setRefreshToken,
  setUserInfo,
  setTokenExpiryTime,
  setLoginProvider
} from '../storage';
import { setAuthToken } from '..';
import api from '../index';

/**
 * 카카오 로그인 처리 함수
 */
export const kakaoLogin = async () => {
  try {
    const token = await login();
    const profile = await getProfile();
    const fcmToken = await getFCMToken();

    const response = await api.post('/open-api/auth/kakao', {
      access_token: token.accessToken,
      fcm_token: fcmToken || ''
    }, {
      headers: {
        Authorization: undefined,
        'Content-Type': 'application/json',
      },
    });

    const {
      access_token,
      refresh_token,
      access_token_expired_at
    } = response.data.body || {};

    if (access_token) {
      await setAccessToken(access_token);
      setAuthToken(access_token);
      await setLoginProvider('kakao');

      const expiryTime = access_token_expired_at
        ? new Date(access_token_expired_at).getTime()
        : Date.now() + 60 * 60 * 1000;
      await setTokenExpiryTime(expiryTime);

      await setUserInfo({
        name: profile?.nickname || '',
      });

      if (refresh_token) await setRefreshToken(refresh_token);

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        accessTokenExpiredAt: access_token_expired_at
      };
    } else {
      throw new Error('서버에서 토큰을 받지 못했습니다.');
    }
  } catch (error) {
    if (error.response?.status === 404) {
      error.userMessage = '카카오 계정으로 먼저 회원가입이 필요합니다.';
    } else {
      error.userMessage = '카카오 로그인에 실패했습니다: ' + (error.message || '알 수 없는 오류');
    }
    throw error;
  }
};

/**
 * 카카오 계정 탈퇴(회원 삭제)
 * TODO: 실제 카카오 연결 끊기 및 서버 연동 구현 필요
 */
export const deleteKakaoAccount = async (navigation) => {
  alert('카카오 계정 탈퇴는 추후 지원 예정입니다.');
  // TODO: 카카오 연결 해제 및 서버 /user/kakao/delete 구현
  return;
};