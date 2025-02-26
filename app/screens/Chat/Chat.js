import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {FlatList, TextInput, TouchableOpacity} from 'react-native';
import ChatInfoModal from './ChatInfoModal';
import {ChatIcons} from '../../../assets/icons';
import {themes} from '../../styles';

const {
  add: AddIcon,
  mike: MikeIcon,
  robot: RobotIcon,
  send: SendIcon,
} = ChatIcons;

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
    if (item.type === 'bot') {
      return (
        <BotMessageContainer>
          <RobotIconContainer>
            <RobotIcon
              height={30}
              width={30}
              style={{color: themes.light.textColor.buttonText}}
            />
          </RobotIconContainer>
          <BotMessageBubble>
            <BotText>{item.text}</BotText>
            {item.options && (
              <BotOptions>
                {item.options.map((option, index) => (
                  <OptionButton
                    key={index}
                    isLast={index === item.options.length - 1}>
                    <OptionText>{option}</OptionText>
                  </OptionButton>
                ))}
              </BotOptions>
            )}
          </BotMessageBubble>
          <MessageTime>{item.time}</MessageTime>
        </BotMessageContainer>
      );
    } else {
      return (
        <UserMessageContainer>
          <MessageTime>{item.time}</MessageTime>
          <UserMessageBubble>
            <UserText>{item.text}</UserText>
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
        {/* 추가 아이콘 컨테이너 */}
        <AddIconContainer>
          <AddIcon
            width={18}
            height={18}
            style={{color: themes.light.textColor.Primary30}}
          />
        </AddIconContainer>

        {/* 입력 필드 및 전송 버튼 컨테이너 */}
        <TextInputContainer>
          <Input
            placeholder="무엇이든 물어보세요!"
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
          />
          <SendButton onPress={sendMessage}>
            <SendIcon
              width={16}
              height={16}
              style={{color: themes.light.textColor.Primary30}}
            />
          </SendButton>
        </TextInputContainer>

        {/* 마이크 아이콘 컨테이너 */}
        <MikeIconContainer>
          <MikeIcon
            width={17}
            height={20}
            style={{color: themes.light.textColor.Primary}}
          />
        </MikeIconContainer>
      </InputContainer>
    </Container>
  );
};

// 스타일 정의
const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgSecondary};
`;

const BotMessageContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 20px;
  /* iOS 그림자 */
  shadow-color: black;
  shadow-offset: 5px 5px;
  shadow-opacity: 0.07;
  shadow-radius: 30px;
  /* Android 그림자 */
  elevation: 5;
`;

const RobotIconContainer = styled.View`
  background-color: ${themes.light.pointColor.Primary};
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  margin-right: 10px;
`;

const BotMessageBubble = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 15px 20px;
  border-radius: 20px;
  border-top-left-radius: 3px;
  max-width: 65%;
`;

const BotText = styled.Text`
  font-size: 15px;
  line-height: 24px;
  color: ${themes.light.textColor.Primary};
  font-family: 'Pretendard-Medium';
`;

const BotOptions = styled.View`
  margin-top: 15px;
  margin-bottom: 5px;
  background-color: ${themes.light.pointColor.Primary10};
  border-radius: 12px;
`;

const OptionButton = styled.TouchableOpacity`
  padding: 10px;
  justify-content: center;
  align-items: center;
  border-bottom-width: ${({isLast}) => (isLast ? '0px' : '1px')};
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
`;

const OptionText = styled.Text`
  color: ${themes.light.pointColor.Primary};
  font-size: 15px;
  font-family: 'Pretendard-Semibold';
`;

const UserMessageContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  margin-bottom: 20px;
`;

const UserText = styled.Text`
  font-size: 15px;
  line-height: 24px;
  color: ${themes.light.textColor.buttonText};
  font-family: 'Pretendard-SemiBold';
`;

const MessageTime = styled.Text`
  font-size: 12px;
  margin: 0px 10px;
  align-self: flex-end;
  color: ${themes.light.textColor.Primary30};
  font-family: 'Pretendard-Medium';
`;

const UserMessageBubble = styled.View`
  background-color: ${themes.light.pointColor.Primary};
  padding: 15px 20px;
  border-radius: 20px;
  border-top-right-radius: 3px;
  max-width: 70%;
`;

const InputContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 10px;
  padding-bottom: 30px;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const AddIconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 100%;
  justify-content: center;
  align-items: center;
  background-color: ${themes.light.boxColor.inputSecondary};
  flex-shrink: 0;
`;

const TextInputContainer = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;
  margin: 0px 10px;
  min-height: 40px;
  padding: 5px 0px;
  background-color: ${themes.light.boxColor.inputSecondary};
`;

const MikeIconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 100%;
  justify-content: center;
  align-items: center;
  background-color: ${themes.light.boxColor.inputSecondary};
  flex-shrink: 0;
`;

const Input = styled.TextInput`
  flex: 1;
  padding-left: 15px;
  padding-right: 10px;
  font-size: 16px;
  max-height: 100px;
`;

const SendButton = styled.TouchableOpacity`
  padding-right: 15px;
`;

export default Chat;
