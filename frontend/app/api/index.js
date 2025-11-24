import axios from 'axios';
import { API_BASE_URL } from '@env';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  getTokenExpiryTime,
  setTokenExpiryTime,
  removeTokenExpiryTime
} from './storage';
import { Platform } from 'react-native';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

if (Platform.OS === 'ios') {
  require('node-libs-react-native/globals');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export const setAuthToken = token => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const loadAuthToken = async () => {
  const token = await getAccessToken();
  if (token) {
    setAuthToken(token);
  }
};

loadAuthToken();

const retryMap = new Map();

api.interceptors.request.use(
  async config => {
    if (config.url.includes('/auth/') || config._tokenCheck || config._retry) {
      return config;
    }
    try {
      const expiryTime = await getTokenExpiryTime();
      const now = Date.now();
      if (expiryTime && (expiryTime - now < 5 * 60 * 1000)) {
        config._tokenCheck = true;
        const refreshTokenValue = await getRefreshToken();
        if (!refreshTokenValue) {
          return config;
        }
        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/open-api/auth/refresh`,
            { refresh_token: refreshTokenValue },
            { headers: { Authorization: undefined } }
          );
          const { access_token, refresh_token, access_token_expired_at } = refreshResponse.data.body || {};
          if (access_token) {
            await setAccessToken(access_token);
            setAuthToken(access_token);
            if (access_token_expired_at) {
              await setTokenExpiryTime(new Date(access_token_expired_at).getTime());
            } else {
              await setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
            }
            if (refresh_token) {
              await setRefreshToken(refresh_token);
            }
            config.headers['Authorization'] = `Bearer ${access_token}`;
          }
        } catch (refreshError) {
        }
      }
    } catch (error) {
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    const requestKey = `${originalRequest.method}-${originalRequest.url}`;
    const retryCount = retryMap.get(requestKey) || 0;
    if ((error.response?.status === 401 || error.response?.status === 400) &&
      retryCount < 1 && !originalRequest._retry) {
      retryMap.set(requestKey, retryCount + 1);
      originalRequest._retry = true;
      try {
        const refreshTokenValue = await getRefreshToken();
        if (!refreshTokenValue) {
          throw new Error('리프레시 토큰 없음');
        }
        const response = await axios.post(
          `${API_BASE_URL}/open-api/auth/refresh`,
          { refresh_token: refreshTokenValue },
          {
            headers: { Authorization: undefined }
          }
        );
        const { access_token, refresh_token, access_token_expired_at } = response.data.body || {};
        if (!access_token) {
          throw new Error('토큰 갱신 실패: 새 토큰이 없습니다');
        }
        await setAccessToken(access_token);
        setAuthToken(access_token);
        if (access_token_expired_at) {
          await setTokenExpiryTime(new Date(access_token_expired_at).getTime());
        } else {
          await setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
        }
        if (refresh_token) {
          await setRefreshToken(refresh_token);
        }
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        retryMap.delete(requestKey);
        return api(originalRequest);
      } catch (err) {
        await removeAccessToken();
        await removeRefreshToken();
        await removeTokenExpiryTime();
        setAuthToken(null);
        retryMap.delete(requestKey);
      }
    }
    return Promise.reject(error);
  },
);

export default api;