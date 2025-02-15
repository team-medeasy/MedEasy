import React from 'react';
import styled from 'styled-components/native';
import { Text, TouchableOpacity } from 'react-native';
import { themes } from '../styles';

const ButtonContainer = styled(TouchableOpacity)`
  width: 90%;
  height: 53px;
  background-color: ${(props) => props.bgColor || themes.light.boxColor.buttonPrimary};
  margin-bottom: 15px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const ButtonText = styled(Text)`
  color: ${(props) => props.color || '#fff'};
  font-size: 14px;
  font-family: 'Pretendard-SemiBold';
`;

const Button = ({ title, onPress, bgColor, textColor }) => {
  return (
    <ButtonContainer onPress={onPress} bgColor={bgColor}>
      <ButtonText color={textColor}>{title}</ButtonText>
    </ButtonContainer>
  );
};

export default Button;