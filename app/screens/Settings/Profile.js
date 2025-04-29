import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import Dialog from 'react-native-dialog';

import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { Header, InputWithDelete } from '../../components';
import { SettingsIcons } from '../../../assets/icons';


import { deleteUser, getUser } from '../../api/user';
import { useSignUp } from '../../api/context/SignUpContext';
import { clearAuthData, removeAccessToken, removeRefreshToken, removeUserInfo } from '../../api/storage';

const Profile = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [password, setPassword] = useState('');

  const { resetSignUpData } = useSignUp();

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

  const handleLogout = async () => {
    try {
      console.log('로그아웃 시작');

      await removeAccessToken();
      await removeRefreshToken();
      await removeUserInfo();
      await clearAuthData();
      resetSignUpData();
      console.log('SignUpContext 데이터 초기화 완료');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const confirmDeleteAccount = async () => {
    if (!password) {
      Alert.alert('오류', '비밀번호를 입력해주세요.');
      return;
    }
    try {
      await deleteUser(password);
      Alert.alert('완료', '계정이 삭제되었습니다.', [
        {
          text: '확인',
          onPress: async () => {
            setDialogVisible(false);
            setPassword('');
            await removeAccessToken();
            await removeRefreshToken();
            await removeUserInfo();
            await clearAuthData();
            resetSignUpData();

            navigation.reset({
              index: 0,
              routes: [{
                name: 'Auth',
                state: {
                  routes: [{ name: 'SignUpStart' }]
                }
              }]
            });
          }
        }
      ]);
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      Alert.alert('오류', error.response?.data?.message || '계정 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Container>
      <Header>프로필 설정</Header>

      <Section>
        <Title>이름</Title>
        <InputWithDelete
          value={userName}
          onChangeText={text => setUserName(text)}
          keyboardType="default"
        />
      </Section>

      <Section>
        <Title>이메일</Title>
        <InputWithDelete
          value={userEmail}
          onChangeText={text => setUserEmail(text)}
          keyboardType="default"
        />
      </Section>

      <ButtonContainer>
        <LogoutBtn onPress={handleLogout}>
          <SettingsIcons.logout width={16} height={16} color={themes.light.textColor.buttonText} />
          <BtnTitle>로그아웃</BtnTitle>
        </LogoutBtn>
        <DeleteUserBtn onPress={() => setDialogVisible(true)}>
          <SettingsIcons.trashcan width={16} height={16} color={themes.light.textColor.buttonText} />
          <BtnTitle>계정 삭제</BtnTitle>
        </DeleteUserBtn>
      </ButtonContainer>

      <Dialog.Container visible={isDialogVisible}>
        <Dialog.Title>계정 삭제</Dialog.Title>
        <Dialog.Description>계정을 삭제하려면 비밀번호를 입력하세요.</Dialog.Description>
        <Dialog.Input
          placeholder="비밀번호 입력"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <Dialog.Button label="취소" onPress={() => setDialogVisible(false)} />
        <Dialog.Button label="삭제" onPress={confirmDeleteAccount} />
      </Dialog.Container>
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
