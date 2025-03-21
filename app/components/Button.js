import React from 'react';
import styled from 'styled-components/native';
import {Text, TouchableOpacity, View} from 'react-native';
import {themes} from '../styles';

// 기본 버튼
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
  font-size: ${props => props.fontSize || '18px'};
  font-family: ${props => props.fontFamily || 'KimjungchulGothic-Bold'};
`;

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
}) => {
  return (
    <ButtonContainer
      onPress={onPress}
      bgColor={bgColor}
      width={width}
      height={height}
      flex={flex}>
      <ButtonText color={textColor} fontSize={fontSize} fontFamily={fontFamily}>
        {title}
      </ButtonText>
    </ButtonContainer>
  );
};

// 시간 선택 버튼
const SelectTimeButtonContainer = styled(TouchableOpacity)`
  flex: ${({ flex }) => flex ?? '0 1 auto'};
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height ?? '60px'};
  background-color: ${props =>
    props.bgColor || themes.light.boxColor.buttonPrimary};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding: 0 20px;
  border-radius: 10px;
`;

const SelectTimeButtonText = styled(Text)`
  font-size: ${props => props.fontSize || '18px'};
  font-family: ${props => props.fontFamily || 'KimjungchulGothic-Bold'};
  color: ${props => props.color || themes.light.textColor.buttonText};
`;

const SelectTimeButton = ({
  title,
  timeText,
  onPress,
  bgColor,
  textColor,
  fontSize,
  fontFamily,
  width,
  height,
  flex,
}) => {
  return (
    <SelectTimeButtonContainer
      onPress={onPress}
      bgColor={bgColor}
      width={width}
      height={height}
      flex={flex}>
      <SelectTimeButtonText color={textColor} fontSize={fontSize} fontFamily={fontFamily}>
        {title}
      </SelectTimeButtonText>
      <SelectTimeButtonText color={textColor} fontSize={fontSize} fontFamily={fontFamily}>
        {timeText}
      </SelectTimeButtonText>
    </SelectTimeButtonContainer>
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

export {Button, BackAndNextButtons, SelectTimeButton};
