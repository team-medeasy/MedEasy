import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import ChatInfoModal from './ChatInfoModal';

const Chat = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setModalVisible(true); // 화면이 열릴 때 모달 자동 표시
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <Container>
      {/* 뒤로가기 버튼 */}
      <BackButton onPress={handleGoBack}>
        <BackButtonText>뒤로가기</BackButtonText>
      </BackButton>

      {/* 채팅 제목 */}
      <Title>채팅</Title>

      {/* 채팅 이용 안내 모달 */}
      <ChatInfoModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: white;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: black;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  top: 40px;
  left: 20px;
  background-color: #f1f1f1;
  padding: 10px 20px;
  /* elevation: 5;
  shadow-color: #000;
  shadow-offset: 2px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px; */
`;

const BackButtonText = styled.Text`
  font-size: 16px;
  font-weight: bold;
`;

export default Chat;
