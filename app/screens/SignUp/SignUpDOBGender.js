import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import styled from 'styled-components/native';
import {themes, pointColor, fonts} from './../../styles';
import {ProgressBar, BackAndNextButtons} from './../../components';
import {LogoIcons} from './../../../assets/icons';
import {useSignUp} from '../../api/context/SignUpContext';
import {handleSignUp} from '../../api/services/authService';
import FontSizes from '../../../assets/fonts/fontSizes';

const {logo: LogoIcon} = LogoIcons;

const SignUpDOBGenderScreen = ({navigation}) => {
  const {signUpData, updateSignUpData} = useSignUp();
  const [birthday, setBirthday] = useState(signUpData.birthday || '');
  const [gender, setGender] = useState(signUpData.gender || '');
  const [dateError, setDateError] = useState('');
  const progress = '100%';

  const isLeapYear = year => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const getDaysInMonth = (year, month) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && isLeapYear(year)) {
      return 29;
    }
    return daysInMonth[month - 1];
  };

  const validatePartialDate = text => {
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

  const handleBirthDateChange = text => {
    // 현재 입력된 모든 문자(하이픈 포함)의 길이가 이전보다 짧으면 삭제 중
    const isDeleting = text.length < birthday.length;

    // 숫자만 추출
    let numbers = text.replace(/[^0-9]/g, '');

    // 삭제 중이 아닐 때만 유효성 검사
    if (!isDeleting && !validatePartialDate(numbers)) {
      return;
    }

    let formattedText = '';

    // 삭제 중일 때는 이전 값에서 마지막 숫자 하나만 제거
    if (isDeleting) {
      const prevNumbers = birthday.replace(/[^0-9]/g, '');
      numbers = prevNumbers.slice(0, -1);
    }

    // 숫자 개수에 따른 포맷팅
    if (numbers.length <= 4) {
      formattedText = numbers;
      if (numbers.length === 4 && !isDeleting) {
        formattedText += '-';
      }
    } else if (numbers.length <= 6) {
      formattedText = `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
      if (numbers.length === 6 && !isDeleting) {
        formattedText += '-';
      }
    } else {
      formattedText = `${numbers.slice(0, 4)}-${numbers.slice(
        4,
        6,
      )}-${numbers.slice(6)}`;
    }

    setBirthday(formattedText);
  };

  const handleNext = async () => {
    if (!birthday || !gender) {
      alert('생년월일과 성별을 입력하세요.');
      return;
    }

    if (dateError) {
      alert('올바른 생년월일을 입력하세요.');
      return;
    }

    // 날짜가 완전히 입력되었는지 확인
    const numbers = birthday.replace(/[^0-9]/g, '');
    if (numbers.length !== 8) {
      alert('생년월일을 완전히 입력하세요.');
      return;
    }

    try {
      updateSignUpData({birthday: birthday, gender});

      await handleSignUp(signUpData, navigation); // API 호출
      console.log('회원가입 성공!');
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입 실패');
    }
  };

  return (
    <Container>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flex: 1}}>
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
              생년월일과 성별을 입력해주세요.
            </Text>
          </Container1>

          <Container2>
            <InputContainer marginBottom="5px">
              <TextInput
                placeholder="생년월일 (YYYY-MM-DD)"
                placeholderTextColor={themes.light.textColor.placeholder}
                value={birthday}
                onChangeText={handleBirthDateChange}
                keyboardType="numeric"
                maxLength={10}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                autoCorrect={false}
                blurOnSubmit={true}
              />
              {dateError ? (
                <Text
                  style={{
                    fontFamily: 'Pretendard-Medium',
                    color: 'red',
                    marginTop: 5,
                    fontSize: 12,
                  }}>
                  {dateError}
                </Text>
              ) : null}
            </InputContainer>
          </Container2>

          <Container3>
            <GenderOption
              type="male"
              selected={gender === 'male'}
              onSelect={setGender}
            />
            <GenderOption
              type="female"
              selected={gender === 'female'}
              onSelect={setGender}
            />
          </Container3>

          <BtnContainer>
            <BackAndNextButtons
              nextTitle="메디지 시작하기"
              onPressPrev={() => navigation.goBack()}
              onPressNext={handleNext}
            />
          </BtnContainer>
        </View>
      </TouchableWithoutFeedback>
    </Container>
  );
};

const GenderOption = ({type, selected, onSelect}) => (
  <GenderBtn selected={selected} onPress={() => onSelect(type)}>
    <GenderText selected={selected}>
      {type === 'male' ? '남자' : '여자'}
    </GenderText>
    <LogoIcon
      height={87}
      width={59}
      style={{
        color: selected
          ? themes.light.textColor.buttonText10
          : themes.light.textColor.Primary6,
        transform: [{rotate: '10deg'}],
        position: 'absolute',
        bottom: -5,
        right: 25,
      }}
    />
  </GenderBtn>
);

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

const Container3 = styled.View`
  justify-content: center;
  align-items: center;
  flex-direction: row;
  margin-left: 25px;
  margin-right: 25px;
  margin-top: 10px;
  gap: 15px;
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

const GenderBtn = styled.TouchableOpacity`
  flex: 1 0 0;
  height: 150px;
  background-color: ${props =>
    props.selected
      ? pointColor.pointPrimary
      : themes.light.boxColor.inputPrimary};
  border-radius: 15px;
  padding: 20px;
  overflow: hidden;
`;

const GenderText = styled.Text`
  color: ${props =>
    props.selected
      ? themes.light.textColor.buttonText
      : themes.light.textColor.textPrimary};
  font-size: ${FontSizes.title.default};
  font-weight: bold;
`;

export default SignUpDOBGenderScreen;
