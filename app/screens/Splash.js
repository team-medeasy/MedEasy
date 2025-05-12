import React, { useEffect } from 'react';
import styled from 'styled-components/native';
import Logo from './../../assets/icons/logo/logo.svg';
import Logo_kr from './../../assets/icons/logo/logo_kr.svg';
import { pointColor, themes } from './../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import LinearGradient from 'react-native-linear-gradient';

const Splash = () => {
  return (
    <Container
    colors={[pointColor.pointPrimaryDark, pointColor.gradient]} // 밝은색 → 진한색
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    >
      <TextContainer>
        <SmallLine>복잡한 약 정보를 간단하게</SmallLine>
        <BigLine>내 손 안의</BigLine>
        <BigLine>의학 도우미</BigLine>
      </TextContainer>
      <LogoContainer>
        <MainLogoWrapper>
          <Logo 
            width={500} 
            height={500} 
            style={{
              opacity: 0.5,
              transform: [{ rotate: '8deg' }],
              color: pointColor.primary20
            }} 
          />
        </MainLogoWrapper>
        <SubLogoWrapper>
          <Logo_kr width={82} style={{ color: themes.light.textColor.buttonText}}/>
        </SubLogoWrapper>
      </LogoContainer>
    </Container>
  );
};

const Container = styled(LinearGradient)`
  flex: 1;
  background-color: ${pointColor.pointPrimaryDark};
`;

const TextContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

const SmallLine = styled.Text`
  color: white;
  font-family: 'KimjungchulGothic-Regular';
  font-size: ${FontSizes.body.default};
  margin-bottom: 10px;
  margin-top: 100px;
  margin-left: 50px;
`;

const BigLine = styled.Text`
  color: ${themes.light.textColor.buttonText};
  font-family: 'KimjungchulGothic-Bold';
  font-weight: bold;
  font-size: ${FontSizes.display.default};
  margin-left: 50px;
`;

const LogoContainer = styled.View`
  flex: 2;
  position: relative;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const MainLogoWrapper = styled.View`
  position: absolute;
  right: -100px;
  top: 80px;
`;

const SubLogoWrapper = styled.View`
  position: absolute;
  bottom: 50px;
  //z-index: 1;
`;

export default Splash;