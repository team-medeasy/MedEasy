import React, { useEffect, useState } from 'react';
import { 
  Alert,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
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
  getAuthType,
  AUTH_TYPES
} from '../../api/storage';
import { setAuthToken } from '../../api';
import { kakaoDeleteAccount } from '../../api/services/kakaoAuth';
import { appleDeleteAccount } from '../../api/services/appleAuth';

const Profile = () => {
  const navigation = useNavigation();
  const { fontSizeMode } = useFontSize();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [authType, setAuthType] = useState(AUTH_TYPES.EMAIL);
  const [loading, setLoading] = useState(false);

  const { resetSignUpData, updateSignUpData } = useSignUp();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 사용자 정보 가져오기
        const response = await getUser();
        const userData = response.data.body;
        console.log('받아온 유저 데이터:', userData);
        setUserName(userData.name || '');
        setUserEmail(userData.email || '');

        // 로그인 방식 확인
        const type = await getAuthType();
        setAuthType(type || AUTH_TYPES.EMAIL);
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };

    fetchUserData();
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
      });

      Alert.alert('완료', '이름이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('이름 수정 오류:', error);
      Alert.alert('오류', error.response?.data?.message || '이름 수정에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('로그아웃 시작');

      // 추가: 카카오 로그인인 경우 카카오 SDK로 로그아웃
      if (authType === AUTH_TYPES.KAKAO) {
        try {
          const { kakaoLogout } = require('../../api/services/kakaoAuth');
          await kakaoLogout();
        } catch (error) {
          console.warn('카카오 로그아웃 실패 (무시됨):', error);
        }
      }

      // 모든 인증 데이터 삭제
      await clearAuthData();
      setAuthToken(null);

      // 컨텍스트 초기화
      resetSignUpData();
      console.log('SignUpContext 데이터 초기화 완료');

      // 로그인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const performAccountDelete = async () => {
    try {
      setLoading(true);

      // 로그인 방식에 따라 다른 삭제 처리
      if (authType === AUTH_TYPES.EMAIL) {
        // 이메일 로그인 사용자는 비밀번호 확인 필요
        if (!password) {
          Alert.alert('오류', '비밀번호를 입력해주세요.');
          setLoading(false);
          return;
        }

        await deleteUser(password);
        setDialogVisible(false);
        setPassword('');

        Alert.alert('완료', '계정이 삭제되었습니다.', [
          {
            text: '확인',
            onPress: () => cleanupAndNavigate()
          }
        ]);
      } else if (authType === AUTH_TYPES.APPLE) {
        // 애플 로그인 사용자
        try {
          setDialogVisible(false);
          await appleDeleteAccount();

          Alert.alert('완료', '계정이 삭제되었습니다.', [
            {
              text: '확인',
              onPress: () => cleanupAndNavigate()
            }
          ]);
        } catch (error) {
          console.error('애플 계정 탈퇴 실패:', error);
          if (error.code !== 'ERR_CANCELED') {
            Alert.alert(
              '오류',
              error.userMessage || '계정 삭제에 실패했습니다. 다시 시도해주세요.'
            );
          }
        }
      } else if (authType === AUTH_TYPES.KAKAO) {
        // 카카오 로그인 사용자
        try {
          setDialogVisible(false);
          await kakaoDeleteAccount();

          Alert.alert('완료', '계정이 삭제되었습니다.', [
            {
              text: '확인',
              onPress: () => cleanupAndNavigate()
            }
          ]);
        } catch (error) {
          console.error('카카오 계정 탈퇴 실패:', error);
          Alert.alert(
            '오류',
            error.userMessage || '카카오 계정 연결 해제에 실패했습니다. 다시 시도해주세요.'
          );
        }
      }
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      setDialogVisible(false);
      setPassword('');

      Alert.alert(
        '오류',
        error.response?.data?.message || '계정 삭제에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 및 탈퇴 후 공통 처리
  const cleanupAndNavigate = async () => {
    await clearAuthData();
    setAuthToken(null);
    resetSignUpData();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  // 로그인 방식에 따른 다이얼로그 내용
  const renderDialogContent = () => {
    switch (authType) {
      case AUTH_TYPES.APPLE:
        return (
          <Dialog.Description>
            Apple 계정 연결을 해제하고 계정을 삭제하시겠습니까?
            {"\n"}계속하면 Apple 인증 화면으로 이동합니다.
          </Dialog.Description>
        );
      case AUTH_TYPES.KAKAO:
        return (
          <Dialog.Description>
            카카오 계정 연결을 해제하고 계정을 삭제하시겠습니까?
          </Dialog.Description>
        );
      case AUTH_TYPES.EMAIL:
      default:
        return (
          <>
            <Dialog.Description>계정을 삭제하려면 비밀번호를 입력하세요.</Dialog.Description>
            <Dialog.Input
              placeholder="비밀번호 입력"
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </>
        );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Container>
        <Header>프로필 설정</Header>

        <Section>
          <Title fontSizeMode={fontSizeMode}>이름</Title>
          <View style={{
            flexDirection: 'row',
            gap: 15,
            alignItems: 'center',
          }}>
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

        <Section>
          <Title fontSizeMode={fontSizeMode}>로그인 방식</Title>
          <LoginMethodText fontSizeMode={fontSizeMode}>
            {authType === AUTH_TYPES.EMAIL ? '이메일 계정' :
              authType === AUTH_TYPES.APPLE ? 'Apple 계정' :
                authType === AUTH_TYPES.KAKAO ? '카카오 계정' : '알 수 없음'}
          </LoginMethodText>
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
            onPress={() => {
              setPassword('');
              setDialogVisible(true);
            }}
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
          {renderDialogContent()}
          {loading && (
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <ActivityIndicator size="small" color={themes.light.textColor.Primary30} />
            </View>
          )}
          <Dialog.Button label="취소" onPress={() => setDialogVisible(false)} />
          <Dialog.Button label="삭제" onPress={performAccountDelete} disabled={loading} />
        </Dialog.Container>
      </Container>
    </TouchableWithoutFeedback>
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

const LoginMethodText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.textSecondary};
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