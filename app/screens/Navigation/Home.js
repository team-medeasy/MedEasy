import React from 'react';
import styled from 'styled-components/native';
import {SafeAreaView, TouchableOpacity} from 'react-native';
import {themes} from './../../styles';

import {HeaderIcons, RoutineIcons, LogoIcons} from './../../../assets/icons';
import CalendarWidget from '../../components/CalendarWidget';

const {notification: NotificationIcon, chevron: ArrowIcon} = HeaderIcons;
const {logoKr: LogoKrIcon, logo: LogoIcon, logoAdd: LogoAddIcon} = LogoIcons;
const {medicine: MediIcon, hospital: HospitalIcon} = RoutineIcons;

const Home = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <LogoContainer>
        <LogoIcon
          height={23}
          style={{color: themes.light.pointColor.Primary}}
        />
        <LogoKrIcon
          height={20}
          style={{marginLeft: -210, color: themes.light.pointColor.Primary}}
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
          <TextContainer>
            <ReminderText>한성님, {'\n'}까먹은 약이 있어요.</ReminderText>
            <LogoIcon
              width={70}
              height={112}
              style={{
                color: themes.light.pointColor.Primary10,
                transform: [{rotate: '10deg'}],
                position: 'absolute',
                bottom: -20,
                right: 20,
              }}
            />
          </TextContainer>
          {/* 버튼 추가 */}
          <RoutineContainer>
            <RoutineButton onPress={() => console.log('루틴 추가')}>
              <LogoAddIcon
                height={115}
                style={{color: themes.light.pointColor.primary30}}
              />
              <RoutineButtonText>루틴을 추가해주세요.</RoutineButtonText>
            </RoutineButton>
          </RoutineContainer>
          <ButtonContainer>
            <AddButton onPress={() => console.log('복용 루틴 추가')}>
              <ButtonContent>
                <MediIcon
                  height={16}
                  style={{
                    marginRight: -150,
                    color: themes.light.pointColor.Primary,
                  }}
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
                  style={{
                    marginRight: -150,
                    color: themes.light.pointColor.Secondary,
                  }}
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
        <CalendarWidget />
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
  padding: 20px;
  flex-direction: column;
  justify-content: space-between;
  border-bottom-width: 10px;
  border-bottom-color: ${themes.light.bgColor.bgSecondary};
`;

const TextContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  padding: 20px 0px;
`;

const ReminderText = styled.Text`
  font-size: 22px;
  font-family: 'KimjungchulGothic-Bold';
  margin-left: 10px;
`;

const RoutineContainer = styled.View`
  align-items: center;
`;

const RoutineButton = styled(TouchableOpacity)`
  background-color: ${themes.light.pointColor.Primary20};
  width: 100%;
  height: 220px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const RoutineButtonText = styled.Text`
  font-size: 16px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.pointColor.Primary};
  margin-top: 10px;
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

export default Home;
