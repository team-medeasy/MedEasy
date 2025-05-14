import axios from 'axios';
import {API_BASE_URL} from '@env';
import {refreshToken} from './auth';
import {getAccessToken, getRefreshToken, setAccessToken} from './storage';
import {Platform} from 'react-native';

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

const retryMap = new Map();

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // 이미 재시도 중인 요청은 추적을 위한 고유 키 생성
    const requestKey = `${originalRequest.method}-${originalRequest.url}`;
    const retryCount = retryMap.get(requestKey) || 0;
    
    // 401 오류이고 최대 재시도 횟수(1)보다 작을 경우에만 재시도
    if (error.response?.status === 401 && retryCount < 1 && !originalRequest._retry) {
      // 재시도 횟수 증가 및 재시도 플래그 설정
      retryMap.set(requestKey, retryCount + 1);
      originalRequest._retry = true;
      
      try {
        // 저장된 refreshToken 가져오기
        const refreshTokenValue = await getRefreshToken();
        if (!refreshTokenValue) {
          throw new Error('리프레시 토큰 없음');
        }

        console.log('[API] 401 오류 발생, 토큰 갱신 시도...');
        
        // 토큰 갱신 API 호출
        const response = await api.post('/open-api/auth/refresh', {
          refresh_token: refreshTokenValue
        }, {
          // 갱신 요청 자체가 재시도되지 않도록 플래그 설정
          _retry: true, 
          headers: {
            Authorization: undefined
          }
        });

        // 응답에서 새 토큰 추출
        const { access_token, refresh_token } = response.data.body || {};
        
        if (!access_token) {
          throw new Error('토큰 갱신 실패: 새 토큰이 없습니다');
        }

        // 새 토큰 저장
        await setAccessToken(access_token);
        if (refresh_token) {
          await setRefreshToken(refresh_token);
        }
        
        // API 요청 헤더에 새 토큰 설정
        setAuthToken(access_token);
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        
        console.log('[API] 토큰 갱신 성공, 원래 요청 재시도');
        
        // 재시도 맵에서 항목 제거
        retryMap.delete(requestKey);
        
        // 원래 요청 다시 실행
        return api(originalRequest);
      } catch (err) {
        console.error('[API] 토큰 갱신 실패:', err);
        
        // 토큰 갱신 실패 시 저장된 토큰 삭제
        await removeAccessToken();
        await removeRefreshToken();
        setAuthToken(null);
        
        // 재시도 맵에서 항목 제거
        retryMap.delete(requestKey);
        
        // 여기에 로그인 화면으로 강제 이동 로직 추가 가능
        // 예: 이벤트 발행 또는 네비게이션 리셋
      }
    }

    return Promise.reject(error);
  },
);

export default api;
