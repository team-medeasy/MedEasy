import React from 'react';
import {SafeAreaView, Image, TouchableOpacity, Text, View} from 'react-native';
import styled from 'styled-components/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {themes, fonts} from './../../styles';
import {OtherIcons} from './../../../assets/icons';
const {kakao: KakaoIcon} = OtherIcons;

import LogoSvg from './../../../assets/images/logo.svg';
import FontSizes from '../../../assets/fonts/fontSizes';
const currentTheme = themes.light;

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
  justify-content: space-between;
`;

const TitleContainer = styled.View`
  margin-top: 70px;
  margin-left: 40px;
`;

const LogoContainer = styled.View`
  align-items: center;
`;

const ButtonContainer = styled.View`
  align-items: center;
  padding: 0 20px;
`;

const SignUpBtn = styled(TouchableOpacity)`
  padding: 16px 0;
  width: 100%;
  background-color: ${themes.light.boxColor.buttonPrimary};
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  margin-bottom: 10px;
  flex-direction: row;
  gap: 20px;
`;

const BtnText = styled(Text)`
  color: ${themes.light.textColor.buttonText};
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-SemiBold';
`;

const EmailBtn = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const EmailBtnText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-SemiBold';
  color: #0006;
`;
const SignUpContainer = styled.View`
  flex-direction: row;
  margin-top: 10px;
  margin-bottom: 20px;
  gap: 20px;
`;

const SignUpStartScreen = ({navigation}) => {
  return (
    <Container>
      <TitleContainer>
        <Text
          style={{
            fontFamily: fonts.title.fontFamily,
            fontSize: fonts.title.fontSize,
          }}>
          메디지와 함께{'\n'}규칙적인 복약 습관{'\n'}만들어 가요!
        </Text>
      </TitleContainer>
      <LogoContainer>
        <LogoSvg width={250} height={250} />
      </LogoContainer>
      <ButtonContainer>
        <SignUpBtn onPress={() => navigation.navigate('NavigationBar')}>
          <KakaoIcon
            height={18}
            width={18}
            style={{color: themes.light.textColor.buttonText}}
          />
          <BtnText>카카오톡으로 시작하기</BtnText>
        </SignUpBtn>
        <SignUpBtn onPress={() => console.log('Google 로그인')}>
          <FontAwesome name="google" size={20} color="#ffffff" />
          <BtnText>Google로 시작하기</BtnText>
        </SignUpBtn>
        <SignUpContainer>
          <EmailBtn onPress={() => navigation.navigate('SignUpName')}>
            <EmailBtnText>회원가입</EmailBtnText>
          </EmailBtn>
          <EmailBtn onPress={() => navigation.navigate('SignIn')}>
            <EmailBtnText>이메일 로그인</EmailBtnText>
          </EmailBtn>
        </SignUpContainer>
      </ButtonContainer>
    </Container>
  );
};

export default SignUpStartScreen;
