import React from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { OtherIcons } from '../../../assets/icons';

const VoiceInputUI = ({
  status,
  statusMessage,
  scaleAnim,
  fontSizeMode,
  onSwitchToTextMode
}) => {
  // 상태에 따른 원형 색상 결정
  const getCircleColor = () => {
    switch (status) {
      case 'listening': return themes.light.textColor.buttonText;
      case 'processing': return themes.light.textColor.Primary50;
      case 'playing': return themes.light.pointColor.Secondary;
      case 'error': return themes.light.pointColor.Secondary;
      default: return themes.light.boxColor.buttonPrimary;
    }
  };

  return (
    <VoiceInputContainer>
      <VoiceCenterContainer>
        <StatusText fontSizeMode={fontSizeMode}>{statusMessage}</StatusText>
        <AnimatedCircleContainer>
          <AnimatedCircle
            style={{ transform: [{ scale: scaleAnim }] }}
            color={getCircleColor()}
          />
          <TextModeButton onPress={onSwitchToTextMode}>
            <OtherIcons.delete
              height={20}
              width={20}
              style={{ color: themes.light.textColor.buttonText }}
            />
          </TextModeButton>
        </AnimatedCircleContainer>
      </VoiceCenterContainer>
    </VoiceInputContainer>
  );
};

const VoiceInputContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  z-index: 10;
`;

const VoiceCenterContainer = styled.View`
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const AnimatedCircleContainer = styled.View`
  position: relative;
  align-items: center;
  justify-content: center;
`;

const AnimatedCircle = styled(Animated.View)`
  width: 100px;
  height: 100px;
  background-color: ${props => props.color};
  border-radius: 50px;

  /* iOS 그림자 */
  shadow-color: ${props => props.color};
  shadow-offset: 0px 0px;
  shadow-opacity: 0.8;
  shadow-radius: 10px;

  /* Android 그림자 (elevation) */
  elevation: 10;
`;

const StatusText = styled.Text`
  margin-bottom: 17px;
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.buttonText};
  font-weight: bold;
  text-align: center;
`;

const TextModeButton = styled(TouchableOpacity)`
  position: absolute;
  right: -100px;
  align-items: center;
  justify-content: center;
`;

export default VoiceInputUI;