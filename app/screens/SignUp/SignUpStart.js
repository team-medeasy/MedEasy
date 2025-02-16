import React from 'react';
import { SafeAreaView, Image, TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';
import { themes, pointColor, fonts } from './../../styles';
import { Button } from './../../components';

const currentTheme = themes.light;

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const Container1 = styled.View`
  background-color: #fff;
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
`;

const WelcomeText = styled.Text`
  font-family: ${fonts.title.fontFamily};
  font-size: ${fonts.title.fontSize};  
`;

const LogoImage = styled(Image)`
  width: 250px;  
  height: 250px;  
`;

const EmailBtn = styled(TouchableOpacity)`
  justify-content: center; 
  align-items: center;  
  border-radius: 10px;
`;

const EmailBtnText = styled.Text`
  font-size: 12px;
  font-family: 'Pretendard-SemiBold';
  color: #0005;
`;

const SignUpStartScreen = ({ navigation }) => {
  return (
    <Container>
      <Container1>
        <WelcomeText>메디지와 함께{"\n"}규칙적인 복약 습관{"\n"}만들어 가요!</WelcomeText>
      </Container1> 
      <Container2>
        <LogoImage source={require('./../../assets/images/logo.png')} />
      </Container2>
      <Container3>
        <Button title="카카오톡으로 시작하기" onPress={() => navigation.navigate('HomePage')} />
        <Button title="Google로 시작하기" onPress={() => console.log('Google 로그인')} />
        <EmailBtn onPress={() => navigation.navigate('')}>
          <EmailBtnText>이메일로 시작하기</EmailBtnText>
        </EmailBtn>
      </Container3>
    </Container>
  );
};

export default SignUpStartScreen;
