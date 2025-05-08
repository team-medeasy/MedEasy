// durApiClient.js
import axios from 'axios';
import {
  API_BASE_URL_DUR,
  DATA_PORTAL_SERVICE_KEY,
  DUR_PWNM_TABOO,
  DUR_ODSN_TABOO,
  DUR_USJNT_TABOO
} from '@env';
import { Platform } from 'react-native';

// DUR API 클라이언트 생성
const durApi = axios.create({
  baseURL: API_BASE_URL_DUR,
  timeout: 10000,
  params: {
    serviceKey: DATA_PORTAL_SERVICE_KEY,
    type: 'json'
  }
});

// iOS에서 SSL 인증서 검증 무시 설정 (개발 환경에서만 사용)
if (Platform.OS === 'ios') {
  require('node-libs-react-native/globals');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * 임부금기 정보 조회 함수
 * @param {string} itemSeq - 의약품 품목 일련번호
 * @returns {Promise<Object>} - 임부금기 정보
 */
export const fetchPregnancyWarning = async (itemSeq) => {
  try {
    console.log(`[DUR API] 임부금기 정보 조회: ${itemSeq}`);
    
    const response = await durApi.get(`/${DUR_PWNM_TABOO}`, {
      params: {
        itemSeq
      }
    });
    
    // 응답 데이터 가공 및 반환
    if (response.data?.body?.totalCount > 0) {
      const warningInfo = response.data.body.items[0];
      return {
        success: true,
        hasWarning: true,
        warningInfo,
        warningType: 'PREGNANCY',
        content: warningInfo.PROHBT_CONTENT,
      };
    } else {
      return {
        success: true,
        hasWarning: false,
        warningInfo: null,
        warningType: 'PREGNANCY',
        content: '임부금기 정보가 없습니다.'
      };
    }
  } catch (error) {
    console.error('[DUR API] 임부금기 정보 조회 중 오류 발생:', error);
    return {
      success: false,
      hasWarning: false,
      warningType: 'PREGNANCY',
      error: error.response?.data?.header?.resultMsg || error.message,
      content: '임부금기 정보를 불러오는 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 노인주의 정보 조회 함수
 * @param {string} itemSeq - 의약품 품목 일련번호
 * @returns {Promise<Object>} - 노인주의 정보
 */
export const fetchElderlyWarning = async (itemSeq) => {
  try {
    console.log(`[DUR API] 노인주의 정보 조회: ${itemSeq}`);
    
    const response = await durApi.get(`/${DUR_ODSN_TABOO}`, {
      params: {
        itemSeq
      }
    });
    
    // 응답 데이터 가공 및 반환
    if (response.data?.body?.totalCount > 0) {
      const warningInfo = response.data.body.items[0];
      return {
        success: true,
        hasWarning: true,
        warningInfo,
        warningType: 'ELDERLY',
        content: warningInfo.PROHBT_CONTENT,
      };
    } else {
      return {
        success: true,
        hasWarning: false,
        warningInfo: null,
        warningType: 'ELDERLY',
        content: '노인주의 정보가 없습니다.'
      };
    }
  } catch (error) {
    console.error('[DUR API] 노인주의 정보 조회 중 오류 발생:', error);
    return {
      success: false,
      hasWarning: false,
      warningType: 'ELDERLY',
      error: error.response?.data?.header?.resultMsg || error.message,
      content: '노인주의 정보를 불러오는 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 병용금기 정보 조회 함수
 * @param {string} itemSeq - 의약품 품목 일련번호
 * @returns {Promise<Object>} - 병용금기 정보
 */
export const fetchCombinationWarning = async (itemSeq) => {
  try {
    console.log(`[DUR API] 병용금기 정보 조회: ${itemSeq}`);
    // 요청 url 보기
    console.log('병용금기 요청 URL:', `${API_BASE_URL_DUR}/${DUR_USJNT_TABOO}?itemSeq=${itemSeq}`);
    const response = await durApi.get(`/${DUR_USJNT_TABOO}`, {
      params: {
        itemSeq,
        numOfRows: 100 // 충분한 결과 확보
      }
    });

    // 응답 메시지 확인
    console.log('병용금기 응답 메시지:', response.data?.header?.resultMsg);
    
    // 응답 데이터 가공 및 반환
    if (response.data?.body?.totalCount > 0) {
      return {
        success: true,
        hasWarning: true,
        warningType: 'COMBINATION',
        totalCount: response.data.body.totalCount,
        items: response.data.body.items
      };
    } else {
      return {
        success: true,
        hasWarning: false,
        warningType: 'COMBINATION',
        totalCount: 0,
        items: []
      };
    }
  } catch (error) {
    console.error('[DUR API] 병용금기 정보 조회 중 오류 발생:', error);
    return {
      success: false,
      hasWarning: false,
      warningType: 'COMBINATION',
      error: error.response?.data?.header?.resultMsg || error.message,
      totalCount: 0,
      items: []
    };
  }
};

/**
 * 모든 금기 정보(임부, 노인, 병용)를 한번에 조회하고 현재 복용 중인 약과의 상호작용 검사도 수행
 * 양방향으로 병용금기 정보를 확인합니다.
 * @param {string} itemSeq - 의약품 품목 일련번호
 * @param {Array} currentMedicines - 현재 복용 중인 약 목록, 제공 시 상호작용 검사 수행
 * @returns {Promise<Object>} - 모든 금기 정보와 상호작용 검사 결과
 */
export const fetchAllWarnings = async (itemSeq, currentMedicines = []) => {
  try {
    console.log(`[DUR API] 모든 금기 정보 조회: ${itemSeq}`);
    console.log(`[DUR API] 현재 복용 중인 약품 수: ${currentMedicines?.length || 0}`);
    
    // 현재 복용 중인 약품 목록 로깅
    if (currentMedicines && currentMedicines.length > 0) {
      console.log('[DUR API] 현재 복용 중인 약품 목록:');
      currentMedicines.forEach((med, index) => {
        console.log(`[DUR API] 약품 ${index + 1}:`, {
          medicine_name: med.medicine_name,
          item_seq: med.item_seq,
          medicine_id: med.medicine_id,
          item_seq_type: typeof med.item_seq
        });
      });
    }
    
    // 모든 API 호출 병렬 실행
    console.log('[DUR API] 기본 API 호출 시작...');
    const [pregnancyResult, elderlyResult, combinationResult] = await Promise.all([
      fetchPregnancyWarning(itemSeq),
      fetchElderlyWarning(itemSeq),
      fetchCombinationWarning(itemSeq)
    ]);
    console.log('[DUR API] 기본 API 호출 완료');
    
    // 기본 응답 객체
    const response = {
      success: true,
      itemSeq,
      pregnancy: pregnancyResult,
      elderly: elderlyResult,
      combination: combinationResult,
      hasWarning: pregnancyResult.hasWarning || elderlyResult.hasWarning || combinationResult.hasWarning
    };
    
    // 상호작용 검사 초기화
    response.interactions = { 
      hasConflict: false,
      conflictCount: 0,
      conflictItems: []
    };
    
    // 현재 복용 중인 약 목록이 제공된 경우 상호작용 검사 수행
    if (currentMedicines && currentMedicines.length > 0) {
      console.log('[DUR API] 양방향 상호작용 검사 시작');
      
      // 1. 정방향 검사 (현재 약품 -> 복용 중인 약품)
      console.log('[DUR API] 1단계: 정방향 검사 (현재 약품 -> 복용 중인 약품)');
      const forwardConflicts = [];
      
      if (combinationResult.hasWarning && combinationResult.items) {
        console.log(`[DUR API] 병용금기 항목 ${combinationResult.items.length}개와 현재 약품 비교`);
        
        combinationResult.items.forEach((item, itemIndex) => {
          // 로그 줄이기 위해 첫 5개 항목만 자세히 로깅
          const logDetail = itemIndex < 5;
          if (logDetail) {
            console.log(`[DUR API] 병용금기 항목 ${itemIndex + 1} 비교:`, {
              MIXTURE_ITEM_SEQ: item.MIXTURE_ITEM_SEQ,
              MIXTURE_ITEM_NAME: item.MIXTURE_ITEM_NAME
            });
          }
          
          // 현재 복용 중인 약물 중 병용금기인 약물 찾기
          currentMedicines.forEach((med, medIndex) => {
            // 문자열로 변환하여 비교
            const medItemSeq = med.item_seq?.toString();
            const mixtureItemSeq = item.MIXTURE_ITEM_SEQ?.toString();
            
            // 상세 로깅 (첫 5개 항목만)
            if (logDetail && medIndex < 5) {
              console.log(`[DUR API] -- 약품 비교:`, {
                medicine_name: med.medicine_name,
                item_seq: medItemSeq,
                isMatch: medItemSeq === mixtureItemSeq
              });
            }
            
            // 일치하는 경우
            if (medItemSeq && mixtureItemSeq && medItemSeq === mixtureItemSeq) {
              console.log(`[DUR API] -- 정방향 일치 발견: ${med.medicine_name}(${med.item_seq})와 ${item.MIXTURE_ITEM_NAME}(${item.MIXTURE_ITEM_SEQ})`);
              
              forwardConflicts.push({
                currentMedicine: med,
                warningInfo: item,
                direction: 'forward'  // 방향 표시 추가
              });
            }
          });
        });
        
        console.log(`[DUR API] 정방향 검사 결과: ${forwardConflicts.length}개 충돌 발견`);
      }
      
      // 2. 역방향 검사 (복용 중인 약품 -> 현재 약품)
      console.log('[DUR API] 2단계: 역방향 검사 (복용 중인 약품 -> 현재 약품)');
      const reverseConflicts = [];
      
      // 중복 검사 방지를 위한 세트 (현재 약품 & 복용 중인 약품 조합)
      const checkedPairs = new Set();
      
      // 정방향에서 이미 확인한 조합 등록
      forwardConflicts.forEach(conflict => {
        const pairKey = `${itemSeq}-${conflict.currentMedicine.item_seq}`;
        checkedPairs.add(pairKey);
      });
      
      // 각 복용 중인 약품에 대해 병용금기 정보 조회
      const reversePromises = [];
      for (const med of currentMedicines) {
        // 자기 자신 검사 방지 및 이미 검사한 조합 방지
        if (med.item_seq === itemSeq) continue;
        
        const pairKey = `${itemSeq}-${med.item_seq}`;
        if (checkedPairs.has(pairKey)) {
          console.log(`[DUR API] 이미 검사한 조합 건너뜀: ${itemSeq} & ${med.item_seq}`);
          continue;
        }
        
        console.log(`[DUR API] 역방향 검사 추가: ${med.medicine_name}(${med.item_seq}) -> ${itemSeq}`);
        reversePromises.push(
          fetchCombinationWarning(med.item_seq).then(result => ({ medicine: med, result }))
        );
      }
      
      // 모든 역방향 검사 결과 수집
      if (reversePromises.length > 0) {
        console.log(`[DUR API] ${reversePromises.length}개 약품에 대한 역방향 검사 시작`);
        const reverseResults = await Promise.all(reversePromises);
        
        // 각 결과 처리
        reverseResults.forEach(({ medicine, result }) => {
          if (result.hasWarning && result.items) {
            console.log(`[DUR API] ${medicine.medicine_name}의 병용금기 정보 ${result.items.length}개 항목 검사`);
            
            // 해당 약품의 병용금기 목록에서 현재 약품과 일치하는 항목 찾기
            result.items.forEach(item => {
              // 문자열로 변환하여 비교
              const currentItemSeqStr = itemSeq?.toString();
              const mixtureItemSeqStr = item.MIXTURE_ITEM_SEQ?.toString();
              
              if (currentItemSeqStr && mixtureItemSeqStr && currentItemSeqStr === mixtureItemSeqStr) {
                console.log(`[DUR API] -- 역방향 일치 발견: ${medicine.medicine_name}(${medicine.item_seq})에서 현재 약품(${itemSeq})과의 병용금기`);
                
                reverseConflicts.push({
                  currentMedicine: medicine,
                  warningInfo: item,
                  direction: 'reverse'  // 방향 표시 추가
                });
              }
            });
          }
        });
        
        console.log(`[DUR API] 역방향 검사 결과: ${reverseConflicts.length}개 충돌 발견`);
      } else {
        console.log('[DUR API] 추가 역방향 검사할 약품이 없습니다.');
      }
      
      // 모든 충돌 항목 통합 (중복 제거)
      const allConflicts = [...forwardConflicts, ...reverseConflicts];
      
      // 중복 제거를 위한 맵 사용 (동일한 약품 쌍은 하나로 통합)
      const uniqueConflictsMap = new Map();
      
      allConflicts.forEach(conflict => {
        const medItemSeq = conflict.currentMedicine.item_seq;
        const key = `${itemSeq}-${medItemSeq}`;
        
        // 이미 맵에 있으면 정방향 우선 (정보가 더 상세할 가능성)
        if (!uniqueConflictsMap.has(key) || conflict.direction === 'forward') {
          uniqueConflictsMap.set(key, conflict);
        }
      });
      
      // 최종 충돌 목록 생성
      const finalConflicts = Array.from(uniqueConflictsMap.values());
      
      // 상호작용 결과 설정
      response.interactions = {
        hasConflict: finalConflicts.length > 0,
        conflictCount: finalConflicts.length,
        conflictItems: finalConflicts,
        bidirectional: true  // 양방향 검사 표시
      };
      
      console.log(`[DUR API] 양방향 상호작용 검사 최종 결과: ${finalConflicts.length}개 충돌`);
      if (finalConflicts.length > 0) {
        console.log('[DUR API] 최종 충돌 약품 목록:');
        finalConflicts.forEach((conflict, index) => {
          console.log(`[DUR API] 충돌 ${index + 1}:`, {
            medicine_name: conflict.currentMedicine.medicine_name,
            item_seq: conflict.currentMedicine.item_seq,
            direction: conflict.direction,
            reason: conflict.warningInfo.PROHBT_CONTENT?.substring(0, 30) + '...'
          });
        });
      }
    }
    
    console.log('[DUR API] 모든 금기 정보 조회 완료');
    return response;
  } catch (error) {
    console.error('[DUR API] 금기 정보 통합 조회 중 오류 발생:', error);
    
    const errorResponse = {
      success: false,
      itemSeq,
      error: error.message,
      hasWarning: false,
      pregnancy: { hasWarning: false, content: '정보를 불러오는 중 오류가 발생했습니다.' },
      elderly: { hasWarning: false, content: '정보를 불러오는 중 오류가 발생했습니다.' },
      combination: { hasWarning: false, totalCount: 0, items: [] },
      interactions: { 
        hasConflict: false, 
        conflictCount: 0, 
        conflictItems: [],
        bidirectional: true  // 양방향 검사 표시
      }
    };
    
    return errorResponse;
  }
};

export default {
  fetchPregnancyWarning,
  fetchElderlyWarning,
  fetchCombinationWarning,
  fetchAllWarnings
};