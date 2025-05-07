import api from './index';
import {getFCMToken} from './storage';

export const signUp = async data => {
  // FCM 토큰 가져오기
  const fcmToken = await getFCMToken();

  // 기존 데이터에 FCM 토큰 추가
  const requestData = {
    ...data,
    fcm_token: fcmToken || ''
  };

  return api.post('/open-api/auth/sign_up', requestData, {
    headers: {
      Authorization: undefined,
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    console.log('SignUp 응답:', response.data);
    return response;
  });
};

export const login = async data => {
  try {
    // FCM 토큰 가져오기
    const fcmToken = await getFCMToken();
    console.log('FCM 토큰:', fcmToken); // FCM 토큰 로깅
    // 기존 데이터에 FCM 토큰 추가
    const requestData = {
      ...data,
      fcm_token: fcmToken || ''
    };
    // login 함수 내부에 추가
    console.log('요청 데이터 구조:', JSON.stringify(requestData, null, 2));

    const response = await api.post('/open-api/auth/login', requestData);
    const {access_token, refresh_token} = response.data.body || {};

    if (!access_token || !refresh_token) {
      throw new Error('로그인 응답에 토큰이 없습니다.');
    }

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  } catch (error) {
    console.error('로그인 실패:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      alert('이메일 또는 비밀번호가 잘못되었습니다.');
    } else if (error.response?.status === 404) {
      alert('사용자를 찾을 수 없습니다.');
    } else {
      alert(
        '로그인 실패: ' + (error.response?.data?.message || '알 수 없는 오류'),
      );
    }

    throw error;
  }
};

export const refreshToken = async data => {
  try {
    const response = await api.post('/open-api/auth/refresh', data);
    if (!response.data?.accessToken) {
      throw new Error('토큰 재발급에 실패했습니다.');
    }
    return response.data;
  } catch (error) {
    console.error('토큰 재발급 실패:', error.response?.data || error.message);
    throw error;
  }
};

export const kakaoAuth = async (accessToken) => {
  try {
    // FCM 토큰 가져오기
    const fcmToken = await getFCMToken();
    
    const response = await api.post('/open-api/auth/kakao', {
      access_token: accessToken,
      fcm_token: fcmToken || ''
    });
    
    return response.data;
  } catch (error) {
    console.error('카카오 인증 실패:', error.response?.data || error.message);
    throw error;
  }
};