import React, {useState} from 'react';
import {SafeAreaView, Text} from 'react-native';
import styled from 'styled-components/native';
import {themes, fonts} from './../../styles';
import {BackAndNextButtons} from './../../components';
import {useSignUp} from '../../api/context/SignUpContext';
import {handleLogin} from '../../api/services/authService';

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
  margin-top: auto;
  padding-left: 20px;
  padding-right: 20px;
`;

const TextInput = styled.TextInput`
  height: 60px;
  border-radius: 10px;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 20px;
  font-size: 16px;
`;

const SignInScreen = ({navigation, route}) => {
  const {updateSignUpData} = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNext = async () => {
    if (!email) {
      alert('이메일을 입력하세요.');
      return;
    }
  
    if (!password) {
      alert('비밀번호를 입력하세요.');
      return;
    }
  
    try {
      // 로그인 시도 및 사용자 정보 가져오기
      const response = await handleLogin({ email, password });
  
      console.log('로그인 성공:', response);
  
      const userData = response?.body;
  
      if (!userData) {
        throw new Error('사용자 데이터를 가져올 수 없습니다.');
      }
  
      // * name값만 들어오므로 임시로 name을 firstName으로 지정 (추후 수정)
      const firstName = userData.name || '';
  
      updateSignUpData({
        email,
        password,
        firstName, 
        gender: userData.gender,
        birthday: userData.birthday,
      });
  
      console.log('최종 저장된 SignUp Data:', {
        email,
        password,
        firstName,
        gender: userData.gender,
        birthday: userData.birthday,
      });
  
      // 홈 화면 이동
      navigation.reset({ index: 0, routes: [{ name: 'NavigationBar' }] });
    } catch (error) {
      console.error('로그인 실패:', error);
      alert(error.message || '로그인에 실패했습니다.');
    }
  };  

  return (
    <Container>
      <Container1>
        <Text
          style={{
            fontFamily: fonts.title.fontFamily,
            fontSize: fonts.title.fontSize,
          }}>
          안녕하세요, 메디지입니다 👋
        </Text>
        <Text
          style={{
            fontFamily: 'Pretendard-Medium',
            fontSize: 16,
            marginTop: 7,
            color: themes.light.textColor.Primary50,
          }}>
          로그인 후 다양한 서비스를 이용해 보세요!
        </Text>
      </Container1>

      <Container2>
        <InputContainer marginBottom="5px">
          <TextInput
            placeholder="이메일 입력"
            value={email}
            onChangeText={setEmail}
          />
        </InputContainer>
        <InputContainer marginBottom="5px">
          <TextInput
            placeholder="비밀번호 입력"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </InputContainer>
      </Container2>

      <BtnContainer>
        <BackAndNextButtons
          onPressPrev={() => navigation.goBack()}
          onPressNext={handleNext}
        />
      </BtnContainer>
    </Container>
  );
};

export default SignInScreen;