import React, {useState} from 'react';
import {SafeAreaView, Text, Keyboard, TouchableWithoutFeedback, View, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {themes, fonts} from './../../styles';
import {ProgressBar, BackAndNextButtons} from './../../components';
import {useSignUp} from '../../api/context/SignUpContext';
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

const TxtLabel = styled.Text`
  height: 60px;
  border-radius: 10px;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 20px;
  font-size: ${FontSizes.body.default};
`;

const ErrorText = styled.Text`
  font-family: 'Pretendard-Medium';
  color: red;
  margin-top: 5px;
  font-size: 12px;
`;

const SignUpEmailScreen = ({navigation, route}) => {
  const {signUpData, updateSignUpData} = useSignUp();
  const [email, setEmail] = useState(signUpData.email || '');
  const[emailError, setEmailError] = useState('');
  const progress = '50%';

  const validateEmail = text => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(text && !emailRegex.test(text)) {
      setEmailError('유효한 이메일 주소를 입력해주세요');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  const handleEmailChange = text => {
    setEmail(text);
    setEmailError('');
  };

  // when email input is unfocused, validate email
  const handleEmailBlur = () => {
    if (email) validateEmail(email);
  };

  const handleNext = () => {
    if (!email) {
      setEmailError('이메일을 입력해주세요');
      return;
    }
    
    if (!validateEmail(email)) {
      return;
    }
    
    updateSignUpData({email});
    navigation.navigate('SignUpPassword');
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
            이메일 주소를 입력해주세요.
          </Text>
        </Container1>
        <Container2>
          <InputContainer marginBottom="5px">
            <TextInput
              placeholder="example@hansung.kr"
              placeholderTextColor={themes.light.textColor.placeholder}
              value={email}
              onChangeText={handleEmailChange}
              returnKeyType="done"
              onBlur={handleEmailBlur}
              onSubmitEditing={Keyboard.dismiss}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              spellCheck={false}
              blurOnSubmit={true}
            />
            {emailError ? <ErrorText>{emailError}</ErrorText> : null}
          </InputContainer>
          <InputContainer marginTop="15px">
            <TxtLabel>{signUpData.name}</TxtLabel>
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

export default SignUpEmailScreen;
