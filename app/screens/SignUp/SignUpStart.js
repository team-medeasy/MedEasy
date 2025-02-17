import React from 'react';
import {SafeAreaView, Image, TouchableOpacity, Text} from 'react-native';
import styled from 'styled-components/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {themes, fonts} from './../../styles';
import LogoSvg from './../../assets/images/logo.svg';

const currentTheme = themes.light;

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const Container1 = styled.View`
  margin-top: 70px;
  margin-left: 40px;
`;

const Container2 = styled.View`
  align-items: center;
  margin-top: 100px;
  margin-bottom: 100px;
`;

const Container3 = styled.View`
  align-items: center;
  height: 152px;
`;

const LogoImage = styled(Image)`
  width: 250px;
  height: 250px;
`;

const SignUpBtn = styled(TouchableOpacity)`
  width: 90%;
  height: 53px;
  background-color: ${themes.light.boxColor.buttonPrimary};
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  margin-bottom: 12px;
  flex-direction: row;
  gap: 20px;
`;

const BtnText = styled(Text)`
  color: ${themes.light.textColor.buttonText};
  font-size: 15px;
  font-family: 'Pretendard-SemiBold';
`;

const EmailBtn = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const EmailBtnText = styled.Text`
  font-size: 12px;
  font-family: 'Pretendard-SemiBold';
  color: #0006;
`;

const SignUpStartScreen = ({navigation}) => {
  return (
    <Container>
      <Container1>
        <Text
          style={{
            fontFamily: fonts.title.fontFamily,
            fontSize: fonts.title.fontSize,
          }}>
          메디지와 함께{'\n'}규칙적인 복약 습관{'\n'}만들어 가요!
        </Text>
      </Container1>
      <Container2>
        <LogoSvg width={250} height={250} />
      </Container2>
      <Container3>
        <SignUpBtn onPress={() => navigation.navigate('NavigationBar')}>
          <BtnText>카카오톡으로 시작하기</BtnText>
        </SignUpBtn>
        <SignUpBtn onPress={() => console.log('Google 로그인')}>
          <FontAwesome name="google" size={20} color="#ffffff" />
          <BtnText>Google로 시작하기</BtnText>
        </SignUpBtn>
        <EmailBtn onPress={() => navigation.navigate('SignUpName')}>
          <EmailBtnText>이메일로 시작하기</EmailBtnText>
        </EmailBtn>
      </Container3>
    </Container>
  );
};

export default SignUpStartScreen;
