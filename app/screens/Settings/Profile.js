import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { Button, Header, InputWithDelete } from '../../components';
import { getUser } from '../../api/user';
import { OtherIcons, SettingsIcons } from '../../../assets/icons';

const Profile = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        const userData = response.data.body;
        console.log('받아온 유저 데이터:', userData);
        setUserName(userData.name || '');
        setUserEmail(userData.email || '');
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <Container>
      <Header>프로필 설정</Header>
      <Section>
        <Title>이름</Title>
        <InputWithDelete
          value={userName}
          onChangeText={(text) => {
            setUserName(text);
          }}
          keyboardType="default"
        />
      </Section>
      <Section>
        <Title>이메일</Title>
        <InputWithDelete
          value={userEmail}
          onChangeText={(text) => {
            setUserEmail(text);
          }}
          keyboardType="default"
        />
      </Section>

      <ButtonContainer>
        <LogoutBtn>
          <SettingsIcons.logout width={16} height={16} style={{ color: themes.light.textColor.buttonText }} />
          <BtnTitle>
            로그아웃
          </BtnTitle>
        </LogoutBtn>
        <DeleteUserBtn>
          <SettingsIcons.trashcan width={16} height={16} style={{ color: themes.light.textColor.buttonText }} />
          <BtnTitle>
            계정 삭제
          </BtnTitle>
        </DeleteUserBtn>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const Section = styled.View`
  padding: 20px;
  gap: 15px;
`;

const Title = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'Pretendard-Bold';
`;

const ButtonContainer = styled.View`
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: ${themes.light.bgColor.bgPrimary};
  gap: 12px;
`;

const LogoutBtn = styled(TouchableOpacity)`
  background-color: ${themes.light.boxColor.buttonPrimary};
  border-radius: 10px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 20px;
`;

const DeleteUserBtn = styled(TouchableOpacity)`
  background-color: ${themes.light.textColor.Primary30};
  border-radius: 10px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 20px;
`;

const BtnTitle = styled.Text`
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.buttonText};
`;


export default Profile;
