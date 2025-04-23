import React, { useState } from 'react';
import styled from 'styled-components/native';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import { fonts, themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';

export const CustomCalendar = ({
  selectedDate,
  onDateChange,
  mode = 'single',
}) => {
  const defaultStyles = useDefaultStyles();
  const [selected, setSelected] = useState(selectedDate);

  return (
    <CalendarContainer>
      <DateTimePicker
        mode={mode}
        date={selected}
        onChange={({ date }) => {
          console.log('선택된 날짜:', date);
          setSelected(date);
          onDateChange(date);
        }}
        styles={{
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
            fontSize: FontSizes.body.default,
            color: themes.light.textColor.buttonText,
          },
          day_label: {
            fontFamily: `Pretendard-SemiBold`,
            fontSize: FontSizes.body.default,
            color: themes.light.textColor.textPrimary,
          },
          weekday_label: {
            fontFamily: `Pretendard-Medium`,
            fontSize: FontSizes.caption.default,
            color: themes.light.textColor.textPrimary,
          },
          year_selector_label: {
            fontFamily: `Pretendard-Bold`,
            fontSize: FontSizes.title.default,
            color: themes.light.textColor.textPrimary,
          },
          month_selector_label: {
            fontFamily: `Pretendard-Bold`,
            fontSize: FontSizes.title.default,
            color: themes.light.textColor.textPrimary,
          },
        }}
        locale="ko"
      />
    </CalendarContainer>
  );
};

const CalendarContainer = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
`;

