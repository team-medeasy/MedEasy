import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import SoundLevel from 'react-native-sound-level';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import {Header} from '../../components';

export default function VoiceCircle() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    SoundLevel.start();
    SoundLevel.onNewFrame = data => {
      const volume = Math.max(-160, data.value);
      const normalized = 1 + (Math.abs(volume) / 160) * 4;

      Animated.spring(scaleAnim, {
        toValue: normalized,
        useNativeDriver: true,
        speed: 20,
        bounciness: 10,
      }).start();
    };

    return () => {
      SoundLevel.stop();
    };
  }, []);

  return (
    <Container>
      <Header>보이스 채팅</Header>
      <CircleContainer>
        <AnimatedCircle style={{transform: [{scale: scaleAnim}]}} />
      </CircleContainer>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const CircleContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const AnimatedCircle = styled(Animated.View)`
  width: 100px;
  height: 100px;
  background-color: ${themes.light.pointColor.Primary};
  border-radius: 50px;
`;
