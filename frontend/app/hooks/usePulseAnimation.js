import { useRef } from 'react';
import { Animated } from 'react-native';

export default function usePulseAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(null);

  const startPulseAnimation = () => {
    stopPulseAnimation();

    pulseAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 800,
          useNativeDriver: true
        }),
      ])
    );

    pulseAnimation.current.start();
  };

  const stopPulseAnimation = () => {
    if (pulseAnimation.current) {
      pulseAnimation.current.stop();
    }
    scaleAnim.setValue(1);
  };

  return { scaleAnim, startPulseAnimation, stopPulseAnimation };
}