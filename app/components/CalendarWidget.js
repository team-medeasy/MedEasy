import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { HeaderIcons, RoutineIcons } from '../../assets/icons';
import dayjs from 'dayjs';
import { getRoutineByDate } from '../api/routine';

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
  const koreanDays = ['일', '월', '화', '수', '목', '금', '토'];
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [routineMarkedDates, setRoutineMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');

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
    console.log("디버깅: ", newSelectedDate);
  };

  // 월 변경 핸들러
  const handleMonthChange = (month) => {
    const newMonth = dayjs(`${month.year}-${month.month}`);
    setCurrentMonth(newMonth);

    // 월 변경 시 해당 월의 루틴 데이터 가져오기
    const fetchMonthlyRoutine = async () => {
      try {
        // 현재 보여지는 월의 시작일과 종료일 계산
        const startDate = newMonth.startOf('month').format('YYYY-MM-DD');
        const endDate = newMonth.endOf('month').format('YYYY-MM-DD');
        
        const response = await getRoutineByDate(startDate, endDate);
        const routineData = response.data.body;
        console.log('월 데이터: ',routineData);

        const markedRoutineDates = routineData.reduce((acc, item) => {
          const dateString = item.take_date;
          
          // 모든 스케줄을 순회하며 routine_medicine_dtos 확인
          const hasRoutineMedicines = item.user_schedule_dtos.some(schedule => 
            schedule.routine_medicine_dtos.length > 0
          );
      
          // 하나라도 routine_medicine_dtos가 있으면 마크
          if (hasRoutineMedicines) {
            acc[dateString] = {
              marked: true,
            };
          }
          return acc;
        }, {});

        // 기존 markedDates와 병합
        setRoutineMarkedDates({
          ...markedDates,
          ...markedRoutineDates
        });
      } catch (error) {
        console.error('루틴 데이터 가져오기 실패:', error);
      }
    };

    fetchMonthlyRoutine();
  };

  // 컴포넌트 마운트 시 초기 월의 루틴 데이터 가져오기
  useEffect(() => {
    handleMonthChange({
      year: currentMonth.year(),
      month: currentMonth.month() + 1
    });
  }, []);

  // 커스텀 날짜 컴포넌트 
  const CustomDay = React.memo(({ date, state, marking, onPress }) => {
    const isSelected = selectedDate === date.dateString;
    const hasRoutine = marking?.marked || false;
    const isToday = date.dateString === new Date().toISOString().split('T')[0];
    
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
          <DayText style={dayTextStyle}>{date.day}</DayText>
          
          {/* 루틴이 있는 경우 */}
          {hasRoutine && (
            <IconContainer>
              <RoutineIcons.medicine 
                width={15} 
                height={15}
                color={themes.light.pointColor.Primary} 
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
        locale="ko"
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
          />
        )}
        markedDates={{
          ...markedDates,
          ...routineMarkedDates
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
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Bold';

`;

const IconContainer = styled.View`
  position: absolute;
  bottom: 10px;
  align-items: center;
`;

const StyledCalendar = styled(Calendar).attrs({
  theme: {
    backgroundColor: themes.light.bgColor.bgPrimary,
    calendarBackground: themes.light.bgColor.bgPrimary,
    textSectionTitleColor: themes.light.textColor.textPrimary,
    monthTextColor: themes.light.textColor.textPrimary,
    todayTextColor: themes.light.pointColor.Primary,
    dayTextColor: themes.light.textColor.textPrimary,
    textDisabledColor: themes.light.textColor.Primary20,
    arrowColor: themes.light.textColor.textPrimary,
    fontFamily: 'Pretendard-ExtraBold',
    textDayFontSize: 15,
    textMonthFontSize: 20,
    textDayHeaderFontSize: 13,
    textDayFontWeight: '600',
    textMonthFontWeight: '800',
    textDayHeaderFontWeight: '800',
    'stylesheet.calendar.header': {
      dayTextAtIndex0: {
        color: themes.light.pointColor.Secondary,
      },
    },
  },
  monthFormat: 'yyyy.MM',
  renderArrow: direction => (
    <HeaderIcons.chevron
      style={{
        transform: [{ rotate: direction === 'left' ? '0deg' : '180deg' }],
        marginHorizontal: 30,
        color: themes.light.textColor.textPrimary,
      }}
      height={16}
      width={16}
    />
  ),
})``;

export default CalendarWidget;