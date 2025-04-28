import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { Header } from '../../components';
import { OtherIcons, SettingsIcons } from '../../../assets/icons';

const Profile = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <Container>
      <Header>공지사항</Header>
      
      <NewsListButton onPress={toggleExpand}>
        <ContentArea>
          <SettingsIcons.megaphone />
          <NewsContainer>
            <NewsTitle>메디지 앱스토어 정식 출시 안내</NewsTitle>
            <NewsDate>2025년 5월 00일</NewsDate>
          </NewsContainer>
        </ContentArea>

        <OtherIcons.chevronDown
          width={12}
          height={6}
          style={{
            color: themes.light.textColor.Primary30,
            transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
          }}
        />
      </NewsListButton>

      {isExpanded && (
        <NewsContent>
          안녕하세요. 팀 메디지입니다. 
          많은 기대와 응원 속에 드디어 메디지가 앱스토어에 정식 출시되었습니다. 앞으로도 유저 여러분의 건강한 일상을 만들어 나가기 위해 항상 노력하겠습니다 💪 사용 중 불편한 점이나 개선이 필요한 점이 있다면 앱 내 문의하기 기능을 통해 언제든지 의견 남겨주세요! 감사합니다. 팀 메디지 드림
        </NewsContent>
      )}
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const NewsListButton = styled(TouchableOpacity)`
  padding: 16px 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
`;

const ContentArea = styled.View`
  flex-direction: row;
  align-items: center;
`;

const NewsContainer = styled.View`
  padding: 0 16px;
  flex-direction: column;
`;

const NewsTitle = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.textPrimary};
`;

const NewsDate = styled.Text`
  font-family: 'Pretendard-Regular';
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.Primary50};
`;

const NewsContent = styled.Text`
  padding: 16px 28px;
  font-family: 'Pretendard-Regular';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.Primary70};
  background-color: ${themes.light.bgColor.bgSecondary};
`;

export default Profile;
