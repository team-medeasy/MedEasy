import { Header } from '@react-navigation/stack';
import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { pointColor, themes } from './../../styles';

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
              <InfoText>약 챙겨먹은지 5일째</InfoText>
            </DaysSinceMedication>
            <MedicationCount>
              <InfoText>복용중인 약 3개</InfoText>
            </MedicationCount>
          </InfoContainer>
        </ProfileContainer>
        <ProfileSettings />
        <Settings />
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
  border-radius: 10px; 
`;

const MedicationCount = styled.View`
  background-color: ${pointColor.pointPrimaryDark};
  padding: 15px;
  border-radius: 10px;
`;

const InfoText = styled.Text`
  font-size: 16px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

const ProfileSettings = styled.View`
  justify-content: center;
  border-bottom-width: 10px;
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
`;

const Settings = styled.View`
  justify-content: center;
`;

export default MyPage;


