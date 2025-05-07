import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { HeaderIcons, RoutineIcons } from '../../assets/icons';
import dayjs from 'dayjs';
import { getRoutineByDate } from '../api/routine';
import { useFontSize } from '../../assets/fonts/FontSizeContext';

// 요일을 한글로 설정
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  monthNamesShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  dayNames: [
    '일요일', '월요일', '화요일', '수요일',
    '목요일', '금요일', '토요일'
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const CalendarWidget = ({
  onDateChange,
  markedDates = {},
  medicineRoutines,
  setMedicineRoutines
}) => {
  const {fontSizeMode} = useFontSize();
  const koreanDays = ['일', '월', '화', '수', '목', '금', '토'];
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [routineMarkedDates, setRoutineMarkedDates] = useState({});
  const [today, setToday] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedDate, setSelectedDate] = useState(today);

  // 현재 보여지는 월의 루틴 데이터 가져오기
  const fetchMonthlyRoutine = async (month) => {
    try {
      // 현재 보여지는 월의 시작일과 종료일 계산
      const startDate = month.startOf('month').format('YYYY-MM-DD');
      const endDate = month.endOf('month').format('YYYY-MM-DD');
      
      console.log('루틴 데이터 조회 기간:', startDate, '~', endDate);
      
      const response = await getRoutineByDate(startDate, endDate);
      const routineData = response.data.body;
      console.log('월 데이터 조회 결과:', routineData);

      const markedRoutineDates = routineData.reduce((acc, item) => {
        const dateString = item.take_date;
        
        // 모든 스케줄을 순회하며 routine_medicine_dtos 확인
        const hasRoutineMedicines = item.user_schedule_dtos.some(schedule => 
          schedule.routine_dtos.length > 0
        );
    
        if (hasRoutineMedicines) {
          // 모든 약이 복용 완료되었는지 확인
          const allTaken = item.user_schedule_dtos.every(schedule => 
            schedule.routine_dtos.length === 0 || 
            schedule.routine_dtos.every(medicine => medicine.is_taken)
          );
          
          acc[dateString] = {
            marked: true,
            allTaken: allTaken // 모든 약 복용 완료 여부 저장
          };
        }
        return acc;
      }, {});

      // 기존 markedDates와 병합
      setRoutineMarkedDates({
        ...markedDates,
        ...markedRoutineDates
      });
      
      console.log('마킹된 날짜 정보 업데이트:', markedRoutineDates);
    } catch (error) {
      console.error('루틴 데이터 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    // 오늘 날짜 초기화
    const currentToday = dayjs().format('YYYY-MM-DD');
    setToday(currentToday);
    
    // 컴포넌트 마운트 시 오늘 날짜를 기본 선택 상태로 설정
    setSelectedDate(currentToday);
    
    // 오늘 날짜에 대한 onDateChange 호출
    const todayDayjs = dayjs(currentToday);
    const todayData = {
      day: koreanDays[todayDayjs.day()],
      date: todayDayjs.date(),
      month: todayDayjs.month() + 1,
      year: todayDayjs.year(),
      fullDate: todayDayjs
    };
    onDateChange(todayData);
    
    // 자정에 오늘 날짜 업데이트하는 타이머 설정
    const updateTodayDate = () => {
      const now = dayjs();
      const tomorrow = now.add(1, 'day').startOf('day');
      const timeUntilMidnight = tomorrow.diff(now);
      
      const timer = setTimeout(() => {
        setToday(dayjs().format('YYYY-MM-DD'));
        // 다음 자정을 위한 타이머 재설정
        updateTodayDate();
      }, timeUntilMidnight);
      
      return timer;
    };
    
    const timer = updateTodayDate();
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchMonthlyRoutine(currentMonth);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('루틴 데이터 다시 로드 중...');
      // 현재 표시 중인 월의 데이터 다시 로드
      fetchMonthlyRoutine(currentMonth);
      
      return () => {
        // 클린업 함수 (필요시)
      };
    }, [currentMonth])
  );

  // 날짜 선택 핸들러
  const handleDayPress = (day) => {
    const selectedDayjs = dayjs(day.dateString);
    const newSelectedDate = {
      day: koreanDays[selectedDayjs.day()],
      date: selectedDayjs.date(),
      month: selectedDayjs.month() + 1,
      year: selectedDayjs.year(),
      fullDate: selectedDayjs
    };
    // 선택된 날짜 변경
    setSelectedDate(day.dateString);

    onDateChange(newSelectedDate);
    console.log("선택된 날짜: ", newSelectedDate);
  };

  // 월 변경 핸들러
  const handleMonthChange = (month) => {
    const newMonth = dayjs(`${month.year}-${month.month}-01`);
    setCurrentMonth(newMonth);
    console.log('달력 월 변경:', newMonth.format('YYYY-MM'));
    
    // 월 변경 시 해당 월의 루틴 데이터 가져오기
    fetchMonthlyRoutine(newMonth);
  };

  // 커스텀 날짜 컴포넌트 
  const CustomDay = React.memo(({ date, state, marking, onPress, fontSizeMode }) => {
    const isSelected = selectedDate === date.dateString;
    const hasRoutine = marking?.marked || false;
    const allTaken = marking?.allTaken || false;
    const isToday = date.dateString === today;
  
    // 날짜 텍스트 스타일
    const dayTextStyle = {
      color: state === 'disabled' 
        ? themes.light.textColor.Primary20 
        : isToday
          ? themes.light.pointColor.Primary // 오늘 날짜 색상
          : isSelected 
            ? themes.light.textColor.textPrimary
            : themes.light.textColor.textPrimary,
    };
  
    return (
      <TouchableWrapper onPress={() => onPress(date)}>
        {isSelected && <SelectedBackground />}
        
        <DayContainer>
          {/* 날짜(day) */}
          <DayText style={dayTextStyle} fontSizeMode={fontSizeMode}>{date.day}</DayText>
          
          {/* 루틴이 있는 경우 */}
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
  });

  return (
    <CalendarContainer>
      <StyledCalendar
        key={`calendar-${fontSizeMode}`}
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
            onPress={(date) => handleDayPress(date)}
            selectedDate={selectedDate} // 명시적으로 선택된 날짜 전달
            fontSizeMode={fontSizeMode}
          />
        )}
        markedDates={{
          ...markedDates,
          ...routineMarkedDates,
          // 선택된 날짜도 표시
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            ...(routineMarkedDates[selectedDate] || {}),
            selected: true
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
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Bold';
`;

const IconContainer = styled.View`
  position: absolute;
  bottom: 10px;
  align-items: center;
`;

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