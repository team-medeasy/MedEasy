import React from 'react';
import {SafeAreaView, TouchableOpacity, Text, View} from 'react-native';
import styled from 'styled-components/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { IconTextButton } from '../../components';
import {themes, fonts} from './../../styles';
import {OtherIcons} from './../../../assets/icons';
const {kakao: KakaoIcon} = OtherIcons;

import FontSizes from '../../../assets/fonts/fontSizes';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
  justify-content: space-between;
`;

const TitleContainer = styled.View`
  margin-top: 70px;
  margin-left: 40px;
`;

const ButtonContainer = styled.View`
  align-items: center;
  padding: 0 20px;
`;

const EmailBtn = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const EmailBtnText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.Primary50};
`;

const SignUpContainer = styled.View`
  flex-direction: row;
  margin-top: 2px;
  margin-bottom: 12px;
  gap: 4px;
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

      <ButtonContainer>
        <View style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            padding: 20,
            gap: 12
        }}>
        <IconTextButton
          onPress={() => navigation.navigate('NavigationBar')}
          icon={
            <KakaoIcon
              height={18}
              width={18}
              style={{color: themes.light.textColor.buttonText}}
            />
          }
          title="카카오톡으로 시작하기"
        />
        <IconTextButton
          onPress={() => console.log('Google 로그인')}
          icon={
            <FontAwesome 
              name="google" 
              size={20} 
              color={themes.light.textColor.buttonText}
            />
          }
          title="Google로 시작하기"
        />
        </View>

        <SignUpContainer>
          <EmailBtn
            style={{padding: 8}}
            onPress={() => navigation.navigate('SignUpName')}>
            <EmailBtnText>회원가입</EmailBtnText>
          </EmailBtn>
          <EmailBtn
            style={{padding: 8}}
            onPress={() => navigation.navigate('SignIn')}>
            <EmailBtnText>이메일 로그인</EmailBtnText>
          </EmailBtn>
        </SignUpContainer>
      </ButtonContainer>
    </Container>
  );
};

export default SignUpStartScreen;
