import React, { useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import styled from 'styled-components/native';
import { themes, pointColor, fonts } from './../../styles';
import { ProgressBar, Button } from './../../components';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const BackButtonContainer = styled.View`
  width: 100%;
  align-items: flex-start;
  padding: 20px 25px 10px;
`;

const BackButton = styled.TouchableOpacity`
  padding: 10px;
`;

const Container1 = styled.View`
  justify-content: center; 
  margin-top: 78px;
  margin-left: 30px;
`;

const Container2 = styled.View`
  justify-content: center; 
  align-items: center;  
  flex-direction: row;
  margin-left: 25px;
  margin-right: 25px;
  margin-top: 37px;
`;

const InputContainer = styled.View`
  flex: 1;
  margin-left: ${(props) => props.marginLeft || '0px'};
  margin-right: ${(props) => props.marginRight || '0px'}; 
`;

const BtnContainer = styled.View`
  width: 100%;
  height: 8.5%;
  justify-content: center; 
  align-items: center;    
  margin-top: auto;
`;

const TextInput = styled.TextInput`
  height: 60px;
  border-radius: 8px;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 20px;
  font-size: 16px;
`;

const SignUpNameScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const progress = '25%';

  const handleNext = () => {
    if (firstName && lastName) {
      console.log('이름:', firstName, '성:', lastName);
      // 다음 페이지로 이동
      navigation.navigate('SignUpEmail', { lastName, firstName });
    } else {
      alert('성을 포함한 이름을 모두 입력하세요.');
    }
  };

  return (
    <Container>
      <ProgressBar progress={progress} />

      <BackButtonContainer>
        <BackButton onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 18, color: 'black' }}>←</Text>
        </BackButton>
      </BackButtonContainer>
      <Container1>
        <Text style={{ fontFamily: fonts.title.fontFamily, fontSize: fonts.title.fontSize }}>
          안녕하세요, 메디지입니다 👋
        </Text>
        <Text style={{ fontFamily: 'Pretendart-Regular', fontSize: 16, marginTop: 7, color: 'grey' }}>
          이름을 입력해주세요.
        </Text>
      </Container1>
      <Container2>
        <InputContainer marginRight="5px">
          <TextInput
            placeholder="성"
            value={lastName}
            onChangeText={setLastName}
          />
        </InputContainer>
        <InputContainer marginLeft="5px">
          <TextInput
            placeholder="이름"
            value={firstName}
            onChangeText={setFirstName}
          />
        </InputContainer>
      </Container2>
      <BtnContainer>
        <Button title="다음" onPress={handleNext} />
      </BtnContainer>
    </Container>
  );
}
export default SignUpNameScreen;