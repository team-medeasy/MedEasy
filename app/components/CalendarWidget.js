import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { HeaderIcons, RoutineIcons } from '../../assets/icons';
import dayjs from 'dayjs';
import { getRoutineByDate } from '../api/routine';
import { useFontSize } from '../../assets/fonts/FontSizeContext';

// 캘린더를 한글로 표시하기 위한 설정
LocaleConfig.locales['ko'] = {
  monthNames: [...Array(12)].map((_, i) => `${i + 1}월`),
  monthNamesShort: [...Array(12)].map((_, i) => `${i + 1}월`),
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const CalendarWidget = ({ onDateChange, markedDates = {} }) => {
  const { fontSizeMode } = useFontSize(); // 전역 폰트 크기 설정값 가져오기
  const koreanDays = ['일', '월', '화', '수', '목', '금', '토'];

  const todayRef = useRef(dayjs().format('YYYY-MM-DD')); // 오늘 날짜를 ref로 저장 (렌더링 사이에 값 유지)
  const [selectedDate, setSelectedDate] = useState(todayRef.current); // 선택된 날짜 상태
  const [routineMarkedDates, setRoutineMarkedDates] = useState({}); // 루틴이 존재하는 날짜 표시
  const [currentMonth, setCurrentMonth] = useState(dayjs()); // 현재 보고 있는 월 상태

  // 해당 월의 루틴 데이터를 가져오는 함수
  const fetchMonthlyRoutine = async (month) => {
    try {
      const startDate = month.startOf('month').format('YYYY-MM-DD');
      const endDate = month.endOf('month').format('YYYY-MM-DD');
      const response = await getRoutineByDate(startDate, endDate);
      const routineData = response.data.body;

      // 날짜별로 루틴 표시 여부를 구성
      const markedRoutineDates = routineData.reduce((acc, item) => {
        const dateString = item.take_date;
        const hasRoutine = item.user_schedule_dtos.some(s => s.routine_dtos.length > 0);
        if (hasRoutine) {
          // 모든 루틴이 완료되었는지 여부 확인
          const allTaken = item.user_schedule_dtos.every(schedule =>
            schedule.routine_dtos.length === 0 ||
            schedule.routine_dtos.every(med => med.is_taken)
          );
          acc[dateString] = {
            marked: true,
            allTaken,
          };
        }
        return acc;
      }, {});

      // 이전 상태를 병합하지 않고 현재 월의 데이터만 사용
      setRoutineMarkedDates(markedRoutineDates);
    } catch (e) {
      console.error('루틴 데이터 가져오기 실패:', e);
    }
  };

  // 초기 렌더링 시 오늘 날짜 선택 및 루틴 데이터 가져오기
  useEffect(() => {
    setSelectedDate(todayRef.current);
    const today = dayjs(todayRef.current);
    onDateChange({
      day: koreanDays[today.day()],
      date: today.date(),
      month: today.month() + 1,
      year: today.year(),
      fullDate: today,
    });
    fetchMonthlyRoutine(currentMonth);
  }, []);

  // 화면이 다시 포커스될 때 루틴 데이터 다시 가져오기
  useFocusEffect(
    React.useCallback(() => {
      fetchMonthlyRoutine(currentMonth);
      return () => {
        // 포커스가 해제될 때 추가 작업 (필요한 경우)
      };
    }, [currentMonth])
  );

  // 날짜 선택 시 실행되는 함수
  const handleDayPress = (day) => {
    const date = dayjs(day.dateString);
    setSelectedDate(day.dateString);
    onDateChange({
      day: koreanDays[date.day()],
      date: date.date(),
      month: date.month() + 1,
      year: date.year(),
      fullDate: date,
    });
  };

  // 월이 바뀔 때 실행되는 함수
  const handleMonthChange = (month) => {
    const newMonth = dayjs(`${month.year}-${month.month}-01`);
    setCurrentMonth(newMonth);
    // 월이 변경될 때마다 해당 월의 루틴 데이터를 새로 가져옴
    fetchMonthlyRoutine(newMonth);
  };

  // 날짜 셀 커스텀 컴포넌트
  const CustomDay = React.memo(({ date, state, marking, onPress }) => {
    const isSelected = selectedDate === date.dateString;
    const isToday = date.dateString === todayRef.current;
    const hasRoutine = marking?.marked;
    const allTaken = marking?.allTaken;

    const dayTextStyle = {
      color: state === 'disabled'
        ? themes.light.textColor.Primary20
        : isToday
          ? themes.light.pointColor.Primary
          : themes.light.textColor.textPrimary,
    };

    return (
      <TouchableWrapper onPress={() => onPress(date)}>
        {isSelected && <SelectedBackground />}
        <DayContainer>
          <DayText fontSizeMode={fontSizeMode} style={dayTextStyle}>
            {date.day}
          </DayText>
          {hasRoutine && (
            <IconContainer>
              <RoutineIcons.medicine
                width={15}
                height={15}
                style={{
                  color: allTaken 
                    ? themes.light.pointColor.Primary  // 모든 약 복용 완료
                    : themes.light.textColor.Primary20 // 일부만 복용 또는 모두 미복용
                }}
              />
            </IconContainer>
          )}
        </DayContainer>
      </TouchableWrapper>
    );
  }, (prev, next) => 
    // React.memo 최적화를 위한 비교: 날짜와 표시 정보가 같으면 리렌더링 방지
    prev.date.dateString === next.date.dateString && 
    prev.marking === next.marking && 
    prev.state === next.state
  );

  return (
    <CalendarContainer>
      <StyledCalendar
        locale="ko"
        fontSizeMode={fontSizeMode}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        current={currentMonth.format('YYYY-MM-DD')}
        dayComponent={({ date, state, marking }) => (
          <CustomDay
            date={date}
            state={state}
            marking={marking}
            onPress={handleDayPress}
          />
        )}
        markedDates={{
          ...markedDates,
          ...routineMarkedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            ...(routineMarkedDates[selectedDate] || {}),
            selected: true,
            selectedColor: themes.light.pointColor.Primary20,
          }
        }}
      />
    </CalendarContainer>
  );
};

