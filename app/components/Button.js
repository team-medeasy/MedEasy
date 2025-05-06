import React from 'react';
import styled from 'styled-components/native';
import {Text, TouchableOpacity, View} from 'react-native';
import {themes} from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import {useFontSize} from '../../assets/fonts/FontSizeContext';

// 기본 버튼
const Button = ({
  title,
  onPress,
  bgColor,
  textColor,
  fontSize,
  fontFamily,
  width,
  height,
  flex,
  disabled,
  icon
}) => {
  const {fontSizeMode} = useFontSize();
  
  return (
    <ButtonContainer
      onPress={disabled ? null : onPress}
      bgColor={bgColor}
      width={width}
      height={height}
      flex={flex}
      disabled={disabled}>
        <ButtonText 
          color={textColor} 
          fontSize={fontSize} 
          fontFamily={fontFamily}
          fontSizeMode={fontSizeMode}>
          {title}
        </ButtonText>
    </ButtonContainer>
  );
};

// 양 옆에 두 메시지를 띄우는 버튼
const DualTextButton = ({
  title,
  messageText,
  onPress,
  bgColor,
  textColor,
  fontSize,
  fontFamily,
  width,
  height,
  flex,
}) => {
  const {fontSizeMode} = useFontSize();
  
  return (
    <DualTextButtonContainer
      onPress={onPress}
      bgColor={bgColor}
      width={width}
      height={height}
      flex={flex}>
      <DualTextButtonText 
        color={textColor} 
        fontSize={fontSize} 
        fontFamily={fontFamily}
        fontSizeMode={fontSizeMode}>
        {title}
      </DualTextButtonText>
      <DualTextButtonText 
        color={textColor} 
        fontSize={fontSize} 
        fontFamily={fontFamily}
        fontSizeMode={fontSizeMode}>
        {messageText}
      </DualTextButtonText>
    </DualTextButtonContainer>
  );
};

// 회원가입 시 이전 ・ 다음 버튼
const ButtonsContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

const BackAndNextButtons = ({onPressPrev, onPressNext, nextTitle = '다음'}) => {
  return (
    <ButtonsContainer>
      <Button
        title="이전"
        onPress={onPressPrev}
        flex={1}
        bgColor={themes.light.boxColor.inputSecondary}
        textColor={themes.light.textColor.Primary50}
      />
      <Button title={nextTitle} onPress={onPressNext} flex={2} />
    </ButtonsContainer>
  );
};

// 아이콘 + 텍스트 버튼
const IconTextButton = ({
  onPress,
  icon,
  title,
  bgColor,
  textColor,
  fontSize,
  fontFamily,
  width,
  height,
  gap,
  disabled
}) => {
  const {fontSizeMode} = useFontSize();
  
  return (
    <IconTextButtonContainer
      onPress={disabled ? null : onPress}
      bgColor={bgColor}
      width={width}
      height={height}
      gap={gap}
      disabled={disabled}
    >
      {icon}
      <IconTextButtonText
        color={textColor}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontSizeMode={fontSizeMode}
      >
        {title}
      </IconTextButtonText>
    </IconTextButtonContainer>
  );
};

const ButtonContainer = styled(TouchableOpacity)`
  flex: ${({flex}) => flex ?? '0 1 auto'};
  width: ${({width}) => width || '100%'};
  height: ${({height}) => height ?? '60px'};
  background-color: ${props =>
    props.bgColor || themes.light.boxColor.buttonPrimary};
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const ButtonText = styled(Text)`
  color: ${props => props.color || themes.light.textColor.buttonText};
  font-size: ${props => props.fontSize || 
    props.fontSizeMode ? `${FontSizes.heading[props.fontSizeMode]}px` : FontSizes.heading.default};
  font-family: ${props => props.fontFamily || 'KimjungchulGothic-Bold'};
`;

const DualTextButtonContainer = styled(TouchableOpacity)`
  flex: ${({ flex }) => flex ?? '0 1 auto'};
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height ?? '55px'};
  background-color: ${props =>
    props.bgColor || themes.light.boxColor.buttonPrimary};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding: 0 20px;
  border-radius: 10px;
`;

const DualTextButtonText = styled(Text)`
  font-size: ${props => props.fontSize || 
    props.fontSizeMode ? `${FontSizes.body[props.fontSizeMode]}px` : FontSizes.body.default};
  font-family: ${props => props.fontFamily || 'Pretendard-SemiBold'};
  color: ${props => props.color || themes.light.textColor.buttonText};
`;

const IconTextButtonContainer = styled(TouchableOpacity)`
  padding: 16px 0;
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || 'auto'};
  background-color: ${({ bgColor }) =>
    bgColor || themes.light.boxColor.buttonPrimary};
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  flex-direction: row;
  gap: ${({ gap }) => gap || '20px'};
`;

const IconTextButtonText = styled(Text)`
  color: ${({ color }) => color || themes.light.textColor.buttonText};
  font-size: ${props => props.fontSize || 
    props.fontSizeMode ? `${FontSizes.body[props.fontSizeMode]}px` : FontSizes.body.default};
  font-family: ${({ fontFamily }) => fontFamily || 'Pretendard-SemiBold'};
`;

export {Button, BackAndNextButtons, DualTextButton, IconTextButton};