import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import {useFontSize} from '../../assets/fonts/FontSizeContext';
import dayjs from 'dayjs';

const TodayHeader = ({today, selectedDate}) => {
  const {fontSizeMode} = useFontSize();

  const getRelativeDayText = (selectedDate, today) => {
    const selectedDateObj = dayjs(
      `${selectedDate.year}-${selectedDate.month}-${selectedDate.date}`,
    );
    const todayObj = dayjs(
      `${today.year()}-${today.month() + 1}-${today.date()}`,
    );
    const diff = selectedDateObj.diff(todayObj, 'day');

    if (diff === 0) return '오늘';
    if (diff === -1) return '어제';
    if (diff === 1) return '내일';
    if (diff === 2) return '모레';
    return diff < 0 ? `${Math.abs(diff)}일 전` : `${diff}일 후`;
  };

  return (
    <TodayContainer>
      <TodayText fontSizeMode={fontSizeMode}>
        {getRelativeDayText(selectedDate, today)}
      </TodayText>
      <TodayDate fontSizeMode={fontSizeMode}>
        {`${selectedDate.month}월 ${selectedDate.date}일 ${selectedDate.day}요일`}
      </TodayDate>
    </TodayContainer>
  );
};
const TodayContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
`;

const TodayText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  font-family: 'Pretendard-ExtraBold';
  color: ${themes.light.textColor.textPrimary};
`;

const TodayDate = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  font-family: 'Pretendard-ExtraBold';
  color: ${themes.light.textColor.Primary30};
`;

export default TodayHeader;
