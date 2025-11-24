import React, { useCallback, useState } from 'react';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {themes} from './../../styles';
import {Footer} from '../../components';
import MedicationInfo from '../../components/MedicationInfo';
import SettingList from '../../components/SettingList';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';

import { getUser } from '../../api/user';
import { useFocusEffect } from '@react-navigation/native';
import { Platform } from 'react-native';

const MyPage = () => {
  const {fontSizeMode} = useFontSize();
  const [userName, setUserName] = useState('');
  const insets = useSafeAreaInsets(); // SafeArea 인셋 가져오기

  const heartIcon = Platform.OS === 'ios' ? '🩵' : '💙';

  useFocusEffect(
      useCallback(() => {
        const fetchUser = async () => {
          try {
            const response = await getUser();
            const userData = response.data.body;
            console.log('받아온 유저 데이터:', userData);
            setUserName(userData.name || '');
          } catch (error) {
            console.error('유저 정보 불러오기 실패:', error);
          }
        };
        fetchUser();
      }, [])
    );

  return (
    <Container>
      <ScrollContent>
        {/* 헤더 */}
        <HeaderContainer>
                <Header style={{paddingTop: insets.top}}>
                  <HeaderText fontSizeMode={fontSizeMode}>내 정보</HeaderText>
                </Header>
              </HeaderContainer>
        {/* 웰컴 메시지, 프로필 설정 */}
        <ProfileContainer>
          <TextContainer>
            <UserText fontSizeMode={fontSizeMode}>
              안녕하세요, {userName}님{heartIcon}
            </UserText>
            <SmallText fontSizeMode={fontSizeMode}>
              오늘도 건강한 하루 되세요!
            </SmallText>
          </TextContainer>
        </ProfileContainer>
        {/* 약 챙겨먹은 일수 */}
        <MedicationInfo days={32} medicationCount={5} />
        {/* 설정 리스트 */}
        <SettingList />
        {/* Footer */}
        <FooterContainer>
          <Footer />
        </FooterContainer>
      </ScrollContent>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.boxColor.buttonPrimary};
`;

const HeaderContainer = styled.View`
  justify-content: flex-end;
  padding-top: 10px;
`;

const Header = styled.View`
  flex-direction: row;
  padding: 0px 20px;
  justify-content: space-between;
`;

const HeaderText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

const ScrollContent = styled.ScrollView`
  flex: 1;
`;

const ProfileContainer = styled.View`
  align-items: center;
  background-color: ${themes.light.boxColor.buttonPrimary};
  flex-direction: row;
`;

const TextContainer = styled.View`
  justify-content: center;
  padding: 20px;
  position: relative;
  gap: 9px;
`;

const UserText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

const SmallText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'KimjungchulGothic-Regular';
  color: ${themes.light.textColor.buttonText60};
`;

const FooterContainer = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
`;
export default MyPage;
