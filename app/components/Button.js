import React from 'react';
import styled from 'styled-components/native';
import { Text, TouchableOpacity } from 'react-native';
import { themes } from '../styles';

const ButtonContainer = styled(TouchableOpacity)`
  width: 90%;
  height: 60px;
  background-color: ${(props) => props.bgColor || themes.light.boxColor.buttonPrimary};
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const ButtonText = styled(Text)`
  color: ${(props) => props.color || '#fff'};
  font-size: 18px;
  font-family: 'KimjungchulGothic-Bold';
`;

const Button = ({ title, onPress, bgColor, textColor }) => {
  return (
    <ButtonContainer onPress={onPress} bgColor={bgColor}>
      <ButtonText color={textColor}>{title}</ButtonText>
    </ButtonContainer>
  );
};

export default Button;