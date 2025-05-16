import axios from 'axios';
import {API_BASE_URL_PILL} from '@env';
import {getAccessToken, getRefreshToken, setAccessToken} from '../api/storage';
import {refreshToken} from './auth';
import {Platform} from 'react-native';

// axios 인스턴스 생성 및 설정
const pillApi = axios.create({
  baseURL: API_BASE_URL_PILL,
  timeout: 60000, // 타임아웃 증가
  maxContentLength: 50 * 1024 * 1024, // 최대 컨텐츠 길이 설정
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data',
    'Connection': 'keep-alive', // 연결 유지 헤더 추가
  },
});

// SSL 인증서 검증 우회 설정 (모든 플랫폼에 적용)
require('node-libs-react-native/globals');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// accessToken 설정 함수
export const setPillAuthToken = token => {
  if (token) {
    pillApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete pillApi.defaults.headers.common['Authorization'];
  }
};

// 앱 실행 시 저장된 토큰 불러와서 설정
export const loadPillAuthToken = async () => {
  const token = await getAccessToken();
  if (token) {
    setPillAuthToken(token);
  }
};

// 토큰 로드 실행
loadPillAuthToken();

// 요청 인터셉터 - 디버깅용
pillApi.interceptors.request.use(
  config => {
    console.log(`[API 요청] ${config.method?.toUpperCase()} ${config.url}`, 
      `플랫폼: ${Platform.OS}`, new Date().toISOString());
    return config;
  },
  error => {
    console.error('[API 요청 오류]', error.message);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 갱신 및 디버깅
pillApi.interceptors.response.use(
  response => {
    console.log(`[API 응답] 성공: ${response.status}`, 
      `플랫폼: ${Platform.OS}`, new Date().toISOString());
    return response;
  },
  async error => {
    console.error('[API 응답 오류]', 
      error.response ? 
        `상태: ${error.response.status}, 메시지: ${error.message}` : 
        `네트워크 오류: ${error.message}`);
    
    const originalRequest = error.config;

    // 401 에러(권한 없음) 처리 및 토큰 재발급
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshTokenValue = await getRefreshToken();
        if (!refreshTokenValue) throw new Error('No refresh token');

        const {data} = await refreshToken({refresh_token: refreshTokenValue});

        await setAccessToken(data.accessToken);
        setPillAuthToken(data.accessToken);

        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return pillApi(originalRequest);
      } catch (err) {
        console.error('토큰 재발급 실패:', err);
      }
    }

    return Promise.reject(error);
  }
);

// 알약 검색 API 함수
export const searchPillByImage = async (imageUri, topK = 5) => {
  console.log('검색 시작 - 이미지 경로:', imageUri);
  
  const formData = new FormData();
  
  // 플랫폼별 이미지 처리 방식 구분
  if (Platform.OS === 'android') {
    // Android에서는 원본 URI 사용 (file:// 유지)
    formData.append('file', {
      uri: imageUri, // 원본 경로 유지
      type: 'image/jpeg', // 항상 JPEG으로 통일
      name: 'pill_image.jpg',
    });
    console.log('Android 이미지 처리:', imageUri);
  } else {
    // iOS 처리 방식
    const cleanUri = imageUri.replace('file://', '');
    const fileType = cleanUri.endsWith('.heic') ? 'image/heic' : 'image/jpeg';
    formData.append('file', {
      uri: cleanUri,
      type: fileType,
      name: `pill_image.${fileType === 'image/heic' ? 'heic' : 'jpg'}`,
    });
    console.log('iOS 이미지 처리:', cleanUri);
  }

  try {
    console.log('API 요청 준비 완료', formData);
    
    // 요청 옵션 설정
    const requestConfig = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'X-Platform': Platform.OS, // 디버깅용 플랫폼 정보
      },
      timeout: 60000, // 60초 타임아웃
    };
    
    // API 요청 실행
    const response = await pillApi.post(
      `/v2/medicine/image?top_k=${topK}`,
      formData,
      requestConfig,
    );

    console.log('API 요청 완료, 상태:', response.status);

    if (response.data?.status !== 'success') {
      throw new Error('검색 결과 없음');
    }

    console.log('API 응답:', response.data);

    // 응답 구조 매핑
    const searchResults = response.data.results.map(item => ({
      drugShape: item.analysis.drug_shape,
      colorClasses: item.analysis.color_classes,
      imprint: item.analysis.imprint,
      searchResults: item.search_results.map(result => ({
        score: result.score,
        itemSeq: result.data.item_seq,
        printFront: result.data.print_front,
        printBack: result.data.print_back,
        drugShape: result.data.drug_shape,
        colorClasses: result.data.color_classes,
        colorGroup: result.data.color_group,
        shapeGroup: result.data.shape_group,
      })),
    }));

    return searchResults;
  } catch (error) {
    // 상세한 에러 정보 로깅
    console.error('알약 검색 실패 상세:', {
      message: error.message,
      code: error.code || 'no_code',
      stack: error.stack || 'no_stack',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL,
      } : 'no_config',
      request: error.request ? {
        _response: error.request._response,
        status: error.request.status,
        responseURL: error.request.responseURL,
      } : 'no_request',
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : 'no_response',
    });
    
    throw error;
  }
};

export default pillApi;