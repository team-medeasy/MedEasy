import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Header } from '../../components';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { Images } from '../../../assets/icons';
import { createCareAuthCode } from '../../api/userCare';

const VerifyCode = ({ route }) => {
  const {fontSizeMode} = useFontSize();
  const [minutes, setMinutes] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');

  const fetchAuthCode = async () => {
    try {
      const response = await createCareAuthCode();
      console.log("auth-code: ", response.data);
      setVerificationCode(response.data.auth_code);
    } catch (err) {
      console.error('인증 코드 발급 실패:', err);
    }
  };

  // 최초 코드 발급
  useEffect(() => {
    fetchAuthCode();
  }, []);

  useEffect(() => {
  let timer = setInterval(() => {
    setSeconds((prevSec) => {
      if (prevSec > 0) return prevSec - 1;
      if (minutes > 0) {
        setMinutes((prevMin) => prevMin - 1);
        return 59;
      } else {
        clearInterval(timer);
        fetchAuthCode();      // 새 인증 코드 요청
        setMinutes(3);        // 타이머 초기화
        setSeconds(0);
        return 0;
      }
    });
  }, 1000);

  return () => clearInterval(timer);
}, [minutes, seconds]);


  return (
    <Container>
      <Header>인증 코드 확인</Header>
      <ContentContainer>
        <TextContainer>
            <SubText fontSizeMode={fontSizeMode}>인증번호</SubText>
            <CodeText fontSizeMode={fontSizeMode}>{verificationCode}</CodeText>
            <SubText fontSizeMode={fontSizeMode}>
            {minutes}분 {seconds < 10 ? `0${seconds}` : seconds}초 남음
            </SubText>
        </TextContainer>

        <Images.signIn />
      </ContentContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const TextContainer = styled.View`
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 59px;
`;

const CodeText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.display[fontSizeMode]};
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
`;

const SubText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.Primary50};
  font-family: 'Pretendard-Medium';
`;

export default VerifyCode;