const CalendarContainer = styled.View`
  padding: 20px;
`;

const TouchableWrapper = styled.TouchableOpacity`
  width: 42px;
  height: 59px;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const SelectedBackground = styled.View`
  position: absolute;
  width: 42px;
  height: 59px;
  border-radius: 10px;
  background-color: ${themes.light.pointColor.Primary20};
  z-index: 1;
`;

const DayContainer = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  z-index: 2;
  padding-bottom: 20px;
`;

const DayText = styled.Text`
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-Bold';
`;

const IconContainer = styled.View`
  position: absolute;
  bottom: 10px;
  align-items: center;
`;

// Calendar 테마를 적용한 Styled 컴포넌트 형태의 Calendar
const StyledCalendar = ({ fontSizeMode, ...props }) => (
  <Calendar
    {...props}
    theme={{
      backgroundColor: themes.light.bgColor.bgPrimary,
      calendarBackground: themes.light.bgColor.bgPrimary,
      textSectionTitleColor: themes.light.textColor.textPrimary,
      monthTextColor: themes.light.textColor.textPrimary,
      todayTextColor: themes.light.pointColor.Primary,
      dayTextColor: themes.light.textColor.textPrimary,
      textDisabledColor: themes.light.textColor.Primary20,
      arrowColor: themes.light.textColor.textPrimary,
      fontFamily: 'Pretendard-ExtraBold',
      textDayFontSize: FontSizes.body[fontSizeMode],
      textMonthFontSize: FontSizes.title[fontSizeMode],
      textDayHeaderFontSize: FontSizes.caption[fontSizeMode],
      textDayFontWeight: '600',
      textMonthFontWeight: '800',
      textDayHeaderFontWeight: '800',
      'stylesheet.calendar.header': {
        dayTextAtIndex0: {
          color: themes.light.pointColor.Secondary,
        },
      },
    }}
    renderArrow={direction => (
      <HeaderIcons.chevron
        style={{
          transform: [{ rotate: direction === 'left' ? '0deg' : '180deg' }],
          marginHorizontal: 30,
          color: themes.light.textColor.textPrimary,
        }}
        height={16}
        width={16}
      />
    )}
  />
);

export default CalendarWidget;