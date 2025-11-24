import React, { useEffect, useState } from 'react';
import { Modal, BackHandler, TouchableWithoutFeedback } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import { themes } from '../styles';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';

const ANIMATION_DURATION = 300;
const SWIPE_THRESHOLD = 100;

const CustomModal = ({ visible, onClose, children }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(300);
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      translateY.value = withTiming(0, { duration: ANIMATION_DURATION });
    } else {
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
      translateY.value = withTiming(300, { duration: ANIMATION_DURATION }, () => {
        runOnJS(setModalVisible)(false);
      });
    }
  }, [visible, opacity, translateY]);

  // Pan 제스처 설정
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 아래로 스와이프할 때만 모달 이동
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SWIPE_THRESHOLD) {
        // 충분히 아래로 스와이프했으면 모달 닫기
        translateY.value = withTiming(500, { duration: 200 }, () => {
          runOnJS(onClose)();
        });
      } else {
        // 원래 위치로 돌아가기
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  // 백핸들러 설정
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

  // 애니메이션 스타일
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!modalVisible) return null;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Container style={containerAnimatedStyle}>
          <TouchableWithoutFeedback>
            <GestureDetector gesture={panGesture}>
              <Content style={contentAnimatedStyle}>
                <TopBar />
                {children}
              </Content>
            </GestureDetector>
          </TouchableWithoutFeedback>
        </Container>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Reanimated 스타일드 컴포넌트
const Container = styled(Animated.View)`
  flex: 1;
  background-color: ${themes.light.bgColor.modalBG};
  justify-content: flex-end;
`;

const Content = styled(Animated.View)`
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
  margin-bottom: 10px;
`;

export default CustomModal;
