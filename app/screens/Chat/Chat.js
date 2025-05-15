import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {FlatList, KeyboardAvoidingView, View} from 'react-native';
import ChatInfoModal from '../../components/Chat/ChatInfoModal';
import {Header} from '../../components/Header/Header';
import {themes} from '../../styles';
import MessageBubble from '../../components/Chat/MessageBubble';
import MessageInput from '../../components/Chat/MessageInput';

const Chat = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setModalVisible(true); // 화면이 열릴 때 모달 자동 표시
  }, []);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const formattedTime = `${period} ${formattedHours}:${minutes}`;

    setMessages(prevMessages => [
      ...prevMessages,
      {id: Date.now(), type: 'user', text: inputText, time: formattedTime},
    ]);

    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: '네, 해당 내용에 대해 알려드릴게요!',
          time: formattedTime,
        },
      ]);
    }, 1000);

    setInputText('');
  };

  const renderMessage = ({item}) => {
    return <MessageBubble item={item} />;
  };

  return (
    <Container
      style={{flex: 1, backgroundColor: themes.light.bgColor.bgSecondary}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header>AI 챗봇 메디씨</Header>

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

        {/* 메시지 입력 컴포넌트 */}
        <MessageInput
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
        />
      </KeyboardAvoidingView>
      <View
        style={{
          width: '100%',
          height: 30,
          backgroundColor: themes.light.bgColor.bgPrimary,
        }}
      />
    </Container>
  );
};

const Container = styled.View``;

export default Chat;
