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
  const [dateError, setDateError] = useState('');
  const progress = '100%';

  const isLeapYear = (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const getDaysInMonth = (year, month) => {
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (month === 2 && isLeapYear(year)) {
          return 29;
      }
      return daysInMonth[month - 1];
  };

  const validatePartialDate = (text) => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      
      // 초기 입력 시작 시 에러 메시지 초기화
      if (text.length < 4) {
          setDateError('');
          return true;
      }

      // 연도 검증 (4자리 이상인 경우)
      const year = parseInt(text.slice(0, 4));
      if (year < 1900 || year > currentYear) {
          setDateError('유효한 날짜를 입력해주세요');
          return false;
      }

      // 월 부분 입력 시작 시 에러 메시지 초기화
      if (text.length < 6) {
          setDateError('');
          return true;
      }

      // 월 검증 (6자리 이상인 경우)
      const month = parseInt(text.slice(4, 6));
      if (month < 1 || month > 12) {
        setDateError('유효한 날짜를 입력해주세요');
        return false;
      }

      // 현재 연도인 경우 현재 월까지만 허용
      if (year === currentYear && month > currentMonth) {
        setDateError('유효한 날짜를 입력해주세요');
        return false;
      }

      // 일 부분 입력 시작 시 에러 메시지 초기화
      if (text.length < 8) {
          setDateError('');
          return true;
      }

      // 일 검증 (8자리인 경우)
      if (text.length === 8) {
          const day = parseInt(text.slice(6, 8));
          const maxDays = getDaysInMonth(year, month);

          if (day < 1 || day > maxDays) {
            setDateError('유효한 날짜를 입력해주세요');
            return false;
          }

          // 미래 날짜 검증
          if (year === currentYear && month === currentMonth && day > currentDay) {
            setDateError('유효한 날짜를 입력해주세요');
            return false;
          }
      }

      // 모든 검증을 통과한 경우
      setDateError('');
      return true;
  };

  const handleBirthDateChange = (text) => {
      let formattedText = text.replace(/[^0-9]/g, '');
      
      // 이전 값의 숫자만 추출
      const prevNumbers = birthDate.replace(/[^0-9]/g, '');
      
      // 길이가 증가하는 경우에만 유효성 검사 실행
      // 이전 단계에서 에러가 있는 상태에서 새로운 숫자 입력을 막음
      if (formattedText.length > prevNumbers.length && !validatePartialDate(formattedText)) {
          formattedText = prevNumbers;
      }
      
      // 형식 지정 (하이픈 추가)
      if (formattedText.length <= 4) {
          formattedText = formattedText.slice(0, 4);
      } else if (formattedText.length <= 6) {
          formattedText = formattedText.slice(0, 4) + '-' + formattedText.slice(4, 6);
      } else if (formattedText.length <= 8) {
          formattedText = formattedText.slice(0, 4) + '-' + formattedText.slice(4, 6) + '-' + formattedText.slice(6, 8);
      }
      
      // 최대 길이 제한
      if (formattedText.length > 10) {
          formattedText = formattedText.slice(0, 10);
      }
      
      setBirthDate(formattedText);
  };

    const handleNext = () => {
        if (!birthDate || !gender) {
            alert('생년월일과 성별을 입력하세요.');
            return;
        }

        if (dateError) {
            alert('올바른 생년월일을 입력하세요.');
            return;
        }

        // 날짜가 완전히 입력되었는지 확인
        const numbers = birthDate.replace(/[^0-9]/g, '');
        if (numbers.length !== 8) {
            alert('생년월일을 완전히 입력하세요.');
            return;
        }

        navigation.navigate('HomePage');
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
                  {dateError ? (
                      <Text style={{ color: 'red', marginTop: 5, fontSize: 12 }}>
                          {dateError}
                      </Text>
                  ) : null}
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