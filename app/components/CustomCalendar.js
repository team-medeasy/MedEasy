import React, { useState } from 'react';
import styled from 'styled-components/native';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { useFontSize } from '../../assets/fonts/FontSizeContext';

export const CustomCalendar = ({
  mode = 'single', // 'single' or 'range'
  // single mode props
  selectedDate,
  onDateChange,
  // range mode props
  selectedRange,
  onRangeChange,
}) => {
  const defaultStyles = useDefaultStyles();
  const { fontSizeMode } = useFontSize();
  
  // 모드에 따라 초기 상태 설정
  const [selected, setSelected] = useState(
    mode === 'single' ? selectedDate : selectedRange
  );

  // DateTimePicker에 전달할 props 준비
  const pickerProps = mode === 'single' 
    ? { date: selected }
    : { startDate: selected?.startDate, endDate: selected?.endDate };

  // 변경 핸들러
  const handleChange = (params) => {
    if (mode === 'single') {
      console.log('선택된 날짜:', params.date);
      setSelected(params.date);
      onDateChange && onDateChange(params.date);
    } else {
      console.log('선택된 날짜 범위:', params);
      const newRange = {
        startDate: params.startDate,
        endDate: params.endDate
      };
      setSelected(newRange);
      onRangeChange && onRangeChange(newRange);
    }
  };

  // 스타일
  const calendarStyles = {
    ...defaultStyles,
    today: { 
        backgroundColor: themes.light.bgColor.bgSecondary,
        borderRadius: 30,
    },
    selected: { 
        backgroundColor: themes.light.pointColor.Primary,
        borderRadius: 30, 
    },
    selected_label: {
        fontFamily: `Pretendard-SemiBold`,
        fontSize: FontSizes.body[fontSizeMode],
        color: themes.light.textColor.buttonText,
    },
    day_label: {
        fontFamily: `Pretendard-SemiBold`,
        fontSize: FontSizes.body[fontSizeMode],
        color: themes.light.textColor.textPrimary,
    },
    weekday_label: {
        fontFamily: `Pretendard-Medium`,
        fontSize: FontSizes.caption[fontSizeMode],
        color: themes.light.textColor.textPrimary,
    },
    year_selector_label: {
        fontFamily: `Pretendard-Bold`,
        fontSize: FontSizes.title[fontSizeMode],
        color: themes.light.textColor.textPrimary,
    },
    month_selector_label: {
        fontFamily: `Pretendard-Bold`,
        fontSize: FontSizes.title[fontSizeMode],
        color: themes.light.textColor.textPrimary,
    },
    // range 모드 전용 스타일
    range_container: {
        backgroundColor: `${themes.light.pointColor.Primary}30`,
    },
    range_day_label: {
        color: themes.light.textColor.textPrimary,
    },
  }

  return (
    <CalendarContainer>
      <DateTimePicker
        mode={mode}
        {...pickerProps}
        onChange={handleChange}
        styles={calendarStyles}
        locale="ko"
      />
    </CalendarContainer>
  );
};

const CalendarContainer = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
`;