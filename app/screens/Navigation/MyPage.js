import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { pointColor, themes } from './../../styles';
import KarteIcon from './../../../assets/icons/karte.svg';
import LogoIcon from './../../../assets/icons/logo/logo.svg';
import { SettingsIcons } from './../../../assets/icons';
import { Footer } from '../../components';

const MyPage = () => {
  return (
    <Container>
      <HeaderContainer>
        <Title>내 정보</Title>
      </HeaderContainer>
      <ScrollContent>
        <ProfileContainer>
          <TextContainer>
            <UserText>안녕하세요, 김한성님🩵</UserText>
            <SmallText>오늘도 건강한 하루 되세요!</SmallText>
          </TextContainer>
          <InfoContainer>
            <DaysSinceMedication>
              <WithMedeasy>메디지와 함께</WithMedeasy>
              <InfoText>약 챙겨먹은지 </InfoText>
              <InfoNum>32일째</InfoNum>
              <IconWrapper><KarteIcon /></IconWrapper>
            </DaysSinceMedication>
            <MedicationCount>
              <WithMedeasy>메디지와 함께</WithMedeasy>
              <InfoText>복용중인 약 </InfoText>
              <InfoNum>5개</InfoNum>
              <IconWrapper><LogoIcon /></IconWrapper>
            </MedicationCount>
          </InfoContainer>
        </ProfileContainer>
        <ProfileSettings>
          <SettingItem>
            <SettingsIcons.profileSettings width={20} height={20} />
            <SettingText>프로필 설정</SettingText>
          </SettingItem>
          <SettingItem>
            <SettingsIcons.notifications width={20} height={20} />
            <SettingText>알림 설정</SettingText>
          </SettingItem>
          <SettingItem>
            <SettingsIcons.textSize width={20} height={20} />
            <SettingText>글자 크기 설정</SettingText>
          </SettingItem>
          <SettingItem>
            <SettingsIcons.favorites width={20} height={20} />
            <SettingText>관심 목록</SettingText>
          </SettingItem>
        </ProfileSettings>
        <Settings>
          <SettingItem>
            <SettingsIcons.announcement width={20} height={20} />
            <SettingText>공지사항</SettingText>
          </SettingItem>
          <SettingItem>
            <SettingsIcons.feedback width={20} height={20} />
            <SettingText>의견 남기기</SettingText>
          </SettingItem>
          <SettingItem>
            <SettingsIcons.faq width={20} height={20} />
            <SettingText>자주 하는 질문</SettingText>
          </SettingItem>
          <SettingItem>
            <SettingsIcons.appVersion width={20} height={20} />
            <SettingText>앱 버전</SettingText>
          </SettingItem>
        </Settings>
        <AccountSetting>
          <SettingItem>
            <SettingsIcons.logout width={20} height={20} />
            <SettingText>로그아웃</SettingText>
          </SettingItem>
          <SettingItem>
            <SettingsIcons.trashcan width={20} height={20} />
            <SettingText>계정 삭제</SettingText>
          </SettingItem>
        </AccountSetting>
        <Footer />
      </ScrollContent>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
`;

const HeaderContainer = styled.View`
  justify-content: flex-end;
  background-color: ${themes.light.boxColor.buttonPrimary};
  padding-top: 50px;
  padding-left: 20px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-family: 'KimjungchulGothic-Bold';
  font-weight: bold;
  color: ${themes.light.textColor.buttonText};
  margin: 20px;
`;

const ScrollContent = styled.ScrollView`
  flex: 1;
`;

const ProfileContainer = styled.View`
  justify-content: center;
  background-color: ${themes.light.boxColor.buttonPrimary};
  padding-bottom: 20px;
`;
const TextContainer = styled.View`
  justify-content: center;
  padding: 20px;
`;

const UserText = styled.Text`
  font-size: 22px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

const SmallText = styled.Text`
  font-size: 14px;
  font-family: 'KimjungchulGothic-Regular';
  color: ${themes.light.textColor.buttonText};
`;

const InfoContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: ${themes.light.boxColor.cardBackground};
  border-radius: 10px;
`;

const DaysSinceMedication = styled.View`
  background-color: ${pointColor.pointPrimary};
  padding: 15px;
  width: 49%;
  aspectRatio: 1;
  border-radius: 10px; 
`;

const MedicationCount = styled.View`
  background-color: ${pointColor.pointPrimaryDark};
  padding: 15px;
  width: 49%;
  aspectRatio: 1;
  border-radius: 10px;
`;

const IconWrapper = styled.View`
  position: absolute;
  transform: rotate(8deg);
  overflow: hidden;
  bottom: -10px;
  right: 20px;
`;

const WithMedeasy = styled.Text`
  font-size: 12px;
  font-family: 'Pretendard-Regular';
  color: ${themes.light.textColor.buttonText};
  padding-bottom: 10px;
`;

const InfoText = styled.Text`
  font-size: 18px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText70};
`;

const InfoNum = styled.Text`
  font-size: 18px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

const ProfileSettings = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  justify-content: center;
  margin-bottom: 10px;
`;

const Settings = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  justify-content: center;
  margin-bottom: 10px;
`;

const AccountSetting = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  justify-content: center;
`;

const SettingItem = styled.TouchableOpacity`
  flex-direction: row;
  padding: 16px 25px;
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
`;

const SettingText = styled.Text`
  font-size: 16px;
  font-family: 'Pretendard-Regular';
  color: ${themes.light.textColor.textPrimary};
  margin-left: 20px;
`;

export default MyPage;


