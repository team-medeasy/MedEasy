import React from 'react';
import styled from 'styled-components/native';
import {Text, TouchableOpacity, View} from 'react-native';
import {themes} from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';

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
  font-size: ${props => props.fontSize || FontSizes.heading.default};
  font-family: ${props => props.fontFamily || 'KimjungchulGothic-Bold'};
`;

const ButtonInner = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const IconWrapper = styled.View`
  justify-content: center;
  align-items: center;
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
  disabled,
  icon
}) => {
  return (
    <ButtonContainer
      onPress={disabled ? null : onPress}
      bgColor={bgColor}
      width={width}
      height={height}
      flex={flex}
      disabled={disabled}>
      <ButtonInner>
        {icon && <IconWrapper>{icon}</IconWrapper>} {/* ✅ 아이콘 렌더링 */}
        <ButtonText color={textColor} fontSize={fontSize} fontFamily={fontFamily}>
          {title}
        </ButtonText>
      </ButtonInner>
    </ButtonContainer>
  );
};

// 양 옆에 두 메시지를 띄우는 버튼
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
  font-size: ${props => props.fontSize || FontSizes.body.default};
  font-family: ${props => props.fontFamily || 'Pretendard-SemiBold'};
  color: ${props => props.color || themes.light.textColor.buttonText};
`;

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
  return (
    <DualTextButtonContainer
      onPress={onPress}
      bgColor={bgColor}
      width={width}
      height={height}
      flex={flex}>
      <DualTextButtonText color={textColor} fontSize={fontSize} fontFamily={fontFamily}>
        {title}
      </DualTextButtonText>
      <DualTextButtonText color={textColor} fontSize={fontSize} fontFamily={fontFamily}>
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

export {Button, BackAndNextButtons, DualTextButton};
