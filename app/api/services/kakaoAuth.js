// api/services/kakaoAuth.js
import { login, logout, getProfile } from '@react-native-seoul/kakao-login';
import { login as serverLogin } from '../auth';
import { setAccessToken, setRefreshToken, setUserInfo } from '../storage';
import { setAuthToken } from '..';

export const kakaoLogin = async () => {
  try {
    // 카카오 SDK로 로그인
    const token = await login();
    console.log('카카오 로그인 성공', token);
    
    // 옵션: 카카오 프로필 정보 가져오기
    const profile = await getProfile();
    console.log('카카오 프로필', profile);
    
    // 서버에 카카오 토큰 전송하여 자체 토큰 받기
    const response = await serverKakaoLogin(token.accessToken);
    
    // 응답에서 토큰 정보 확인 및 저장
    const { access_token, refresh_token } = response?.body || {};
    
    if (access_token) {
      await setAccessToken(access_token);
      setAuthToken(access_token);
      
      // 유저 정보가 응답에 있다면 저장
      if (response?.body?.user) {
        await setUserInfo({
          name: response.body.user.name || '',
          gender: response.body.user.gender || '',
          birthday: response.body.user.birthday || '',
        });
      }
      
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        userInfo: response?.body?.user
      };
    } else {
      throw new Error('서버에서 토큰을 받지 못했습니다.');
    }
    
  } catch (error) {
    console.error('카카오 로그인 실패', error);
    throw error;
  }
};

// 서버에 카카오 토큰을 보내 자체 토큰 받기
const serverKakaoLogin = async (kakaoAccessToken) => {
  try {
    // 서버의 카카오 로그인 엔드포인트에 요청
    const response = await fetch('https://api.medeasy.dev/open-api/auth/kakao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: kakaoAccessToken
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '서버 응답 오류');
    }
    
    return data;
  } catch (error) {
    console.error('서버 카카오 로그인 실패:', error);
    throw error;
  }
};

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
