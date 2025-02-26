import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {FlatList, TextInput, TouchableOpacity} from 'react-native';
import ChatInfoModal from './ChatInfoModal';
import {ChatIcons} from '../../../assets/icons';

const {send: SendIcon} = ChatIcons;

const Chat = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '복용하는 약에 대해 궁금하신 점이 있으신가요?',
      options: ['복용 방법', '주의사항', '주변 병원 정보', '그 외 궁금한 점'],
    },
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setModalVisible(true); // 화면이 열릴 때 모달 자동 표시
  }, []);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    // 사용자 메시지 추가
    setMessages(prevMessages => [
      ...prevMessages,
      {id: Date.now(), type: 'user', text: inputText},
    ]);
    setInputText('');
  };

  const renderMessage = ({item}) => {
    if (item.type === 'bot') {
      return (
        <BotMessageContainer>
          <BotIcon>🤖</BotIcon>
          <BotMessage>
            <BotText>{item.text}</BotText>
            {item.options && (
              <BotOptions>
                {item.options.map((option, index) => (
                  <OptionButton key={index}>
                    <OptionText>{option}</OptionText>
                  </OptionButton>
                ))}
              </BotOptions>
            )}
          </BotMessage>
        </BotMessageContainer>
      );
    } else {
      return (
        <UserMessageContainer>
          <UserMessageBubble>
            <UserMessage>{item.text}</UserMessage>
          </UserMessageBubble>
        </UserMessageContainer>
      );
    }
  };

  return (
    <Container>
      {/* 채팅 이용 안내 모달 */}
      <ChatInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* 채팅 메시지 목록 */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{padding: 16}}
      />

      {/* 메시지 입력창 */}
      <InputContainer>
        <Input
          placeholder="무엇이든 물어보세요!"
          value={inputText}
          onChangeText={setInputText}
        />
        <SendButton onPress={sendMessage}>
          <SendIcon width={24} height={24} />
        </SendButton>
      </InputContainer>
    </Container>
  );
};

// 스타일 정의
const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const BotMessageContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const BotIcon = styled.Text`
  font-size: 20px;
  margin-right: 8px;
`;

const BotMessage = styled.View`
  background-color: #f0f0f0;
  padding: 12px;
  border-radius: 10px;
  max-width: 70%;
`;

const BotText = styled.Text`
  font-size: 16px;
  color: black;
`;

const BotOptions = styled.View`
  margin-top: 8px;
`;

const OptionButton = styled.TouchableOpacity`
  background-color: white;
  padding: 8px;
  margin-top: 5px;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const OptionText = styled.Text`
  color: blue;
  font-size: 14px;
`;

const UserMessageContainer = styled.View`
  align-items: flex-end;
  margin-bottom: 10px;
`;

const UserMessage = styled.Text`
  background-color: #007aff;
  padding: 12px;
  border-radius: 10px;
  max-width: 70%;
  color: white;
`;

const UserMessageBubble = styled.View`
  background-color: #007aff;
  padding: 12px;
  border-radius: 10px;
  max-width: 70%;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
  border-top-width: 1px;
  border-top-color: #ddd;
`;

const Input = styled.TextInput`
  flex: 1;
  padding: 10px;
  font-size: 16px;
`;

const SendButton = styled.TouchableOpacity`
  padding: 10px;
`;

export default Chat;
