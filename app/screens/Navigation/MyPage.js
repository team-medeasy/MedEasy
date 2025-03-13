import React from 'react';
import styled from 'styled-components/native';
import {Platform} from 'react-native';
import {themes} from './../../styles';
import {Footer} from '../../components';
import MedicationInfo from '../../components/MedicationInfo';
import SettingList from '../../components/SettingList';
import FontSizes from '../../../assets/fonts/fontSizes';

import { useSignUp } from '../../api/context/SignUpContext';

const MyPage = () => {
  const {signUpData} = useSignUp();

  return (
    <Container>
      <ScrollContent>
        {/* 헤더 */}
        <HeaderContainer>
          <Title>내 정보</Title>
        </HeaderContainer>
        {/* 웰컴 메시지, 프로필 설정 */}
        <ProfileContainer>
          <TextContainer>
            <UserText>안녕하세요, {signUpData.firstName + signUpData.lastName}님🩵</UserText>
            <SmallText>오늘도 건강한 하루 되세요!</SmallText>
          </TextContainer>
        </ProfileContainer>
        {/* 약 챙겨먹은 일수 */}
        <MedicationInfo days={32} medicationCount={5} />
        {/* 설정 리스트 */}
        <VSpacer height={24} />
        <SettingList />
        <VSpacer height={48} />
        {/* Footer */}
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
  ${Platform.OS === 'ios' && `padding-top: 50px;`}
  ${Platform.OS === 'android' && `padding-top: 20px;`}
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
  gap: 9px;
`;

const UserText = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

const SmallText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'KimjungchulGothic-Regular';
  color: ${themes.light.textColor.buttonText60};
`;

const VSpacer = styled.View`
  height: ${({height}) => height || 16}px;
`;
export default MyPage;
