// services/RoutineUrlService.js
import { Linking, Alert } from 'react-native';
import { getRoutineByDate, checkRoutine } from '../api/routine';

// 모듈 레벨 상태
let isProcessing = false;  // 현재 처리 중인지 상태 플래그
let isModalVisible = false;  // 모달 표시 상태
let currentRoutineData = null;  // 현재 루틴 데이터
let lastProcessedUrl = null;  // 마지막으로 처리한 URL
let lastProcessTime = 0;  // 마지막 처리 시간

// 상태 변경 콜백 리스너
const listeners = [];

// 상태 변경 알림 함수
const notifyListeners = () => {
  const state = { isModalVisible, routineData: currentRoutineData };
  console.log('[RoutineUrlService] 리스너에게 상태 변경 알림:', state);
  listeners.forEach(listener => listener(state));
};

// 시간 문자열을 시간과 분으로 변환하는 함수
const parseTimeString = (timeString) => {
  if (!timeString) return { hour: 0, minute: 0 };
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hour: hours, minute: minutes };
};

// 현재 시간에 가장 가까운 루틴 찾기 함수
const findClosestRoutineByTime = (routineGroups) => {
  console.log('[RoutineUrlService] 가장 가까운 루틴 찾기 시작');
  
  if (!routineGroups || routineGroups.length === 0) {
    console.log('[RoutineUrlService] 루틴 그룹이 없음');
    return null;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  
  console.log(`[RoutineUrlService] 현재 시간: ${currentHour}:${currentMinute} (${currentTotalMinutes}분)`);
  
  let closestSchedule = null;
  let minTimeDifference = Number.MAX_SAFE_INTEGER;
  
  // 오늘 날짜의 루틴 그룹 찾기
  const todayGroup = routineGroups.find(group => {
    const groupDate = new Date(group.take_date);
    const today = new Date();
    return groupDate.toDateString() === today.toDateString();
  });
  
  if (!todayGroup) {
    console.log('[RoutineUrlService] 오늘 날짜의 루틴 그룹이 없음');
    return null;
  }
  
  console.log('[RoutineUrlService] 오늘 루틴 그룹 찾음');
  
  // 스케줄별로 순회
  todayGroup.user_schedule_dtos.forEach(schedule => {
    // API 응답에서 take_time은 "09:05:00" 형태의 문자열임
    const takeTime = parseTimeString(schedule.take_time);
    const routineHour = takeTime.hour;
    const routineMinute = takeTime.minute;
    const routineTotalMinutes = routineHour * 60 + routineMinute;
    
    // 현재 시간과의 차이 계산
    const timeDifference = Math.abs(routineTotalMinutes - currentTotalMinutes);
    
    // 미복용 루틴이 있고, 시간 차이가 240분(4시간) 이내인 경우
    const hasUncompletedRoutines = schedule.routine_dtos.some(routine => !routine.is_taken);
    
    console.log(`[RoutineUrlService] 스케줄 체크: ${schedule.name}, 시간: ${routineHour}:${routineMinute}, 차이: ${timeDifference}분, 미복용 루틴 있음: ${hasUncompletedRoutines}`);
    
    if (hasUncompletedRoutines && timeDifference <= 240 && timeDifference < minTimeDifference) {
      console.log(`[RoutineUrlService] 더 가까운 스케줄 발견: ${schedule.name}`);
      minTimeDifference = timeDifference;
      closestSchedule = {
        ...schedule,
        takeTime: takeTime // 파싱된 시간 추가
      };
    }
  });
  
  // 가장 가까운 스케줄에서 미복용 루틴 찾기
  if (closestSchedule) {
    console.log('[RoutineUrlService] 가장 가까운 스케줄:', closestSchedule.name);
    
    const result = {
      scheduleId: closestSchedule.user_schedule_id,
      scheduleName: closestSchedule.name,
      takeTime: closestSchedule.takeTime,
      routines: closestSchedule.routine_dtos
        .filter(routine => !routine.is_taken)
        .map(routine => ({
          routineId: routine.routine_id,
          medicineId: routine.medicine_id,
          nickname: routine.nickname,
          dose: routine.dose
        }))
    };
    
    console.log('[RoutineUrlService] 결과 루틴 정보:', result);
    return result;
  }
  
  console.log('[RoutineUrlService] 적합한 루틴을 찾지 못함');
  return null;
};

// 모달용 데이터 포맷팅 함수
const formatRoutineForDisplay = (routineInfo) => {
  console.log('[RoutineUrlService] 모달용 데이터 포맷팅 시작');
  
  if (!routineInfo || !routineInfo.scheduleName || !routineInfo.takeTime) {
    console.error('[RoutineUrlService] 올바른 루틴 정보가 아님');
    return null;
  }
  
  // 스케줄 이름 사용 (API에서는 직접 "아침", "저녁" 등으로 제공됨)
  const timeLabel = routineInfo.scheduleName;
  
  // 시간 표시 포맷팅
  const hour = routineInfo.takeTime.hour;
  const minute = routineInfo.takeTime.minute;
  const formattedHour = hour % 12 || 12;
  const amPm = hour < 12 ? '오전' : '오후';
  const formattedMinute = String(minute).padStart(2, '0');
  const timeString = `${amPm} ${formattedHour}:${formattedMinute}`;
  
  // 루틴 카드용 데이터 구성
  const result = {
    id: `medicine-${timeLabel.toUpperCase()}`,
    label: timeLabel,
    time: timeString,
    sortValue: hour,
    type: 'medicine',
    timeKey: timeLabel.toUpperCase(),
    medicines: routineInfo.routines.map(routine => ({
      medicine_id: routine.routineId,
      nickname: routine.nickname,
      dose: routine.dose || 1,
      types: [timeLabel.toUpperCase()],
    })),
  };
  
  console.log('[RoutineUrlService] 포맷팅 결과:', result);
  return result;
};

// URL 스킴 처리 함수
const handleUrlScheme = async (url) => {
  console.log('======================================');
  console.log(`[RoutineUrlService] URL 스킴 처리 시작`);
  console.log(`[RoutineUrlService] URL: ${url}`);
  console.log(`[RoutineUrlService] URL 타입: ${typeof url}`);
  console.log(`[RoutineUrlService] URL 길이: ${url ? url.length : 0}`);
  console.log(`[RoutineUrlService] 현재 처리 중 상태: ${isProcessing}`);
  console.log(`[RoutineUrlService] 현재 모달 표시 상태: ${isModalVisible}`);
  console.log(`[RoutineUrlService] 마지막 처리된 URL: ${lastProcessedUrl}`);
  console.log('======================================');
  
  // URL 유효성 검사
  if (!url || typeof url !== 'string') {
    console.error('[RoutineUrlService] 유효하지 않은 URL:', url);
    return;
  }
  
  // URL 형식 검증
  if (!url.includes('medeasy://openroutine')) {
    console.log('[RoutineUrlService] medeasy://openroutine 형식이 아닌 URL:', url);
    return;
  }
  
  // 중복 처리 방지 로직 활성화
  const now = Date.now();
  if (url === lastProcessedUrl && now - lastProcessTime < 10000) {
    console.log('[RoutineUrlService] 최근 처리된 URL 중복 요청 무시:', url);
    return;
  }
  
  // 이미 처리 중이면 무시
  if (isProcessing) {
    console.log('[RoutineUrlService] 이미 처리 중, 요청 무시:', url);
    return;
  }
  
  // 이미 모달이 열려있으면 닫기 (모달 초기화)
  if (isModalVisible) {
    console.log('[RoutineUrlService] 이미 모달이 열려있음 - 초기화');
    isModalVisible = false;
    currentRoutineData = null;
    notifyListeners();
    // 약간의 딜레이 추가 (모달이 닫히는 애니메이션을 위해)
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  try {
    console.log('[RoutineUrlService] URL 스킴 처리 시작:', url);
    isProcessing = true;  // 처리 중 플래그 설정
    
    // 현재 날짜 생성
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    console.log('[RoutineUrlService] 오늘 날짜:', today);
    
    // 오늘의 루틴 목록 가져오기
    console.log('[RoutineUrlService] API 호출: getRoutineByDate 시작');
    const response = await getRoutineByDate(today, today);
    console.log('[RoutineUrlService] API 응답 받음:', response);
    
    if (!response || !response.data || !response.data.result || 
        response.data.result.result_code !== 200 || !response.data.body) {
      console.error('[RoutineUrlService] 루틴 정보 가져오기 실패:', response);
      Alert.alert('오류', '루틴 정보를 가져오는데 실패했습니다.');
      return;
    }
    
    // 현재 시간에 가장 가까운 루틴 정보 찾기
    const closestRoutineInfo = findClosestRoutineByTime(response.data.body);
    
    if (!closestRoutineInfo || !closestRoutineInfo.routines || 
        closestRoutineInfo.routines.length === 0) {
      console.log('[RoutineUrlService] 현재 시간에 해당하는 복용할 약이 없음');
      Alert.alert('알림', '현재 시간에 해당하는 복용할 약이 없습니다.');
      return;
    }
    
    console.log('[RoutineUrlService] 현재 시간에 해당하는 복용할 약 찾음:', closestRoutineInfo);
    
    // 모든 루틴에 대해 복용 체크 수행
    const checkPromises = closestRoutineInfo.routines.map(routine => {
      console.log('[RoutineUrlService] 복용 체크 전송 중:', routine.routineId);
      return checkRoutine({
        routine_id: routine.routineId,
        is_taken: true
      });
    });
    
    try {
      const checkResults = await Promise.all(checkPromises);
      console.log('[RoutineUrlService] 복용 체크 응답 결과:', checkResults);
      
      // 모든 체크가 성공했는지 확인
      const allSuccessful = checkResults.every(result => 
        result && result.data && result.data.result && 
        result.data.result.result_code === 200
      );
      
      if (!allSuccessful) {
        console.error('[RoutineUrlService] 일부 루틴 복용 체크 실패:', checkResults);
        Alert.alert('오류', '일부 약 복용 체크에 실패했습니다.');
        return;
      }
      
      console.log('[RoutineUrlService] 모든 루틴 복용 체크 성공');
    } catch (error) {
      console.error('[RoutineUrlService] 복용 체크 API 오류:', error);
      Alert.alert('오류', '복용 체크 중 문제가 발생했습니다.');
      return;
    }
    
    // 성공 시 UI에 표시할 루틴 데이터 구성
    const routineForDisplay = formatRoutineForDisplay(closestRoutineInfo);
    
    if (!routineForDisplay) {
      console.error('[RoutineUrlService] 표시할 루틴 데이터 구성 실패');
      Alert.alert('오류', '루틴 데이터 처리 중 오류가 발생했습니다.');
      return;
    }
    
    // 상태 변경
    currentRoutineData = routineForDisplay;
    isModalVisible = true;
    
    // 중복 처리 방지를 위한 마지막 처리 URL과 시간 저장
    lastProcessedUrl = url;
    lastProcessTime = now;
    
    console.log('[RoutineUrlService] 모달 표시 상태 변경:', isModalVisible);
    console.log('[RoutineUrlService] 현재 루틴 데이터:', currentRoutineData);
    
    // 상태 변경 알림 
    notifyListeners();
    console.log('[RoutineUrlService] 모든 리스너에게 알림 완료');
  } catch (error) {
    console.error('[RoutineUrlService] 처리 오류:', error);
    Alert.alert('오류', '서버 연결에 실패했습니다.');
  } finally {
    isProcessing = false;  // 처리 중 플래그 해제
    console.log('[RoutineUrlService] 처리 완료, 처리중 플래그 해제');
  }
};

// 모달 닫기 함수
const closeModal = () => {
  console.log('[RoutineUrlService] 모달 닫기 함수 호출됨');
  isModalVisible = false;
  currentRoutineData = null;
  console.log('[RoutineUrlService] 모달 상태 변경:', isModalVisible);
  notifyListeners();
};

// 리스너 등록 함수
const addListener = (callback) => {
  if (!callback || typeof callback !== 'function') {
    console.error('[RoutineUrlService] 유효하지 않은 콜백 함수');
    return () => {}; // 더미 제거 함수 반환
  }
  
  console.log('[RoutineUrlService] 새 리스너 등록됨');
  listeners.push(callback);
  
  // 현재 상태 즉시 전달
  const currentState = { isModalVisible, routineData: currentRoutineData };
  console.log('[RoutineUrlService] 새 리스너에게 현재 상태 전달:', currentState);
  callback(currentState);
  
  // 리스너 제거 함수 반환
  return () => {
    console.log('[RoutineUrlService] 리스너 제거 요청됨');
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
      console.log('[RoutineUrlService] 리스너 제거됨, 남은 리스너 수:', listeners.length);
    }
  };
};

// 서비스 초기화 - 앱 시작 시 한 번만 호출
const initializeService = () => {
  console.log('[RoutineUrlService] 초기화 시작');
  
  // 앱 시작 시 초기 상태 출력
  console.log('[RoutineUrlService] 초기 상태:');
  console.log('- 처리 중 상태:', isProcessing);
  console.log('- 모달 표시 상태:', isModalVisible);
  console.log('- 현재 루틴 데이터:', currentRoutineData);
  console.log('- 마지막 처리 URL:', lastProcessedUrl);
  
  console.log('[RoutineUrlService] 초기화 완료');
};

// 서비스 초기화 실행
initializeService();

// 서비스 객체
const RoutineUrlService = {
  handleUrlScheme,
  closeModal,
  addListener
};

export default RoutineUrlService;
