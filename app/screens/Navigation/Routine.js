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
  
  // 초기 상태에 month 정보 추가
  const [selectedDate, setSelectedDate] = useState({
    day: weekDays[today.day()],
    date: today.date(),
    month: today.month() + 1, // 1부터 시작하는 월 (1-12)
    year: today.year(),
    fullDate: today // 전체 날짜 객체 저장
  });

  // 루틴 탭이 포커스될 때마다 오늘 날짜로 초기화
  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate({
        day: weekDays[today.day()],
        date: today.date(),
        month: today.month() + 1,
        year: today.year(),
        fullDate: today
      });
    }, [])
  );

  // 현재 주의 날짜들 계산
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = today.startOf('week').add(i, 'day');
    return {
      day: weekDays[date.day()],
      date: date.date(),
      month: date.month() + 1, // 1-12로 표시
      year: date.year(),
      fullDate: date, // 전체 날짜 객체 저장
      // 날짜, 월, 년도 모두 같을 때만 오늘로 인식
      isToday: date.date() === today.date() && 
               date.month() === today.month() && 
               date.year() === today.year()
    };
  });

  const getRelativeDayText = (selectedDate, today) => {
    // 선택된 날짜의 yyyy-mm-dd 형식 문자열 생성
    const selectedStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.date).padStart(2, '0')}`;
    const todayStr = `${today.year()}-${String(today.month() + 1).padStart(2, '0')}-${String(today.date()).padStart(2, '0')}`;
    
    // 두 날짜를 비교를 위해 동일한 형식으로 변환
    const selectedDateObj = dayjs(selectedStr);
    const todayObj = dayjs(todayStr);
    
    // 날짜 간 차이 계산 (일수)
    const diff = selectedDateObj.diff(todayObj, 'day');
    
    if (diff === 0) return '오늘';
    if (diff === -1) return '어제';
    if (diff <= -2) return `${Math.abs(diff)}일 전`;
    if (diff === 1) return '내일';
    if (diff === 2) return '모레';
    if (diff > 2) return `${diff}일 후`;
    return `${diff}일 후`; // 기본값
  };
  
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
        {currentWeek.map((dayInfo, index) => (
          <DayBox
            key={index}
            isToday={dayInfo.isToday}
            isSelected={
              selectedDate.date === dayInfo.date && 
              selectedDate.month === dayInfo.month && 
              selectedDate.year === dayInfo.year
            }
            onPress={() => setSelectedDate(dayInfo)}>
            <DayText>{dayInfo.day}</DayText>
            <DateText isToday={dayInfo.isToday}>{dayInfo.date}</DateText>
          </DayBox>
        ))}
      </DayContainer>
      <ScheduleContainer>
        <TodayContainer>
          <TodayText>{getRelativeDayText(selectedDate, today)}</TodayText>
          <TodayDate>{`${selectedDate.month}월 ${selectedDate.date}일 ${selectedDate.day}요일`}</TodayDate>
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

// 스타일 컴포넌트는 변경 없음
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