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
            container: {
                ...defaultStyles.container,
            },
            month: {
                ...defaultStyles.month,
            },
            monthText: {
                ...defaultStyles.monthText,
            },
            weekdays: {
              ...defaultStyles.weekdays,
            },
            weekday: {
                ...defaultStyles.weekday,
            },
            days: {
              ...defaultStyles.days,
            },
            day: {
                width: 46,
                height: 46,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center'
            },
            dayLabel: {
              fontSize: FontSizes.caption.default,
            },
            today: {
                ...defaultStyles.today,
            },
            selected: {
                backgroundColor: themes.light.pointColor.Primary,
            },
            selected_label: {
                color: themes.light.textColor.buttonText,
            },
          }}
        locale="ko"
      />
    );
};