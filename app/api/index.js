import axios from 'axios';
import {refreshToken} from './auth';
import {getAccessToken, getRefreshToken, setAccessToken} from './storage';
import {Platform} from 'react-native';

const API_BASE_URL = 'http://35.216.7.36:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

if (Platform.OS === 'ios') {
  require('node-libs-react-native/globals'); // iOS에서 SSL 문제 해결
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// accessToken을 Axios 전역 헤더에 저장
export const setAuthToken = token => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// 앱 실행 시 저장된 토큰 불러와서 Axios에 설정
export const loadAuthToken = async () => {
  const token = await getAccessToken();
  if (token) {
    setAuthToken(token);
  }
};

loadAuthToken(); // 앱 실행 시 실행

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // accessToken 만료 시
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // 저장된 refreshToken 가져오기
        const refreshTokenValue = await getRefreshToken();
        if (!refreshTokenValue) throw new Error('No refresh token');

        // 새 토큰 발급 시도
        const {data} = await refreshToken({refresh_token: refreshTokenValue});

        // 새 accessToken 저장
        await setAccessToken(data.accessToken);
        setAuthToken(data.accessToken);

        // 원래 요청 다시 실행
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error('토큰 재발급 실패:', err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
