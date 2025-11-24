import api from './index';

/**
 * 특정 의약품의 금기 정보 및 병용 금기 의약품 검사
 * @param {string} itemSeq - 금기 여부를 검사할 의약품의 item_seq
 * @returns {Promise<Object>} - 금기 정보 및 병용금기 결과
 */
export const getContraindicationInfo = async (itemSeq) => {
  try {
    const response = await api.get(`/medicine/current/contraindications/${itemSeq}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('[내부 DUR API] 금기 정보 조회 실패:', error.message);
    // 에러 응답에서 상태 코드 추출
    const status = error.response?.status;
    
    return {
      success: false,
      status: status, // 상태 코드 추가 (404, 500 등)
      error: error.response?.data?.message || error.message
    };
  }
};