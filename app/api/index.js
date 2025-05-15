import axios from 'axios';
import {API_BASE_URL} from '@env';
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

// 요청 인터셉터 추가 - 요청 전에 토큰 유효성 확인
api.interceptors.request.use(
  async config => {
    // 인증 관련 API 호출이거나 이미 재시도 중인 요청은 그대로 진행
    if (config.url.includes('/auth/') || config._tokenCheck || config._retry) {
      return config;
    }
    
    try {
      // 토큰 만료 시간 확인
      const expiryTime = await getTokenExpiryTime();
      const now = Date.now();
      
      // 만료 시간이 설정되어 있고, 5분 이내로 만료되거나 이미 만료된 경우
      if (expiryTime && (expiryTime - now < 5 * 60 * 1000)) {
        console.log('[API] 토큰이 곧 만료됩니다. 사전 갱신 시도...');
        
        // 토큰 체크 중임을 표시
        config._tokenCheck = true;
        
        // 리프레시 토큰 가져오기
        const refreshTokenValue = await getRefreshToken();
        if (!refreshTokenValue) {
          console.log('[API] 리프레시 토큰이 없습니다. 토큰 갱신 불가');
          return config;
        }
        
        try {
          // 별도의 인스턴스로 토큰 갱신 (인터셉터 재귀 호출 방지)
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/open-api/auth/refresh`,
            { refresh_token: refreshTokenValue },
            { headers: { Authorization: undefined } }
          );
          
          // 응답에서 새 토큰 추출
          const { access_token, refresh_token, access_token_expired_at } = refreshResponse.data.body || {};
          
          if (access_token) {
            // 새 토큰 저장
            await setAccessToken(access_token);
            setAuthToken(access_token);
            
            // 새 만료 시간 저장
            if (access_token_expired_at) {
              await setTokenExpiryTime(new Date(access_token_expired_at).getTime());
            } else {
              // 서버가 만료 시간을 제공하지 않으면 1시간으로 설정
              await setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
            }
            
            if (refresh_token) {
              await setRefreshToken(refresh_token);
            }
            
            // 현재 요청의 헤더에 새 토큰 설정
            config.headers['Authorization'] = `Bearer ${access_token}`;
            console.log('[API] 사전 토큰 갱신 성공');
          }
        } catch (refreshError) {
          console.error('[API] 사전 토큰 갱신 실패:', refreshError.message);
          // 갱신 실패해도 일단 기존 토큰으로 요청 진행 (응답 인터셉터에서 다시 시도)
        }
      }
    } catch (error) {
      console.error('[API] 토큰 검사 중 오류 발생:', error.message);
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// 응답 인터셉터 - 401과 400 오류 모두 처리
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    
    // 이미 재시도 중인 요청은 추적을 위한 고유 키 생성
    const requestKey = `${originalRequest.method}-${originalRequest.url}`;
    const retryCount = retryMap.get(requestKey) || 0;
    
    // 401 또는 400 오류이고 최대 재시도 횟수(1)보다 작을 경우에만 재시도
    if ((error.response?.status === 401 || error.response?.status === 400) && 
        retryCount < 1 && !originalRequest._retry) {
      // 재시도 횟수 증가 및 재시도 플래그 설정
      retryMap.set(requestKey, retryCount + 1);
      originalRequest._retry = true;
      
      try {
        // 저장된 refreshToken 가져오기
        const refreshTokenValue = await getRefreshToken();
        if (!refreshTokenValue) {
          throw new Error('리프레시 토큰 없음');
        }

        console.log(`[API] ${error.response.status} 오류 발생, 토큰 갱신 시도...`);
        
        // 토큰 갱신 API 호출
        const response = await axios.post(
          `${API_BASE_URL}/open-api/auth/refresh`,
          { refresh_token: refreshTokenValue },
          {
            headers: { Authorization: undefined }
          }
        );

        // 응답에서 새 토큰 추출
        const { access_token, refresh_token, access_token_expired_at } = response.data.body || {};
        
        if (!access_token) {
          throw new Error('토큰 갱신 실패: 새 토큰이 없습니다');
        }

        // 새 토큰 저장
        await setAccessToken(access_token);
        setAuthToken(access_token);
        
        // 새 만료 시간 저장
        if (access_token_expired_at) {
          await setTokenExpiryTime(new Date(access_token_expired_at).getTime());
        } else {
          // 서버가 만료 시간을 제공하지 않으면 1시간으로 설정
          await setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
        }
        
        if (refresh_token) {
          await setRefreshToken(refresh_token);
        }
        
        // API 요청 헤더에 새 토큰 설정
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        
        console.log('[API] 토큰 갱신 성공, 원래 요청 재시도');
        
        // 재시도 맵에서 항목 제거
        retryMap.delete(requestKey);
        
        // 원래 요청 다시 실행
        return api(originalRequest);
      } catch (err) {
        console.error('[API] 토큰 갱신 실패:', err.message);
        
        // 토큰 갱신 실패 시 저장된 토큰 삭제
        await removeAccessToken();
        await removeRefreshToken();
        await removeTokenExpiryTime();
        setAuthToken(null);
        
        // 재시도 맵에서 항목 제거
        retryMap.delete(requestKey);
        
        // 여기에 로그인 화면으로 강제 이동 로직 추가 가능
        // 앱의 네비게이션 이벤트 발행 추가 예정
      }
    }

    return Promise.reject(error);
  },
);

export default api;
