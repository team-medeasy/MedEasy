import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { OtherIcons } from '../../../assets/icons';
import { themes } from '../../styles';
import dayjs from 'dayjs';

const Routine = () => {
  const today = dayjs();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = today.startOf('week').add(i, 'day');
    return {
      day: weekDays[i],
      date: date.date(),
      isToday: today.isSame(date, 'day'),
    };
  });

  return (
    <Container>
      <Header>
        <HeaderText>루틴</HeaderText>
        <ReturnButton>
          <OtherIcons.return width={11} height={9} style={{ color: themes.light.textColor.Primary50 }} />
          <ButtonText>돌아가기</ButtonText>
        </ReturnButton>
      </Header>
      <DayContainer>
        {currentWeek.map(({ day, date, isToday }, index) => (
          <DayBox key={index} isToday={isToday}>
            <DayText>{day}</DayText>
            <DateText isToday={isToday}>{date}</DateText>
          </DayBox>
        ))}
      </DayContainer>
      <ScheduleContainer>
      </ScheduleContainer>
    </Container>
  );
};

const Container = styled.View`
  background-color: white;
`;

const Header = styled.View`
  flex-direction: row;
  padding: 0px 20px;
  margin-top: 74px;
  justify-content: space-between;
`;

const HeaderText = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${themes.light.textColor.textPrimary};
  padding-left: 10px;
`;

const ReturnButton = styled.TouchableOpacity`
  flex-direction: row;
  padding: 6px 10px;
  justify-content: center;
  align-items: center;
  gap: 7px;
  border: 1px solid ${themes.light.textColor.Primary20};
  border-radius: 20px;
`;

const ButtonText = styled.Text`
  font-size: 12px;
  font-family: 'Pretendart-Regulal';
  color: ${themes.light.textColor.Primary50};
`;

const DayContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: 30px 20px;
`;

const DayBox = styled.View`
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background-color: ${({ isToday }) => (isToday ? themes.light.pointColor.primary30 : 'transparent')};
`;

const DayText = styled.Text`
  font-size: 12px;
  font-family: 'Pretendard-Regular';
  color: ${themes.light.textColor.textPrimary};
`;

const DateText = styled.Text`
  font-size: 18px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

const ScheduleContainer = styled.View`
  
`;

export default Routine;
