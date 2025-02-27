import React from 'react';
import styled from 'styled-components/native';
import {TextInput, TouchableOpacity} from 'react-native';
import {themes} from '../../styles';
import {ChatIcons} from '../../../assets/icons';

const {add: AddIcon, mike: MikeIcon, send: SendIcon} = ChatIcons;

const MessageInput = ({inputText, setInputText, sendMessage}) => {
  return (
    <InputContainer>
      <AddIconContainer>
        <AddIcon
          width={18}
          height={18}
          style={{color: themes.light.textColor.Primary30}}
        />
      </AddIconContainer>
      <TextInputContainer>
        <Input
          placeholder="무엇이든 물어보세요!"
          value={inputText}
          onChangeText={setInputText}
          multiline={true}
        />
        <SendButton onPress={sendMessage}>
          <SendIcon
            width={18}
            height={18}
            style={{color: themes.light.textColor.Primary30}}
          />
        </SendButton>
      </TextInputContainer>
      <MikeIconContainer>
        <MikeIcon
          width={17}
          height={20}
          style={{color: themes.light.textColor.Primary}}
        />
      </MikeIconContainer>
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

const Input = styled(TextInput)`
  flex: 1;
  padding-left: 15px;
  padding-right: 10px;
  font-size: 16px;
  max-height: 100px;
`;

const SendButton = styled(TouchableOpacity)`
  padding-right: 15px;
`;

export default MessageInput;
