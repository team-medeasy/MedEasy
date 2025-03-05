// data.js
import dayjs from 'dayjs';

// 시간 매핑에 시간값 추가 (정렬을 위한 숫자값 포함)
export const timeMapping = {
  MORNING: { label: '아침', time: '오전 8:00', sortValue: 800 },
  LUNCH: { label: '점심', time: '오후 12:30', sortValue: 1230 },
  DINNER: { label: '저녁', time: '오후 6:30', sortValue: 1830 },
  BEDTIME: { label: '자기 전', time: '오후 10:00', sortValue: 2200 }
};

// 병원 시간을 숫자값으로 변환하는 함수
export const getTimeValue = (timeString) => {
  if (!timeString) return 0;
  
  const isPM = timeString.includes('오후');
  let [hour, minute] = timeString.replace('오전 ', '').replace('오후 ', '').split(':').map(Number);
  
  if (isPM && hour !== 12) hour += 12;
  return hour * 100 + minute;
};

// 약 복용 루틴 임시 데이터
export const initialMedicineRoutines = [
  {
    medicine_id: 3594,
    nickname: '아스피린',
    dose: 1,
    total_quantity: 30,
    day_of_weeks: [1, 2, 3],
    types: ['MORNING', 'LUNCH', 'DINNER', 'BEDTIME']
  },
  {
    medicine_id: 9876,
    nickname: '타이레놀',
    dose: 2,
    total_quantity: 20,
    day_of_weeks: [2, 4, 6],
    types: ['MORNING', 'DINNER']
  }
];

// 병원 방문 루틴 임시 데이터
export const initialHospitalRoutines = [
  {
    hospital_id: 1001,
    name: '한성대병원 외래 진료',
    time: 'MORNING',
    specific_time: '오전 10:30',
    sortValue: 1030,
    day_of_weeks: [1, 3, 5]
  },
  {
    hospital_id: 1002,
    name: '연세세브란스병원',
    time: 'AFTERNOON',
    specific_time: '오후 2:00',
    sortValue: 1400,
    day_of_weeks: [2, 4]
  },
  {
    hospital_id: 1003,
    name: '고려대학병원',
    time: 'MORNING',
    specific_time: '오전 11:00',
    sortValue: 1100,
    day_of_weeks: [3, 6]
  }
];

// 요일 배열
export const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// 현재 날짜 및 주간 날짜 생성 함수
export const getWeekDays = () => {
  const today = dayjs();
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = today.startOf('week').add(i, 'day');
    return {
      day: weekDays[date.day()],
      date: date.date(),
      month: date.month() + 1,
      year: date.year(),
      fullDate: date,
      isToday: date.date() === today.date() &&
        date.month() === today.month() &&
        date.year() === today.year()
    };
  });
};

// 상대적 날짜 텍스트 생성 함수
export const getRelativeDayText = (selectedDate, today) => {
  const selectedDateObj = dayjs(`${selectedDate.year}-${selectedDate.month}-${selectedDate.date}`);
  const todayObj = dayjs(`${today.year()}-${today.month() + 1}-${today.date()}`);
  const diff = selectedDateObj.diff(todayObj, 'day');

  if (diff === 0) return '오늘';
  if (diff === -1) return '어제';
  if (diff === 1) return '내일';
  if (diff === 2) return '모레';
  return diff < 0 ? `${Math.abs(diff)}일 전` : `${diff}일 후`;
};