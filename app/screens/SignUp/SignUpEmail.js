import React, { useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import styled from 'styled-components/native';
import { themes, pointColor, fonts } from './../../styles';
import { ProgressBar, Button } from './../../components';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
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
  width: 100%;
  height: 8.5%;
  justify-content: center; 
  align-items: center;    
  background-color: #fff;
  margin-top: 20px;
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

const SignUpEmailScreen = ({ navigation, route }) => {
    const { lastName, firstName } = route.params;
    const [email, setEmail] = useState('');
    const progress = '50%';
  
    const handleNext = () => {
      if (email) {
        console.log('이메일:', email);
        // 다음 페이지로 이동
        navigation.navigate('SignUpPassword', { lastName, firstName, email }); 
      } else {
        alert('이메일을 입력하세요.');
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
                <TxtLabel>{lastName + firstName}</TxtLabel>
            </InputContainer>
        </Container2>
        <BtnContainer>
            <Button title="다음" onPress={handleNext}/>
        </BtnContainer>
      </Container>
    );
};

export default SignUpEmailScreen;
