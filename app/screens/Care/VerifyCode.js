import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Header } from '../../components';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { Images } from '../../../assets/icons';

const VerifyCode = ({ route }) => {
  const {fontSizeMode} = useFontSize();
  const [minutes, setMinutes] = useState(3);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(timer);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes, seconds]);

  // 하드코딩된 인증 코드
  const verificationCode = "1234-1234-1234";

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