import React from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  Platform,
} from 'react-native';
import styled from 'styled-components/native';
import {IconTextButton} from '../../components';
import {themes, fonts} from './../../styles';
import {OtherIcons, Images} from './../../../assets/icons';
const {kakao: KakaoIcon} = OtherIcons;

// 로그인 서비스 import
import {
  handleKakaoLogin,
  handleAppleLogin,
} from '../../api/services/authService'; // handleAppleLogin 추가

// 애플 로그인 (iOS 전용)
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';

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

const ImageContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

const ButtonContainer = styled.View`
  align-items: center;
  padding: 0 20px;
  gap: 12px;
`;

const AppleButtonStyled = styled(AppleButton)`
  width: 100%;
  height: 50px;
  margin-bottom: 12px;
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
  // 카카오 로그인 처리 함수
  const onKakaoLogin = async () => {
    try {
      await handleKakaoLogin(navigation);
    } catch (error) {
      console.error('카카오 로그인 화면 처리 오류:', error);
    }
  };

  // 애플 로그인 처리 함수
  const onAppleLogin = async () => {
    try {
      await handleAppleLogin(navigation);
    } catch (error) {
      console.error('애플 로그인 화면 처리 오류:', error);
    }
  };

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
      <ImageContainer>
        <Images.signIn />
      </ImageContainer>

      <ButtonContainer>
        {/* {Platform.OS === 'ios' && (
          <AppleButtonStyled
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            onPress={onAppleLogin}
          />
        )} */}
        <IconTextButton
          onPress={onAppleLogin}
          icon={
            <OtherIcons.Apple
              height={18}
              width={18}
              style={{color: themes.light.textColor.buttonText}}
            />
          }
          title="Apple로 시작하기"
        />
        <IconTextButton
          onPress={onKakaoLogin}
          icon={
            <KakaoIcon
              height={18}
              width={18}
              style={{color: themes.light.textColor.buttonText}}
            />
          }
          title="카카오톡으로 시작하기"
        />

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
