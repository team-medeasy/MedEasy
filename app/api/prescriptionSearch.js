import axios from 'axios';
import { API_BASE_URL } from '@env';
import {getAccessToken} from './storage'; // AccessToken 가져오기

/**
 * 처방전 이미지를 분석하여 약 정보를 추출하는 API
 * @param {string} imageUri - 처방전 이미지 로컬 경로
 * @returns {Promise} 처방전 분석 결과
 */
export const searchPrescriptionByImage = async (imageUri) => {
  const formData = new FormData();

  // 이미지 파일 경로 정리 및 타입 설정
  const cleanUri = imageUri.replace('file://', '');
  const fileType = cleanUri.endsWith('.heic') ? 'image/heic' : 'image/jpeg';

  // FormData에 이미지 추가
  formData.append('image', {
    uri: cleanUri,
    type: fileType,
    name: `prescription_${Date.now()}.${fileType === 'image/heic' ? 'heic' : 'jpg'}`,
  });

  console.log('처방전 이미지 전송 준비:', cleanUri);

  try {
    // 토큰 가져오기
    const token = await getAccessToken();
    
    // API 호출
    const response = await axios.post(`${API_BASE_URL}/routine/prescription`, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('처방전 OCR API 응답:', response.data);

    // 응답 검증
    if (!response.data || !response.data.result || response.data.result.result_code !== 200) {
      throw new Error('처방전 분석 실패: 서버 응답 오류');
    }

    return response.data;
  } catch (error) {
    console.error('처방전 OCR API 오류:', error);
    
    // 상세 오류 로깅
    if (error.response) {
      console.error('서버 오류 응답:', error.response.data);
      console.error('서버 오류 상태:', error.response.status);
    } else if (error.request) {
      console.error('응답 없음:', error.request);
    } else {
      console.error('요청 설정 오류:', error.message);
    }
    
    throw error;
  }
};

/**
 * 처방전 기반 루틴 리스트 등록 API
 * @param {Array} routineRequests - 루틴 등록 요청 데이터 리스트
 * @returns {Promise} 루틴 등록 결과
 */
export const registerRoutineList = async (routineRequests) => {
  try {
    // 토큰 가져오기
    const token = await getAccessToken();
    
    // API 호출
    const response = await axios.post(`${API_BASE_URL}/routine/list`, routineRequests, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('루틴 리스트 등록 API 응답:', response.data);

    // 응답 검증
    if (!response.data || !response.data.result || response.data.result.result_code !== 200) {
      throw new Error('루틴 등록 실패: 서버 응답 오류');
    }

    return response.data;
  } catch (error) {
    console.error('루틴 등록 API 오류:', error);
    throw error;
  }
};

export default {
  searchPrescriptionByImage,
  registerRoutineList,
};