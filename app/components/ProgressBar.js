import React, { useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { pointColor, themes } from '../styles';
import { Animated } from 'react-native';

const ProgressBarContainer = styled.View`
  width: 100%;
  height: 5px;
  background-color: ${themes.light.borderColor.borderPrimary};
`;

const AnimatedProgress = styled(Animated.View)`
  height: 100%;
  background-color: ${pointColor.pointPrimary};
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
`;

const ProgressBar = ({ progress }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: parseFloat(progress),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolated = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <ProgressBarContainer>
      <AnimatedProgress style={{ width: widthInterpolated }} />
    </ProgressBarContainer>
  );
};

export default ProgressBar;
