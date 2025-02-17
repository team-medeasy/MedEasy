import React from 'react';
import styled from 'styled-components/native';
import { Calendar } from 'react-native-calendars';
import { View, SafeAreaView } from 'react-native';
import Logo from './../../../assets/icons/logo/logo.svg';
import Logo_kr from './../../../assets/icons/logo/logo_kr.svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native';

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
          <Calendar
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#18337B',
              selectedDayBackgroundColor: '#18337B',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#FF5733',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: 'red',
              arrowColor: '#18337B',
            }}
          />
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

export default Home;