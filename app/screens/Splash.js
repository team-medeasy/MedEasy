import React, { useEffect } from 'react';
import styled from 'styled-components/native';
import Logo from './../../assets/icons/logo/logo.svg';
import Logo_kr from './../../assets/icons/logo/logo_kr.svg';
import {pointColor} from './../styles';

const Splash = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigation) {
        navigation.navigate('SignUpStart');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Container>
      <TextContainer>
        <SmallLine>복잡한 약 정보를 간단하게</SmallLine>
        <BigLine>내 손 안의</BigLine>
        <BigLine>의학 도우미</BigLine>
      </TextContainer>
      <LogoContainer>
        <Logo width={500} height={500} style={{ 
          opacity: 0.5, 
          transform: [{ rotate: '10deg' }]
        }} />
        <Logo_kr width={82} />
      </LogoContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color:${pointColor.pointPrimary};
`;

const TextContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

const SmallLine = styled.Text`
  color: white;
  font-family: 'KimjungchulGothic-Regular';
  font-size: ${15}px;
  margin-bottom: 10px;
  margin-top: 100px;
  margin-left: 50px;
`;

const BigLine = styled.Text`
  color: white;
  font-family: 'KimjungchulGothic-Bold';
  font-weight: bold;
  font-size: ${32}px;
  margin-left: 50px;
`;

const LogoContainer = styled.View`
  flex: 2;
  justify-content: center;
  align-items: flex-end;
  transform: translateX(-100px);
  overflow: hidden;
`;

export default Splash;
