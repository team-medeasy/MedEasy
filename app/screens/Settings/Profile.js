import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
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
import { clearAuthData, removeAccessToken, removeRefreshToken, removeUserInfo } from '../../api/storage';

const Profile = () => {
  const navigation = useNavigation();
  const {fontSizeMode} = useFontSize();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [password, setPassword] = useState('');

  const { resetSignUpData, updateSignUpData } = useSignUp();

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

  const handleUpdateUserName = async () => {
    if (!userName.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return;
    }
    try {
      console.log('서버에 보낼 이름:', userName);  
      await updateUserName({ name: userName });

      // SignUpContext 업데이트
      updateSignUpData({
        firstName: userName,
      })

      Alert.alert('완료', '이름이 성공적으로 수정되었습니다.'); 
    } catch (error) {
      console.error('이름 수정 오류:', error);
      Alert.alert('오류', error.response?.data?.message || '이름 수정에 실패했습니다.');
    }
  };  

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
        <Title fontSizeMode={fontSizeMode}>이름</Title>
        <View style={{
          flexDirection: 'row',
          gap: 15,
        }}>
          <View style={{flex: 1}}>
            <InputWithDelete
              value={userName}
              onChangeText={text => setUserName(text)}
              keyboardType="default"
            />
          </View>
          <TestBtn onPress={handleUpdateUserName}>
            <BtnTitle fontSizeMode={fontSizeMode}>변경하기</BtnTitle>
          </TestBtn>
        </View>
      </Section>

      <Section>
        <Title fontSizeMode={fontSizeMode}>이메일</Title>
        <ReadOnlyInput text={userEmail}/>
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
          onPress={() => setDialogVisible(true)}
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
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]}px;
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
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.buttonText};
`;

export default Profile;
