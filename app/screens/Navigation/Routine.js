import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { OtherIcons } from '../../../assets/icons';
import { themes } from '../../styles';
import dayjs from 'dayjs';

const Routine = () => {
  const today = dayjs();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const [selectedDate, setSelectedDate] = useState({
    day: weekDays[today.day()],
    date: today.date(),
  });

  // 루틴 탭이 포커스될 때마다 오늘 날짜로 초기화
  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate({
        day: weekDays[today.day()],
        date: today.date(),
      });
    }, [])
  );

  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = today.startOf('week').add(i, 'day');
    return {
      day: weekDays[i],
      date: date.date(),
      isToday: today.isSame(date, 'day'),
    };
  });

  const month = today.format('M');

  // 약과 병원 일정 데이터 (시간, 제목, 설명 포함)
  const medicationSchedule = [
    { time: '08:00', title: '약 1정', description: '오전 8시에 복용' },
    { time: '14:00', title: '약 2정', description: '오후 2시에 복용' },
  ];

  const hospitalSchedule = [
    { time: '10:00', title: '병원 예약', description: '오전 10시에 병원 예약' },
    { time: '15:00', title: '병원 예약', description: '오후 3시에 병원 예약' },
  ];

  // 두 스케줄을 하나로 합치기
  const combinedSchedule = [...medicationSchedule, ...hospitalSchedule];

  // 시간 순으로 정렬
  const sortedSchedule = combinedSchedule.sort((a, b) => {
    return dayjs(a.time, 'HH:mm').isBefore(dayjs(b.time, 'HH:mm')) ? -1 : 1;
  });
  return (
    <Container>
      <Header>
        <HeaderText>루틴</HeaderText>
        <ReturnButton>
          <OtherIcons.return
            width={11}
            height={9}
            style={{ color: themes.light.textColor.Primary50 }}
          />
          <ButtonText>돌아가기</ButtonText>
        </ReturnButton>
      </Header>
      <DayContainer>
        {currentWeek.map(({ day, date, isToday }, index) => (
          <DayBox
            key={index}
            isToday={isToday}
            isSelected={selectedDate.date === date} // 선택된 날짜 확인
            onPress={() => setSelectedDate({ day, date })}>
            <DayText>{day}</DayText>
            <DateText isToday={isToday}>{date}</DateText>
          </DayBox>
        ))}
      </DayContainer>
      <ScheduleContainer>
        <TodayContainer>
          {selectedDate.date === today.date() && (
            <TodayText>오늘</TodayText>
          )}
          <TodayDate>{`${month}월 ${selectedDate.date}일 ${selectedDate.day}요일`}</TodayDate>
        </TodayContainer>

        {/* 스케줄 */}
        <ScheduleContainerInner>
          {sortedSchedule.map((item, index) => (
            <ScheduleItem key={index}>
              <ItemTime>{item.time}</ItemTime>
              <ItemText>{item.title}</ItemText>
              <ItemDescription>{item.description}</ItemDescription>
            </ScheduleItem>
          ))}
        </ScheduleContainerInner>
      </ScheduleContainer>
    </Container>
  );
};
const Container = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const Header = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
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
  font-family: 'Pretendart-Regular';
  color: ${themes.light.textColor.Primary50};
`;

const DayContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: 30px 20px;
  gap: 9px;
`;

const DayBox = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  display: flex;
  padding: 10px 4px;
  border-radius: 7px;
  background-color: ${({ isToday, isSelected }) =>
    isSelected
      ? themes.light.pointColor.Primary20
      : 'transparent'};
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
  background-color: ${themes.light.bgColor.bgSecondary};
`;

const TodayContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 20px;
`;

const TodayText = styled.Text`
  font-size: 22px;
  font-family: 'Pretendard-ExtraBold';
  color: ${themes.light.textColor.textPrimary};
`;

const TodayDate = styled.Text`
  font-size: 22px;
  font-family: 'Pretendard-ExtraBold';
  color: ${themes.light.textColor.Primary30};
`;

const ScheduleContainerInner = styled.View`
  padding: 20px;
`;

const ScheduleItem = styled.View`
  padding: 5px 0;
  flex-direction: row;
  align-items: center;
`;

const ItemTime = styled.Text`
  font-size: 16px;
  color: ${themes.light.textColor.Primary30};
  margin-right: 10px;
`;

const ItemText = styled.Text`
  font-size: 16px;
  color: ${themes.light.textColor.textPrimary};
`;

const ItemDescription = styled.Text`
  font-size: 14px;
  color: ${themes.light.textColor.Primary50};
`;


export default Routine;
