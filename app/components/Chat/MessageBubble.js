import React from 'react';
import styled from 'styled-components/native';
import { themes } from '../../styles';
import { ChatIcons } from '../../../assets/icons';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { View, Animated } from 'react-native';

const { robot: RobotIcon } = ChatIcons;

// 타이핑 애니메이션을 위한 컴포넌트 - 위아래로 움직이는 형태로 수정
const TypingAnimation = () => {
  const [dot1] = React.useState(new Animated.Value(0));
  const [dot2] = React.useState(new Animated.Value(0));
  const [dot3] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    const animateDot = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, [dot1, dot2, dot3]);

  return (
    <TypingContainer>
      <AnimatedDot style={{
        transform: [{
          translateY: dot1.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5]
          })
        }]
      }} />
      <AnimatedDot style={{
        transform: [{
          translateY: dot2.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5]
          })
        }]
      }} />
      <AnimatedDot style={{
        transform: [{
          translateY: dot3.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5]
          })
        }]
      }} />
    </TypingContainer>
  );
};

const MessageBubble = ({ item, onOptionPress }) => {
  const { fontSizeMode } = useFontSize();

  console.log('MessageBubble rendering:', {
    id: item.id,
    type: item.type,
    isInitialMessage: item.isInitialMessage,
    hasOptions: item.options && item.options.length > 0,
    text: item.text?.substring(0, 20) // 텍스트 앞부분만 표시
  });

  if (item.type === 'bot') {
    return (
      <BotMessageContainer>
        <RobotIconContainer>
          <RobotIcon
            height={30}
            width={30}
            style={{ color: themes.light.textColor.buttonText }}
          />
        </RobotIconContainer>

        {/* 초기 메시지이거나 명시적으로 옵션이 있는 경우에만 옵션 표시 */}
        {(item.options && item.isInitialMessage) ? (
          <View style={{ flex: 1 }}>
            <BotMessageBubble>
              <BotText fontSizeMode={fontSizeMode}>{item.text}</BotText>
            </BotMessageBubble>

            <OptionWrap>
              {item.options.map((option, index) => (
                <OptionBubble key={index} onPress={() => onOptionPress?.(option)}>
                  <OptionText fontSizeMode={fontSizeMode}>{option}</OptionText>
                </OptionBubble>
              ))}
            </OptionWrap>
          </View>
        ) : (
          <BotMessageBubble>
            {item.isTyping ? (
              <TypingAnimation />
            ) : (
              <BotText fontSizeMode={fontSizeMode}>{item.text}</BotText>
            )}
          </BotMessageBubble>
        )}

        <MessageTime fontSizeMode={fontSizeMode}>{item.time}</MessageTime>
      </BotMessageContainer>
    );
  } else {
    return (
      <UserMessageContainer>
        <MessageTime fontSizeMode={fontSizeMode}>{item.time}</MessageTime>
        <UserMessageBubble>
          {item.isVoiceRecognizing ? (
            <TypingAnimation />
          ) : (
            <UserText fontSizeMode={fontSizeMode}>{item.text}</UserText>
          )}
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
`;

const BotMessageBubble = styled.View`
  background-color: 'rgba(255, 255, 255, 0.1)';
  padding: 10px 14px;
  border-radius: 2px 12px 12px 12px;
  max-width: 65%;
  margin-top: 10px;
`;

const BotText = styled.Text`
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
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
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-Medium';
`;

const UserMessageContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  margin-bottom: 20px;
`;

const UserText = styled.Text`
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  line-height: 24px;
  color: ${themes.light.textColor.buttonText};
  font-family: 'Pretendard-SemiBold';
`;

const MessageTime = styled.Text`
  font-size: ${({ fontSizeMode }) => FontSizes.caption[fontSizeMode]};
  margin: 0px 10px;
  align-self: flex-end;
  color: ${themes.light.textColor.buttonText60};
  font-family: 'Pretendard-Medium';
`;

const UserMessageBubble = styled.View`
  background-color: rgba(66, 115, 237, 0.5);
  padding: 10px 14px;
  border-radius: 12px 2px 12px 12px;
  max-width: 70%;
`;

// 타이핑 애니메이션 스타일 - 점의 스타일 유지
const TypingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 20px;
`;

const AnimatedDot = styled(Animated.View)`
  width: 5px;
  height: 5px;
  border-radius: 3px;
  background-color: ${themes.light.textColor.buttonText70};
  margin: 0 2px;
`;

export default MessageBubble;