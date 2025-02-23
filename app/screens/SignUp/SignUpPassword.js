import React, { useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import styled from 'styled-components/native';
import { themes, fonts } from './../../styles';
import { ProgressBar, BackAndNextButtons } from './../../components';

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
  margin-top: ${(props) => props.marginTop || '0px'};
  margin-bottom: ${(props) => props.marginBottom || '0px'}; 
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

const SignUpPasswordScreen = ({ navigation, route }) => {
    const { lastName, firstName, email } = route.params;
    const [password, setPassword] = useState('');
    const progress = '75%';
  
    const handleNext = () => {
      if (password) {
        console.log('비밀번호:', password);
        // 다음 페이지로 이동
        navigation.navigate('SignUpDOBGender', { firstName }); 
      } else {
        alert('비밀번호를 입력하세요.');
      }
    };

    return (
      <Container>
          <ProgressBar progress={progress}/>
        <Container1>
          <Text style={{ fontFamily: fonts.title.fontFamily, fontSize: fonts.title.fontSize }}>
            {firstName}님, 반가워요!
          </Text>
          <Text style={{ fontFamily: 'Pretendart-Regular', fontSize: 16, marginTop: 7, color: 'grey' }}>
            비밀번호를 입력해주세요.
          </Text>
        </Container1>
        <Container2>
            <InputContainer marginBottom="5px">
                <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                />
            </InputContainer>
            <InputContainer marginTop="5px" marginBottom="5px">
                <TxtLabel>{email}</TxtLabel>
            </InputContainer>
            <InputContainer marginTop="5px">
                <TxtLabel>{lastName + firstName}</TxtLabel>
            </InputContainer>
        </Container2>
        <BtnContainer>
          <BackAndNextButtons onPressPrev={() => navigation.goBack()} onPressNext={handleNext}/>
        </BtnContainer>
      </Container>
    );
};

export default SignUpPasswordScreen;