import React, {useEffect, useState} from 'react';
import {
  Modal,
  Animated,
  BackHandler,
  TouchableWithoutFeedback,
} from 'react-native';
import styled from 'styled-components/native';
import {themes} from '../styles';

const ANIMATION_DURATION = 300;

const CustomModal = ({visible, onClose, children}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();

      Animated.timing(slideAnim, {
        toValue: 300,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (visible) {
          onClose();
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <AnimatedModalContainer style={{opacity: fadeAnim}}>
          <TouchableWithoutFeedback>
            <AnimatedModalContent
              style={{
                transform: [{translateY: slideAnim}],
              }}>
              <TopBar />
              {children}
            </AnimatedModalContent>
          </TouchableWithoutFeedback>
        </AnimatedModalContainer>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const AnimatedModalContainer = styled(Animated.View)`
  flex: 1;
  background-color: ${themes.light.bgColor.modalBG};
  justify-content: flex-end;
`;

const AnimatedModalContent = styled(Animated.View)`
  width: 100%;
  background-color: ${themes.light.bgColor.bgPrimary};
  border-radius: 32px 32px 0 0;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 20px 32px 20px;
`;

const TopBar = styled.View`
  width: 40px;
  height: 5px;
  background-color: ${themes.light.textColor.Primary20};
  border-radius: 4px;
`;

export default CustomModal;
