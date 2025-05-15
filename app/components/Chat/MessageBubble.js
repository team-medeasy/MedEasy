import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import {ChatIcons} from '../../../assets/icons';
import FontSizes from '../../../assets/fonts/fontSizes';
import { View } from 'react-native';

const {robot: RobotIcon} = ChatIcons;

const MessageBubble = ({item}) => {
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

        <View style={{ flex: 1 }}>
          <BotMessageBubble>
            <BotText>{item.text}</BotText>
          </BotMessageBubble>

          {item.options && (
            <OptionWrap>
              {item.options.map((option, index) => (
                <OptionBubble key={index}>
                  <OptionText>{option}</OptionText>
                </OptionBubble>
              ))}
            </OptionWrap>
          )}

          <MessageTime>{item.time}</MessageTime>
        </View>

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

// 스타일 정의
const BotMessageContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 20px;
  shadow-color: black;
  shadow-offset: 5px 5px;
  shadow-opacity: 0.07;
  shadow-radius: 30px;
  elevation: 5;
`;

const RobotIconContainer = styled.View`
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

const BotMessageBubble = styled.View`
  background-color: 'rgba(255, 255, 255, 0.1)';
  padding: 10px 14px;
  border-radius: 2px 12px 12px 12px;
  max-width: 65%;
`;

const BotText = styled.Text`
  font-size: ${FontSizes.body.default};
  line-height: 24px;
  color: ${themes.light.textColor.buttonText};
  font-family: 'Pretendard-Medium';
`;

const OptionWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 12px;
  row-gap: 8px;
  column-gap: 8px;
`;

const OptionBubble = styled.TouchableOpacity`
  background-color: rgba(255, 255, 255, 0.1);  
  padding: 8px 12px;
  border-radius: 12px;
  align-self: flex-start;      
  flex-shrink: 0;              
`;

const OptionText = styled.Text`
  color: ${themes.light.textColor.buttonText};
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
`;

const UserMessageContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  margin-bottom: 20px;
`;

const UserText = styled.Text`
  font-size: ${FontSizes.body.default};
  line-height: 24px;
  color: ${themes.light.textColor.buttonText};
  font-family: 'Pretendard-SemiBold';
`;

const MessageTime = styled.Text`
  font-size: ${FontSizes.caption.default};
  margin: 0px 10px;
  align-self: flex-end;
  color: ${themes.light.textColor.Primary30};
  font-family: 'Pretendard-Medium';
`;

const UserMessageBubble = styled.View`
  background-color: rgba(66, 115, 237, 0.5);
  padding: 10px 14px;
  border-radius: 20px;
  border-top-right-radius: 3px;
  max-width: 70%;
`;

export default MessageBubble;
