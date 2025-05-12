import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../styles';
import {LogoIcons} from '../../assets/icons';
import FontSizes from '../../assets/fonts/fontSizes';
import {useFontSize} from '../../assets/fonts/FontSizeContext';

const {logo: LogoIcon, logoKr: LogoKrIcon} = LogoIcons;

const Footer = ({marginTop = 0}) => {
  const {fontSizeMode} = useFontSize();
  
  return (
    <FooterContainer marginTop={marginTop}>
      <FooterText
        fontSizeMode={fontSizeMode}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: themes.light.borderColor.borderPrimary,
        }}>
        모든 의약품 정보는 참고용으로 제공되며, 정확한 복용법은 의사 및 약사와
        상담하시기 바랍니다.{'\n'}위 정보는 식품의약품안전처 오픈API(의약품
        낱알식별 정보, 의약품개요정보)에서 제공하는 정보입니다.
      </FooterText>

      <FooterTextContainer>
        <StyledText fontSizeMode={fontSizeMode}>관련 문의: https://github.com/team-medeasy</StyledText>
        <StyledText fontSizeMode={fontSizeMode}>© 2025 Team MedEasy.</StyledText>
      </FooterTextContainer>

      <FooterLogoContainer>
        <LogoIcon
          width={13}
          height={21}
          style={{marginRight: 13, color: themes.light.textColor.Primary30}}
        />
        <LogoKrIcon
          width={52.16}
          height={18.13}
          style={{color: themes.light.textColor.Primary30}}
        />
      </FooterLogoContainer>
    </FooterContainer>
  );
};

const FooterContainer = styled.View`
  padding: 10px 20px 130px 20px;
  background-color: ${themes.light.bgColor.footerBG};
  margin-top: ${({marginTop}) => `${marginTop}px`};
`;

const FooterText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.captionSm[fontSizeMode]}px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary30};
  padding: 20px 0;
  line-height: 21px;
`;

const FooterTextContainer = styled.View`
  padding: 20px 0;
`;

const StyledText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.captionSm[fontSizeMode]}px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary30};
  line-height: 21px;
`;

const FooterLogoContainer = styled.View`
  flex-direction: row;
  align-items: center;
  height: 21px;
  width: 78px;
  margin-top: 10px;
`;

export {Footer};
