import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { Header } from '../../components';
import { OtherIcons, SettingsIcons } from '../../../assets/icons';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';

const FAQ = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { fontSizeMode } = useFontSize();

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <Container>
      <Header>자주 하는 질문</Header>
      
      <FAQListButton onPress={toggleExpand}>
        <ContentArea>
          <IconWrapper>
            <SettingsIcons.faq2 width={16} height={16}/>
          </IconWrapper>
          <FAQContainer>
            <FAQTitle fontSizeMode={fontSizeMode} numberOfLines={2} ellipsizeMode="tail">
              알약 사진을 찍었는데 약 정보가 제대로 안 나와요.
            </FAQTitle>
          </FAQContainer>
        </ContentArea>

        <ChevronWrapper>
          <OtherIcons.chevronDown
            width={12}
            height={6}
            style={{
              color: themes.light.textColor.Primary30,
              transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
            }}
          />
        </ChevronWrapper>
      </FAQListButton>

      {isExpanded && (
        <FAQContent fontSizeMode={fontSizeMode}>
          {"안녕하세요. 팀 메디지입니다.\n\n" +
          "많은 기대와 응원 속에 드디어 메디지가 앱스토어에 정식 출시되었습니다.\n\n" +
          "앞으로도 유저 여러분의 건강한 일상을 만들어 나가기 위해 항상 노력하겠습니다!\n\n" +
          "💪 사용 중 불편한 점이나 개선이 필요한 점이 있다면 앱 내 문의하기 기능을 통해 언제든지 의견 남겨주세요!\n\n" +
          "감사합니다.\n\n" +
          "팀 메디지 드림"}
        </FAQContent>
      )}
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const FAQListButton = styled(TouchableOpacity)`
  padding: 16px 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
`;

const ContentArea = styled.View`
  flex-direction: row;
  align-items: flex-start;
  flex: 1;
  margin-right: 8px;
`;

const IconWrapper = styled.View`
  padding-top: 2px;
  margin-right: 16px;
`;

const ChevronWrapper = styled.View`
  padding-top: 8px;
`;

const FAQContainer = styled.View`
  flex: 1;
  flex-direction: column;
`;

const FAQTitle = styled.Text`
  font-family: 'Pretendard-SemiBold';
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.textPrimary};
  flex-wrap: wrap;
`;

const FAQContent = styled.Text`
  padding: 16px 28px;
  font-family: 'Pretendard-Medium';
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.Primary70};
  background-color: ${themes.light.bgColor.bgSecondary};
  line-height: 26px;
`;

export default FAQ;