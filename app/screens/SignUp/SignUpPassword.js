import React, {useState} from 'react';
import {SafeAreaView, Text, TouchableWithoutFeedback, Keyboard, View, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {themes, fonts} from './../../styles';
import {ProgressBar, BackAndNextButtons} from './../../components';
import {useSignUp} from '../../api/context/SignUpContext';
import FontSizes from '../../../assets/fonts/fontSizes';
import { handleSignUp } from '../../api/services/authService';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const Container1 = styled.View`
  justify-content: center;
  margin-top: 78px;
  margin-left: 30px;
`;

const Container2 = styled.View`
  margin-left: 25px;
  margin-right: 25px;
  margin-top: 37px;
`;

const InputContainer = styled.View`
  width: 100%;
  margin-top: ${props => props.marginTop || '0px'};
  margin-bottom: ${props => props.marginBottom || '0px'};
`;

const PasswordContainer = styled.View`
  flex-direction: row;
  align-items: center;
  height: 60px;
  border-radius: 10px;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding-right: 10px;
  overflow: hidden;
`;

const BtnContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 30px;
  align-items: center;
`;

const TextInput = styled.TextInput`
  height: 60px;
  border-radius: 10px;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 20px;
  font-size: ${FontSizes.body.default};
`;

const TxtLabel = styled.Text`
  height: 60px;
  border-radius: 10px;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 20px;
  font-size: ${FontSizes.body.default};
`;

// show or hide password
const ShowHideButton = styled.Text`
  color: ${themes.light.textColor.placeholder};
  font-size: 14px;
  padding: 5px 10px;
`;

const SignUpPasswordScreen = ({navigation}) => {
  const {signUpData, updateSignUpData} = useSignUp();
  const [password, setPassword] = useState(signUpData.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const progress = '75%';

  const handleNext = async () => {
    if (!password) {
      alert('비밀번호를 입력하세요.');
      return;
    }
  
    try {
      const updatedData = { ...signUpData, password };
      updateSignUpData(updatedData); // 선택: context 업데이트 유지하려면
  
      await handleSignUp(updatedData, navigation); // 여기서 회원가입 요청
      console.log('회원가입 성공!');
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <ProgressBar progress={progress} />
        <Container1>
          <Text
            style={{
              fontFamily: fonts.title.fontFamily,
              fontSize: fonts.title.fontSize,
            }}>
            {signUpData.name}님, 반가워요!
          </Text>
          <Text
            style={{
              fontFamily: 'Pretendard-Medium',
              fontSize: 16,
              marginTop: 7,
              color: themes.light.textColor.Primary50,
            }}>
            비밀번호를 입력해주세요.
          </Text>
        </Container1>
        <Container2>
          <InputContainer marginBottom="5px">
            <PasswordContainer>
              <TextInput
                style={{
                  flex: 1, 
                  paddingRight: 0,
                  backgroundColor: 'transparent',
                  borderRadius: 0
                }}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호 입력"
                placeholderTextColor={themes.light.textColor.placeholder}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <ShowHideButton style={{
                  color: themes.light.textColor.placeholder
                }}>
                  {showPassword ? '숨기기' : '보기'}
                </ShowHideButton>
              </TouchableOpacity>
            </PasswordContainer>
          </InputContainer>
          <InputContainer marginTop="5px" marginBottom="5px">
            <TxtLabel>{signUpData.email}</TxtLabel>
          </InputContainer>
          <InputContainer marginTop="5px">
            <TxtLabel>{signUpData.name}</TxtLabel>
          </InputContainer>
        </Container2>
        <BtnContainer>
          <BackAndNextButtons
            nextTitle="메디지 시작하기"
            onPressPrev={() => navigation.goBack()}
            onPressNext={handleNext}
          />
        </BtnContainer>
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default SignUpPasswordScreen;
