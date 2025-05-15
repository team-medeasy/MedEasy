import api from './index';
import axios from 'axios';
import {API_BASE_URL} from '@env';
import {
  getFCMToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  setTokenExpiryTime
} from './storage';

export const signUp = async data => {
  // FCM 토큰 가져오기
  const fcmToken = await getFCMToken();

  // 기존 데이터에 FCM 토큰 추가
  const requestData = {
    ...data,
    fcm_token: fcmToken || ''
  };

  const response = await api.post('/open-api/auth/sign_up', requestData, {
    headers: {
      Authorization: undefined,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('SignUp 응답:', response.data);
  
  // 토큰 정보 추출
  const {
    access_token,
    refresh_token,
    access_token_expired_at
  } = response.data.body || {};
  
  return {
    response,
    accessToken: access_token,
    refreshToken: refresh_token,
    accessTokenExpiredAt: access_token_expired_at
  };
};

export const login = async data => {
  try {
    // FCM 토큰 가져오기
    const fcmToken = await getFCMToken();
    console.log('FCM 토큰:', fcmToken || '없음'); // FCM 토큰 로깅
    
    // 기존 데이터에 FCM 토큰 추가
    const requestData = {
      ...data,
      fcm_token: fcmToken || ''
    };
    
    console.log('요청 데이터 구조:', JSON.stringify(requestData, null, 2));

    const response = await api.post('/open-api/auth/login', requestData, {
      headers: {
        Authorization: undefined, // 이전 세션의 토큰이 있을 경우 제거
        'Content-Type': 'application/json',
      }
    });
    
    // 토큰 정보 추출 - 만료 시간도 함께 가져옴
    const {
      access_token, 
      refresh_token, 
      access_token_expired_at,
      refresh_token_expired_at
    } = response.data.body || {};

    if (!access_token || !refresh_token) {
      throw new Error('로그인 응답에 토큰이 없습니다.');
    }

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      accessTokenExpiredAt: access_token_expired_at,
      refreshTokenExpiredAt: refresh_token_expired_at
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

export const refreshToken = async (refreshTokenValue) => {
  try {
    // 인자로 받은 값이 없으면 스토리지에서 가져옴
    if (!refreshTokenValue) {
      refreshTokenValue = await getRefreshToken();
      
      if (!refreshTokenValue) {
        throw new Error('리프레시 토큰이 없습니다.');
      }
    }
    
    // 인터셉터를 타지 않도록 axios 직접 호출
    const response = await axios.post(
      `${API_BASE_URL}/open-api/auth/refresh`, 
      { refresh_token: refreshTokenValue },
      { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: undefined // 인증 헤더 명시적 제거
        }
      }
    );
    
    // 응답에서 토큰 정보 추출
    const { 
      access_token, 
      refresh_token,
      access_token_expired_at 
    } = response.data.body || {};
    
    if (!access_token) {
      throw new Error('토큰 갱신 응답에 새 토큰이 없습니다.');
    }
    
    // 새 토큰 저장 (호출자에서 처리할 수 있도록 반환만 함)
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      accessTokenExpiredAt: access_token_expired_at
    };
  } catch (error) {
    console.error('토큰 갱신 실패:', error.response?.data || error.message);
    throw error;
  }
};

export const kakaoAuth = async (accessToken) => {
  try {
    // FCM 토큰 가져오기
    const fcmToken = await getFCMToken();
    console.log('카카오 로그인 FCM 토큰:', fcmToken || '없음');
    
    const response = await api.post('/open-api/auth/kakao', {
      access_token: accessToken,
      fcm_token: fcmToken || ''
    }, {
      headers: {
        Authorization: undefined, // 인증 헤더 명시적 제거
        'Content-Type': 'application/json',
      },
    });
    
    // 응답에서 토큰 정보 추출
    const { 
      access_token, 
      refresh_token,
      access_token_expired_at
    } = response.data.body || {};
    
    if (!access_token || !refresh_token) {
      throw new Error('카카오 인증 응답에 토큰이 없습니다.');
    }
    
    return {
      data: response.data,
      accessToken: access_token,
      refreshToken: refresh_token,
      accessTokenExpiredAt: access_token_expired_at
    };
  } catch (error) {
    console.error('카카오 인증 실패:', error.response?.data || error.message);
    throw error;
  }
};