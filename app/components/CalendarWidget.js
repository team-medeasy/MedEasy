import React from 'react';
import styled from 'styled-components/native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {themes} from '../styles';
import {HeaderIcons} from '../../assets/icons';

const {chevron: ChevronIcon} = HeaderIcons;

// 요일을 한글로 설정
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};

LocaleConfig.defaultLocale = 'ko';

const CalendarWidget = () => {
  return (
    <CalendarContainer>
      <StyledCalendar locale="ko" />
    </CalendarContainer>
  );
};

const CalendarContainer = styled.View`
  padding: 20px;
  margin-top: 20px;
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
    <ChevronIcon
      style={{
        transform: [{rotate: direction === 'left' ? '0deg' : '180deg'}],
        marginHorizontal: 20,
      }}
      height={16}
    />
  ),
})``;

export default CalendarWidget;
