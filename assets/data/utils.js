// data.js
import dayjs from 'dayjs';

// 요일 배열
export const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

 // 현재 주차를 중심으로 이전 4주, 이후 4주까지 총 9주 데이터 생성
export const generateWeeks = centerDate => {
    const weeks = [];
    const today = dayjs();

    // 이전 4주
    for (let i = -4; i <= 4; i++) {
      const startOfWeek = centerDate.startOf('week').add(i * 7, 'day');
      const weekData = [];

      for (let j = 0; j < 7; j++) {
        const currentDate = startOfWeek.add(j, 'day');
        weekData.push({
          day: weekDays[currentDate.day()],
          date: currentDate.date(),
          month: currentDate.month() + 1,
          year: currentDate.year(),
          fullDate: currentDate,
          isToday:
            currentDate.format('YYYY-MM-DD') === today.format('YYYY-MM-DD'),
        });
      }

      weeks.push(weekData);
    }

    return weeks;
  };

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

export const getTimeTypeFromScheduleName = scheduleName => {
  const lowerName = scheduleName.toLowerCase();

  if (lowerName.includes('아침')) return 'MORNING';
  if (lowerName.includes('점심')) return 'LUNCH';
  if (lowerName.includes('저녁')) return 'DINNER';
  if (lowerName.includes('자기 전')) return 'BEDTIME';

  return null;
};

export const convertToPrettyTime = time24 => {
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const isPM = hour >= 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `오${isPM ? '후' : '전'} ${displayHour}:${minute}`;
};

export const convertToSortValue = time24 => {
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  return hour * 100 + minute;
};

export const getDayOfWeek = dateString => {
  const date = dayjs(dateString);
  return date.day() === 0 ? 7 : date.day();
};

export const DEFAULT_BOT_OPTIONS = [
  '약 검색',
  '루틴 등록',
  '처방전 촬영',
  '의약품 촬영',
  '오늘 복용 일정 확인',
];

