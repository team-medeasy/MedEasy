import React, {useState} from 'react';
import {SafeAreaView, Text, TouchableWithoutFeedback, Keyboard} from 'react-native';
import styled from 'styled-components/native';
import {themes, fonts} from './../../styles';
import {BackAndNextButtons} from './../../components';
import {useSignUp} from '../../api/context/SignUpContext';
import {handleLogin} from '../../api/services/authService';
import FontSizes from '../../../assets/fonts/fontSizes';

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
  font-size: ${FontSizes.body.default};
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
      const userData = await handleLogin({email, password});
      console.log('로그인 성공:', userData);

      if (userData) {
        // 이름 분리 (성-이름 형태로)
        let lastName = ''; // 성
        let firstName = ''; // 이름

        if (userData.name && userData.name !== 'undefinedundefined') {
          if (userData.name.length >= 2) {
            lastName = userData.name.substring(0, 1); // 첫 글자는 성
            firstName = userData.name.substring(1); // 나머지는 이름
          } else {
            lastName = userData.name; // 한 글자만 있으면 성으로 처리
          }
        }

        updateSignUpData({
          email,
          password,
          lastName, // 성
          firstName, // 이름
          gender: userData.gender || '',
          birthday: userData.birthday || '',
        });

        // 홈 화면 이동
        navigation.reset({index: 0, routes: [{name: 'NavigationBar'}]});
      } else {
        // userData가 없는 경우 (사용자 정보 로드 실패)
        throw new Error('사용자 데이터를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      alert(error.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              placeholderTextColor={themes.light.textColor.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </InputContainer>
          <InputContainer marginBottom="5px">
            <TextInput
              placeholder="비밀번호 입력"
              placeholderTextColor={themes.light.textColor.placeholder}
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
    </TouchableWithoutFeedback>
  );
};

export default SignInScreen;
