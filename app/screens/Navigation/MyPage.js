import React from 'react';
import styled from 'styled-components/native';
import {pointColor, themes} from './../../styles';
import KarteIcon from './../../../assets/icons/karte.svg';
import LogoIcon from './../../../assets/icons/logo/logo.svg';
import {LogoIcons, CameraIcons} from './../../../assets/icons';
import {Footer} from '../../components';
import SettingList from '../../components/SettingList';

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
          <EditProfile>
            <ProfileAddButton onPress={() => alert('프로필 추가')}>
              <LogoIcons.logo
                width={30}
                height={47}
                style={{color: themes.light.bgColor.protileIcon}}
              />
              <EditButton onPress={() => alert('프로필 수정')}>
                <CameraIcons.camera
                  width={15}
                  height={15}
                  style={{color: themes.light.textColor.buttonText}}
                  opacity={0.5}
                />
              </EditButton>
            </ProfileAddButton>
          </EditProfile>
        </ProfileContainer>
        <InfoContainer>
          <DaysSinceMedication>
            <WithMedeasy>메디지와 함께</WithMedeasy>
            <InfoText>약 챙겨먹은지 </InfoText>
            <InfoNum>32일째</InfoNum>
            <IconWrapper>
              <KarteIcon
                width={90}
                height={90}
                style={{color: themes.light.boxColor.tagDetailPrimary}}
              />
            </IconWrapper>
          </DaysSinceMedication>
          <MedicationCount>
            <WithMedeasy>메디지와 함께</WithMedeasy>
            <InfoText>복용중인 약 </InfoText>
            <InfoNum>5개</InfoNum>
            <IconWrapper>
              <LogoIcon
                style={{color: themes.light.boxColor.tagDetailPrimary}}
              />
            </IconWrapper>
          </MedicationCount>
        </InfoContainer>
        <SettingList />
        <Footer />
      </ScrollContent>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
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
  margin-bottom: 20px;
  margin-top: 20px;
`;

const ScrollContent = styled.ScrollView`
  flex: 1;
`;

const ProfileContainer = styled.View`
  align-items: center;
  background-color: ${themes.light.boxColor.buttonPrimary};
  flex-direction: row;
`;
const TextContainer = styled.View`
  justify-content: center;
  padding: 20px;
  position: relative;
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

const EditProfile = styled.View`
  padding: 25px;
`;

const ProfileAddButton = styled.TouchableOpacity`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${themes.light.bgColor.protileIcon};
  justify-content: center;
  align-items: center;
  position: relative;
`;

const EditButton = styled.TouchableOpacity`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${themes.light.boxColor.buttonPrimary};
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: -5px;
  right: -5px;
  border-width: 1px;
  border-color: ${themes.light.boxColor.tagDetailSecondary};
`;

const InfoContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: ${themes.light.boxColor.buttonPrimary};
`;

const DaysSinceMedication = styled.View`
  background-color: ${pointColor.pointPrimary};
  padding: 15px;
  width: 49%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
`;

const MedicationCount = styled.View`
  background-color: ${pointColor.pointPrimaryDark};
  padding: 15px;
  width: 49%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
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

export default MyPage;
