import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import {ChatIcons} from '../../../assets/icons';

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
  margin: 0px 10px;
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

export default MessageBubble;
