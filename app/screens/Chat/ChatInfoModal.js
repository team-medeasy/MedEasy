import React, { useState, useEffect } from 'react';
import { Modal, Animated } from 'react-native';
import styled from 'styled-components/native';
import { Button } from './../../components';
import { themes } from '../../styles';
import { LogoIcons } from '../../../assets/icons';

const ChatInfoModal = ({ visible, onClose }) => {
  // 배경 투명도
  const [fadeAnim] = useState(new Animated.Value(0));
  // 모달 위치
  const [slideAnim] = useState(new Animated.Value(300));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // 위로 슬라이드
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // 닫힐 때 아래로 슬라이드
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}>
      <AnimatedModalContainer style={{ opacity: fadeAnim }}>
        <AnimatedModalContent
          style={{
            transform: [{ translateY: slideAnim }],
          }}>
          <TopBar />
          <CautionContainer>
            <Title>AI 채팅 이용 안내</Title>
            <LogoIcons.chatCaution width={178} height={139} />
            <CautionText>
              제공되는 모든 의약품 정보는 참고용으로만 제공됩니다. AI의 답변은
              전문 의료 상담이 아니므로, 구체적인 복용법 및 치료에 관해서는
              반드시 의사 또는 약사와 상담 후 결정하시기 바랍니다.
            </CautionText>
          </CautionContainer>
          <Button title="확인" onPress={onClose}></Button>
        </AnimatedModalContent>
      </AnimatedModalContainer>
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
  height: 60%;
  background-color: ${themes.light.bgColor.bgPrimary};
  border-radius: 40px;
  justify-content: baseline;
  align-items: center;
  padding: 20px;
`;

const TopBar = styled.View`
  position: absolute;
  top: 10px;
  width: 40px;
  height: 5px;
  background-color: ${themes.light.textColor.Primary30};
  border-radius: 4px;
`;

const CautionContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

const Title = styled.Text`
  font-size: 22px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
  padding: 30px;
`;

const CautionText = styled.Text`
  font-size: 15px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
  padding: 30px 20px;
  line-height: 25px;
`;

export default ChatInfoModal;