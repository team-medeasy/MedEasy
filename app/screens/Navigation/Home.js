import React from 'react';
import styled from 'styled-components/native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {SafeAreaView, TouchableOpacity} from 'react-native';
import {pointColor, themes} from './../../styles';

import {HeaderIcons, RoutineIcons, LogoIcons} from './../../../assets/icons';

const {notification: NotificationIcon, chevron: ArrowIcon} = HeaderIcons;
const {logoKr: LogoKrIcon, logo: LogoIcon, logoAdd: LogoAddIcon} = LogoIcons;
const {medicine: MediIcon, hospital: HospitalIcon} = RoutineIcons;

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

const Home = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <LogoContainer>
        <LogoIcon height={23} />
        <LogoKrIcon
          height={20}
          style={{marginLeft: -210, color: themes.light.textColor.textPrimary}}
        />
        <TouchableOpacity>
          <Notification>
            <NotificationIcon height={23} />
          </Notification>
        </TouchableOpacity>
      </LogoContainer>

      <ScrollContainer>
        {/* 약 알림 */}
        <PillReminderContainer>
          <ReminderText>한성님, {'\n'}까먹은 약이 있어요.</ReminderText>
          {/* 버튼 추가 */}
          <RoutineContainer>
            <RoutineButton onPress={() => console.log('루틴 추가')}>
              <LogoAddIcon height={115} />
              <RoutineButtonText>루틴을 추가해주세요.</RoutineButtonText>
            </RoutineButton>
          </RoutineContainer>
          <ButtonContainer>
            <AddButton onPress={() => console.log('복용 루틴 추가')}>
              <ButtonContent>
                <MediIcon
                  height={16}
                  style={{marginRight: -150, color: pointColor.pointPrimary}}
                />
                <ButtonText>복용 루틴 추가하기</ButtonText>
                <ArrowIcon
                  height={16}
                  style={{transform: [{rotate: '180deg'}], opacity: 0.5}}
                />
              </ButtonContent>
            </AddButton>
            <AddButton onPress={() => console.log('병원 진료 추가')}>
              <ButtonContent>
                <HospitalIcon
                  height={16}
                  style={{marginRight: -150, color: pointColor.pointSecondary}}
                />
                <ButtonText>병원 진료 추가하기</ButtonText>
                <ArrowIcon
                  height={16}
                  style={{transform: [{rotate: '180deg'}], opacity: 0.5}}
                />
              </ButtonContent>
            </AddButton>
          </ButtonContainer>
        </PillReminderContainer>

        {/* 달력 */}
        <CalendarContainer>
          <StyledCalendar locale="ko" />
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
`;

const Notification = styled.View`
  margin-right: 10px;
`;

const PillReminderContainer = styled.View`
  padding: 15px;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 20px;
  border-bottom-width: 10px;
  border-bottom-color: ${themes.light.bgColor.bgSecondary};
`;

const ReminderText = styled.Text`
  font-size: 22px;
  font-family: 'KimjungchulGothic-Bold';
  margin-left: 10px;
`;

const RoutineContainer = styled.View`
  padding: 20px 0px;
  align-items: center;
`;

const RoutineButton = styled(TouchableOpacity)`
  background-color: ${pointColor.primary20};
  width: 100%;
  height: 220px;
  justify-content: space-evenly;
  align-items: center;
  border-radius: 10px;
  margin: 10px;
`;

const RoutineButtonText = styled.Text`
  font-size: 16px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${pointColor.pointPrimary};
`;

const ButtonContainer = styled.View`
  flex-direction: column;
  width: 100%;
`;

const AddButton = styled(TouchableOpacity)`
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 10px 0px;
  flex: 1;
`;

const ButtonContent = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

const CalendarContainer = styled.View`
  padding: 20px;
  margin-top: 20px;
`;

const StyledCalendar = styled(Calendar).attrs({
  theme: {
    backgroundColor: themes.light.bgColor.bgPrimary,
    calendarBackground: themes.light.bgColor.bgPrimary,
    textSectionTitleColor: themes.light.textColor.textPrimary,
    //selectedDayBackgroundColor: '#000000',
    //selectedDayTextColor: '#ffffff',
    todayTextColor: pointColor.pointPrimary,
    dayTextColor: themes.light.textColor.textPrimary,
    textDisabledColor: themes.light.textColor.Primary20,
    arrowColor: themes.light.textColor.textPrimary,
    fontFamily: 'Pretendard-ExtraBold',
    textDayFontSize: 15, // 날짜 폰트 크기
    textMonthFontSize: 20, // 월 폰트 크기
    textDayHeaderFontSize: 13, // 요일(월,화,수 등) 폰트 크기
    textDayFontWeight: '600', // 날짜 굵기
    textMonthFontWeight: '800', // 월 굵기
    textDayHeaderFontWeight: '800', // 요일 굵기
    'stylesheet.calendar.header': {
      dayTextAtIndex0: {
        color: pointColor.pointSecondary, // 일요일 (index 0)
      },
    },
  },
  monthFormat: 'yyyy.MM',
  renderArrow: direction => (
    <ArrowIcon
      style={{
        transform: [{rotate: direction === 'left' ? '0deg' : '180deg'}],
        marginHorizontal: 20,
      }}
      height={16}
    />
  ),
})``;

export default Home;
