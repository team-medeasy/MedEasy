import React, {useState} from 'react';
import {SafeAreaView, Text, TouchableWithoutFeedback, Keyboard} from 'react-native';
import styled from 'styled-components/native';
import {themes, fonts} from './../../styles';
import {
  ProgressBar,
  BackAndNextButtons,
  InputWithDelete,
  ReadOnlyInput
} from './../../components';
import {useSignUp} from '../../api/context/SignUpContext';
import {handleSignUp} from '../../api/services/authService';

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

const SignUpPasswordScreen = ({navigation}) => {
  const {signUpData, updateSignUpData} = useSignUp();
  const [password, setPassword] = useState(signUpData.password || '');
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
            <InputWithDelete
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호 입력"
              secureTextEntry={true}
              showPasswordToggle={true}  // 이 prop이 제대로 전달되는지 확인
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              textContentType="newPassword"
              autoComplete="password-new"
            />
          </InputContainer>
          <InputContainer marginTop="5px" marginBottom="5px">
            <ReadOnlyInput text={signUpData.email}/>
          </InputContainer>
          <InputContainer marginTop="5px">
            <ReadOnlyInput text={signUpData.name}/>
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