import axios from 'axios';
import {NOTIFICATION_API_URL} from '@env';
import {getAccessToken} from './storage';

const notificationApi = axios.create({
  baseURL: NOTIFICATION_API_URL,
  timeout: 10000,
});

// 요청 전에 accessToken 자동 추가
notificationApi.interceptors.request.use(async config => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default notificationApi;
