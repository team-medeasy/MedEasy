import axios from 'axios';
import {API_BASE_URL_PILL} from '@env';
import {getAccessToken, getRefreshToken, setAccessToken} from '../api/storage';
import {refreshToken} from './auth';
import {Platform} from 'react-native';

const pillApi = axios.create({
  baseURL: API_BASE_URL_PILL,
  timeout: 10000,
});

if (Platform.OS === 'ios') {
  require('node-libs-react-native/globals');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

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

loadPillAuthToken(); // 앱 실행 시 실행

// 토큰 재발급 및 에러 핸들링
pillApi.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

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
  },
);

// 알약 검색 API 함수
export const searchPillByImage = async (imageUri, topK = 5) => {
  const formData = new FormData();

  // 파일 타입 자동 설정
  const cleanUri = imageUri.replace('file://', '');
  const fileType = cleanUri.endsWith('.heic') ? 'image/heic' : 'image/jpeg';

  formData.append('file', {
    uri: cleanUri,
    type: fileType,
    name: `pill_image.${fileType === 'image/heic' ? 'heic' : 'jpg'}`,
  });

  console.log('Uploading file:', cleanUri, fileType);

  try {
    const response = await pillApi.post(
      `/v2/medicine/image?top_k=${topK}`,
      formData,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      },
    );

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
    console.error('알약 검색 실패:', error);
    throw error;
  }
};

export default pillApi;
