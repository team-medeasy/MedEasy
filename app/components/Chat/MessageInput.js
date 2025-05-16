import React from 'react';
import styled from 'styled-components/native';
import {TextInput, TouchableOpacity, View} from 'react-native';
import {themes} from '../../styles';
import {ChatIcons} from '../../../assets/icons';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const {voice: VoiceIcon, mike: MikeIcon, send: SendIcon} = ChatIcons;

const MessageInput = ({inputText, setInputText, sendMessage, toggleVoiceMode}) => {
  const { fontSizeMode } = useFontSize();

  return (
    <InputContainer>
      <TextInputContainer>
        <Input
          fontSizeMode={fontSizeMode}
          placeholder="무엇이든 물어보세요!"
          value={inputText}
          onChangeText={setInputText}
          multiline={true}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
        <SendButton onPress={sendMessage}>
          <SendIcon
            width={18}
            height={18}
            style={{color: 'rgba(255, 255, 255, 0.6)'}}
          />
        </SendButton>
      </TextInputContainer>
      <VoiceIconContainer onPress={toggleVoiceMode}>
        <VoiceIcon
          width={44}
          height={44}
          style={{color: 'rgba(255, 255, 255, 0.6)'}}
        />
      </VoiceIconContainer>
    </InputContainer>
  );
};

// 스타일 정의
const InputContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 10px;
  gap: 10px;
`;

const TextInputContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  border-radius: 20px;
  min-height: 44px;
  padding: 5px 0px;
  background-color: rgba(255, 255, 255, 0.1);
`;

const MikeIconContainer = styled(TouchableOpacity)`
  width: 40px;
  height: 40px;
  border-radius: 100%;
  justify-content: center;
  align-items: center;
  background-color: ${themes.light.boxColor.inputSecondary};
  flex-shrink: 0;
`;

const VoiceIconContainer = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  margin-right: 5px;
`;

const Input = styled(TextInput)`
  flex: 1;
  padding-left: 15px;
  padding-right: 10px;
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  max-height: 100px;
  font-family: 'Pretendard-semiBold';
  padding-top: 5px;
  padding-bottom: 5px;
  color: rgba(255, 255, 255, 0.6);
`;

const SendButton = styled(TouchableOpacity)`
  padding-right: 15px;
`;

export default MessageInput;