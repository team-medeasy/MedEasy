import React from 'react';
import styled from 'styled-components/native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import Logo from './../../../assets/icons/logo/logo.svg';
import Logo_kr from './../../../assets/icons/logo/logo_kr.svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Home = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <LogoContainer>
        <Logo height={23} />
        <Logo_kr height={20} style={{ marginLeft: -250 }} />
        <TouchableOpacity>
          <Notification>
            <Icon name="bell-outline" size={30} color="black" />
          </Notification>
        </TouchableOpacity>
      </LogoContainer>

      <ScrollContainer>
        {/* 약 알림 */}
        <PillReminderContainer>
          <ReminderText>한성님, {'\n'}까먹은 약이 있어요.</ReminderText>
        </PillReminderContainer>

        {/* 달력 */}
        <CalendarContainer>
          <StyledCalendar />
        </CalendarContainer>
      </ScrollContainer>
    </SafeAreaView>
  );
};

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

const LogoContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  padding: 10px;
  background-color: white;
`;

const Notification = styled.View`
  margin-right: 20px;
`;

const PillReminderContainer = styled.View`
  padding: 15px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  border-bottom-width: 10px;
  border-bottom-color: #f5f5f5;
`;

const ReminderText = styled.Text`
  font-size: 22px;
  font-family: 'KimjungchulGothic-Bold';
  margin-left: 10px;
`;

const CalendarContainer = styled.View`
  padding: 20px;
  margin-top: 20px;
`;

const StyledCalendar = styled(Calendar).attrs({
  theme: {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#000000',
    selectedDayBackgroundColor: '#000000',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#FF6565',
    dayTextColor: '#000000',
    textDisabledColor: '#d9e1e8',
    arrowColor: '#000000',
    fontFamily: 'KimjungchulGothic-Regular',
    textDayFontSize: 15, // 날짜 폰트 크기
    textMonthFontSize: 20, // 월 폰트 크기
    textDayHeaderFontSize: 13, // 요일(월,화,수 등) 폰트 크기
    textDayFontWeight: '600', // 날짜 굵기
    textMonthFontWeight: '800', // 월 굵기
    textDayHeaderFontWeight: '600', // 요일 굵기
  },
  monthFormat: 'yyyy.MM', 
})``;

export default Home;
