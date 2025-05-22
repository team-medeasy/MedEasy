import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import Dialog from 'react-native-dialog';

import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { Header, InputWithDelete, ReadOnlyInput, IconTextButton } from '../../components';
import { SettingsIcons } from '../../../assets/icons';

import { deleteUser, getUser, updateUserName } from '../../api/user';
import { useSignUp } from '../../api/context/SignUpContext';
import {
  clearAuthData,
  removeAccessToken,
  removeRefreshToken,
  removeUserInfo,
  getLoginProvider,
} from '../../api/storage';

import { handleAccountDelete } from '../../api/services/authService';

const Profile = () => {
  const navigation = useNavigation();
  const { fontSizeMode } = useFontSize();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetSignUpData, updateSignUpData } = useSignUp();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        const userData = response.data.body;
        setUserName(userData.name || '');
        setUserEmail(userData.email || '');
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };
    fetchUser();

    // 로그인 방식(provider) 불러오기
    (async () => {
      const p = await getLoginProvider();
      setProvider(p);
    })();
  }, []);

  const handleUpdateUserName = async () => {
    if (!userName.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return;
    }
    try {
      await updateUserName({ name: userName });
      updateSignUpData({ firstName: userName });
      Alert.alert('완료', '이름이 성공적으로 수정되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.response?.data?.message || '이름 수정에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await removeAccessToken();
      await removeRefreshToken();
      await removeUserInfo();
      await clearAuthData();
      resetSignUpData();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 이메일 계정 삭제 (비밀번호 필요)
  const confirmDeleteAccountEmail = async () => {
    if (!password) {
      Alert.alert('오류', '비밀번호를 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
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
      Alert.alert('오류', error.response?.data?.message || '계정 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 소셜(애플/카카오) 계정 삭제
  const confirmDeleteAccountSocial = async () => {
    try {
      setLoading(true);
      await handleAccountDelete(navigation);
      setDialogVisible(false);
      setPassword('');
    } catch (error) {
      Alert.alert(
        '오류',
        error.response?.data?.message || error.userMessage || error.message || '계정 삭제에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 계정 삭제 버튼 클릭 시
  const handleDeletePress = () => {
    setDialogVisible(true);
  };

  // 다이얼로그 삭제 버튼 핸들러
  const dialogDeleteHandler = provider === 'email' ? confirmDeleteAccountEmail : confirmDeleteAccountSocial;

  return (
    <Container>
      <Header>프로필 설정</Header>

      <Section>
        <Title fontSizeMode={fontSizeMode}>이름</Title>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <View style={{ flex: 1 }}>
            <InputWithDelete
              value={userName}
              onChangeText={text => setUserName(text)}
              keyboardType="default"
              placeholder="이름을 입력하세요"
            />
          </View>
          <TestBtn onPress={handleUpdateUserName}>
            <BtnTitle fontSizeMode={fontSizeMode}>변경하기</BtnTitle>
          </TestBtn>
        </View>
      </Section>

      <Section>
        <Title fontSizeMode={fontSizeMode}>이메일</Title>
        <ReadOnlyInput text={userEmail} />
      </Section>

      <ButtonContainer>
        <IconTextButton
          onPress={handleLogout}
          icon={
            <SettingsIcons.logout
              width={16}
              height={16}
              color={themes.light.textColor.buttonText}
            />
          }
          title="로그아웃"
        />
        <IconTextButton
          onPress={handleDeletePress}
          icon={
            <SettingsIcons.trashcan
              width={16}
              height={16}
              color={themes.light.textColor.buttonText}
            />
          }
          title="계정 삭제"
          bgColor={themes.light.textColor.Primary30}
        />
      </ButtonContainer>

      <Dialog.Container visible={isDialogVisible}>
        <Dialog.Title>계정 삭제</Dialog.Title>
        {/* provider에 따라 입력창 및 설명 분기 */}
        {provider === 'email' ? (
          <>
            <Dialog.Description>계정을 삭제하려면 비밀번호를 입력하세요.</Dialog.Description>
            <Dialog.Input
              placeholder="비밀번호 입력"
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </>
        ) : (
          <>
            <Dialog.Description>
              정말로 계정을 삭제하시겠습니까?
              {provider === 'kakao' && '\n카카오 계정 탈퇴는 추후 지원 예정입니다.'}
            </Dialog.Description>
          </>
        )}
        {loading && <ActivityIndicator size="small" color={themes.light.textColor.Primary30} style={{ marginVertical: 8 }} />}
        <Dialog.Button label="취소" onPress={() => setDialogVisible(false)} />
        <Dialog.Button label="삭제" onPress={dialogDeleteHandler} />
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
  font-size: ${({ fontSizeMode }) => FontSizes.heading[fontSizeMode]};
  font-family: 'Pretendard-Bold';
`;

const ButtonContainer = styled.View`
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  padding: 20px;
  gap: 12px;
`;

const TestBtn = styled(TouchableOpacity)`
  background-color: ${themes.light.boxColor.buttonPrimary};
  border-radius: 10px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 20px;
`;

const BtnTitle = styled.Text`
  font-family: 'Pretendard-SemiBold';
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.buttonText};
`;

export default Profile;