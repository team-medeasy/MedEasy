import React, { useEffect } from 'react';
import styled from 'styled-components/native';

const Splash = ({ navigation }) => {
  useEffect(() => {
    // 2초 후에 Login 화면으로 이동
    const timer = setTimeout(() => {
      navigation.navigate('SignUpStart');
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
        <Logo>logo</Logo>
      </LogoContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: black;
`;

const TextContainer = styled.View`
  flex: 1;
`;

const SmallLine = styled.Text`
  color: white;
  font-family: 'KimjungchulGothic-Regular';
  font-size: 15;
  margin-bottom: 10;
  margin-top: 100;
  margin-left: 50;
`;
const BigLine = styled.Text`
  color: white;
  font-family: 'KimjungchulGothic-Bold';
  font-weight: bold;
  font-size: 32;
  margin-left: 50;
`;

const LogoContainer = styled.View`
  flex: 2;
`;

const Logo = styled.Text`
  color: white;
`;

export default Splash;
