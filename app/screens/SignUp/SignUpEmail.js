import React, {useState} from 'react';
import {SafeAreaView, Text} from 'react-native';
import styled from 'styled-components/native';
import {themes, fonts} from './../../styles';
import {ProgressBar, BackAndNextButtons} from './../../components';
import {useSignUp} from '../../api/context/SignUpContext';

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

const TxtLabel = styled.Text`
  height: 60px;
  border-radius: 10px;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 20px;
  font-size: 16px;
`;

const SignUpEmailScreen = ({navigation, route}) => {
  const {signUpData, updateSignUpData} = useSignUp();
  const [email, setEmail] = useState(signUpData.email || '');
  const progress = '50%';

  const handleNext = () => {
    if (email) {
      updateSignUpData({email});
      // 다음 페이지로 이동
      navigation.navigate('SignUpPassword');
    } else {
      alert('이메일을 입력하세요.');
    }
  };

  return (
    <Container>
      <ProgressBar progress={progress} />
      <Container1>
        <Text
          style={{
            fontFamily: fonts.title.fontFamily,
            fontSize: fonts.title.fontSize,
          }}>
          {signUpData.firstName}님, 반가워요!
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
            placeholder="예: abcd@efg.com"
            value={email}
            onChangeText={setEmail}
          />
        </InputContainer>
        <InputContainer marginTop="5px">
          <TxtLabel>{signUpData.lastName + signUpData.firstName}</TxtLabel>
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

export default SignUpEmailScreen;
