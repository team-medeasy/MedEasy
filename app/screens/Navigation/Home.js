import React from 'react';
import styled from 'styled-components/native';

const Home = () => {
    return (
        <MainContainer>
            <LogoContainer>
                <Logo>
                    메디지로고
                </Logo>
            </LogoContainer>
            <Container>
                <Title>홈</Title>
            </Container>
        </MainContainer>
    );
};

const MainContainer = styled.View`
  flex: 1;
  background-color: white;
`;

const LogoContainer = styled.View`
    flex: 1;
    justify-content: center;
    background-color: aqua;
`;

const Logo = styled.Text`

`;

const Container = styled.View`
    flex: 5;
    justify-content: center;
    align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: black;
`;

export default Home;


