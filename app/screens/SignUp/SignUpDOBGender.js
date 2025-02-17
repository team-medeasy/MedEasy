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
  margin-top: 20px;
  margin-left: 30px;
`;

const Container2 = styled.View`
  margin-left: 25px;
  margin-right: 25px;
  margin-top: 37px;
`;

const Container3 = styled.View`
  justify-content: center; 
  align-items: center;  
  flex-direction: row;
  margin-left: 25px;
  margin-right: 25px;
  margin-top: 10px;
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
  margin-top: auto;
`;

const GenderContainer = styled.View`
  flex: 1;
  margin-left: ${(props) => props.marginLeft || '0px'};
  margin-right: ${(props) => props.marginRight || '0px'}; 
`;

const TextInput = styled.TextInput`
  height: 60px;
  border-radius: 10px;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 20px;
  font-size: 16px;
`;

const GenderBtn = styled.TouchableOpacity`
  height: 150px;
  background-color: ${(props) => (props.selected ? pointColor.pointPrimary : themes.light.boxColor.inputPrimary)};
  border-radius: 15px;
`;

const GenderText = styled.Text`
  color: ${(props) => (props.selected ? '#fff' : '#000')};
  font-size: 22px;
  font-weight: bold;
  margin: 20px;
`;

const SignUpDOBGenderScreen = ({ navigation, route }) => {
    const { firstName } = route.params;
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const progress = '100%';

    const handleNext = () => {
      if (birthDate && gender) {
        navigation.navigate('HomePage');
      } else {
        alert('생년월일과 성별을 입력하세요.');
      }
    };

    const handleBirthDateChange = (text) => {
      let formattedText = text.replace(/[^0-9]/g, '');
      if (formattedText.length <= 4) {
        formattedText = formattedText.slice(0, 4);
      } else if (formattedText.length <= 6) {
        formattedText = formattedText.slice(0, 4) + '-' + formattedText.slice(4, 6);
      } else if (formattedText.length <= 8) {
        formattedText = formattedText.slice(0, 4) + '-' + formattedText.slice(4, 6) + '-' + formattedText.slice(6, 8);
      }
      if (formattedText.length > 10) {
        formattedText = formattedText.slice(0, 10);
      }
      setBirthDate(formattedText);
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
            {firstName}님, 반가워요!
          </Text>
          <Text style={{ fontFamily: 'Pretendart-Regular', fontSize: 16, marginTop: 7, color: 'grey' }}>
            생년월일과 성별을 입력해주세요.
          </Text>        
        </Container1>

        <Container2>
          <InputContainer marginBottom="5px">
              <TextInput
              placeholder="생년월일 (YYYY-MM-DD)"
              value={birthDate}
              onChangeText={handleBirthDateChange}
              keyboardType="numeric"
              maxLength={10}
              />
          </InputContainer>
        </Container2>

        <Container3>
          <GenderContainer marginRight="10px">
            <GenderBtn selected={gender === 'male'} onPress={() => setGender('male')}>
              <GenderText selected={gender === 'male'}>남자</GenderText>
            </GenderBtn>
          </GenderContainer>
          <GenderContainer marginLeft="10px">
            <GenderBtn selected={gender === 'female'} onPress={() => setGender('female')}>
              <GenderText selected={gender === 'female'}>여자</GenderText>
            </GenderBtn>
          </GenderContainer>
        </Container3>

        <BtnContainer>
          <Button title="메디지 시작하기" onPress={handleNext}/>
        </BtnContainer>
      </Container>
    );
};

export default SignUpDOBGenderScreen;
