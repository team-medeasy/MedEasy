import React, {useState, useEffect} from 'react';
import {Alert, Linking, View, ActivityIndicator} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import Dialog from 'react-native-dialog';
import {SettingsIcons} from './../../assets/icons';
import {themes} from './../styles';
import {deleteUser} from '../api/user';
import FontSizes from '../../assets/fonts/fontSizes';
import {useFontSize} from '../../assets/fonts/FontSizeContext';
import {
  removeAccessToken,
  removeRefreshToken,
  removeUserInfo,
  clearAuthData,
  getAuthType,
  AUTH_TYPES,
  getRefreshToken,
} from '../api/storage';

import {useSignUp} from '../api/context/SignUpContext';
import {setAuthToken} from '../api';
import {kakaoDeleteAccount} from '../api/services/kakaoAuth';
import {appleDeleteAccount} from '../api/services/appleAuth';

const SettingList = () => {
  const navigation = useNavigation();
  const {fontSizeMode} = useFontSize();
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [authType, setAuthType] = useState(AUTH_TYPES.EMAIL);
  const [loading, setLoading] = useState(false);
  const appVersion = '1.0.0'; // 앱 버전 정보

  const {resetSignUpData} = useSignUp();

  // 로그인 방식 확인
  useEffect(() => {
    const checkAuthType = async () => {
      try {
        const type = await getAuthType();
        setAuthType(type || AUTH_TYPES.EMAIL);
      } catch (error) {
        console.error('로그인 방식 확인 실패:', error);
        setAuthType(AUTH_TYPES.EMAIL);
      }
    };

    checkAuthType();
  }, []);

  // 의견 남기기 기능
  const handleFeedback = async () => {
    const email = 'team.medeasy@gmail.com';
    const subject = '메디지 앱 의견';
    const body = '안녕하세요, 메디지 앱에 대한 의견을 남깁니다:\n\n';

    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    // 먼저 경고창을 통해 사용자에게 확인
    Alert.alert(
      '📨 외부 메일 앱으로 이동해요',
      '여러분의 소중한 의견이 사용성 개선에 큰 힘이 됩니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '이동하기',
          onPress: async () => {
            // 이메일 앱을 열 수 있는지 확인
            const canOpen = await Linking.canOpenURL(url);

            if (canOpen) {
              await Linking.openURL(url);
            } else {
              Alert.alert('오류', '이메일 앱을 열 수 없습니다.');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  // 로그아웃 처리
  const performLogout = async () => {
    try {
      // AsyncStorage 데이터 삭제
      await clearAuthData(); // 모든 인증 데이터 제거

      // 추가: 카카오 로그인인 경우 카카오 SDK로 로그아웃
      if (authType === AUTH_TYPES.KAKAO) {
        try {
          const {kakaoLogout} = require('../api/services/kakaoAuth');
          await kakaoLogout();
        } catch (error) {
          console.warn('카카오 로그아웃 실패 (무시됨):', error);
        }
      }

      // 인증 헤더 제거
      setAuthToken(null);

      // SignUpContext 데이터 초기화
      resetSignUpData();
      console.log('SignUpContext 데이터 초기화 완료');

      // 스택을 모두 비우고 새로운 화면으로 이동 (뒤로가기 방지)
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      Alert.alert(
        '오류',
        '로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.',
      );
    }
  };

  // 계정 삭제 처리
  const performAccountDelete = async () => {
    try {
      setLoading(true);

      // 로그인 방식에 따라 다른 삭제 처리
      if (authType === AUTH_TYPES.EMAIL) {
        try {
          setDialogVisible(false);

          const refreshToken = await getRefreshToken(); // 먼저 가져와야 함
          console.log('[탈퇴 요청 전] 저장된 refresh token:', refreshToken);

          if (!refreshToken) {
            Alert.alert(
              '오류',
              '인증 정보가 없습니다. 다시 로그인 후 시도해주세요.',
            );
            return;
          }

          await deleteUser(refreshToken); // 탈퇴 요청
          await removeRefreshToken();
          Alert.alert('완료', '계정이 삭제되었습니다.', [
            {
              text: '확인',
              onPress: () => cleanupAndNavigate(),
            },
          ]);
        } catch (error) {
          console.error('이메일 계정 탈퇴 실패:', error);
          Alert.alert(
            '오류',
            error.response?.data?.message ||
              '계정 삭제에 실패했습니다. 다시 시도해주세요.',
          );
        }
      } else if (authType === AUTH_TYPES.APPLE) {
        // 애플 로그인 사용자
        try {
          setDialogVisible(false);
          await appleDeleteAccount();

          Alert.alert('완료', '계정이 삭제되었습니다.', [
            {
              text: '확인',
              onPress: () => cleanupAndNavigate(),
            },
          ]);
        } catch (error) {
          console.error('애플 계정 탈퇴 실패:', error);
          if (error.code !== 'ERR_CANCELED') {
            Alert.alert(
              '오류',
              error.userMessage ||
                '계정 삭제에 실패했습니다. 다시 시도해주세요.',
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
              onPress: () => cleanupAndNavigate(),
            },
          ]);
        } catch (error) {
          console.error('카카오 계정 탈퇴 실패:', error);
          Alert.alert(
            '오류',
            error.userMessage ||
              '카카오 계정 연결 해제에 실패했습니다. 다시 시도해주세요.',
          );
        }
      }
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      setDialogVisible(false);
      setPassword('');

      Alert.alert(
        '오류',
        error.response?.data?.message ||
          '계정 삭제에 실패했습니다. 다시 시도해주세요.',
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
      routes: [{name: 'Auth'}],
    });
  };

  const handlePress = name => {
    switch (name) {
      case 'Profile':
      case 'Notification':
      case 'FontSize':
      case 'Favorites':
      case 'Announcements':
      case 'FAQ':
        navigation.navigate('SettingStack', {screen: name});
        break;
      case 'Feedback':
        handleFeedback();
        break;
      case 'AppVersion':
        // 기능 없음
        break;
      case 'DeleteAccount':
        // 회원 탈퇴 다이얼로그 표시
        setPassword(''); // 비밀번호 초기화
        setDialogVisible(true);
        break;
      case 'Logout':
        Alert.alert(
          '로그아웃',
          '정말 로그아웃하시겠습니까?',
          [
            {text: '취소', style: 'cancel'},
            {text: '확인', onPress: performLogout},
          ],
          {cancelable: true},
        );
        break;
    }
  };

  // 로그인 방식에 따른 다이얼로그 내용
  const renderDialogContent = () => {
    switch (authType) {
      case AUTH_TYPES.APPLE:
        return (
          <Dialog.Description>
            Apple 계정 연결을 해제하고 계정을 삭제하시겠습니까?
            {'\n'}계속하면 Apple 인증 화면으로 이동합니다.
          </Dialog.Description>
        );
      case AUTH_TYPES.KAKAO:
        return (
          <Dialog.Description>
            카카오 계정 연결을 해제하고 계정을 삭제하시겠습니까?
          </Dialog.Description>
        );
      case AUTH_TYPES.EMAIL:
        return (
          <Dialog.Description>
            이메일 계정을 삭제하시겠습니까?
          </Dialog.Description>
        );
    }
  };

  const renderSettingItem = item => (
    <SettingItem key={item.name} onPress={() => handlePress(item.name)}>
      {item.icon}
      <SettingText fontSizeMode={fontSizeMode}>{item.label}</SettingText>
      {item.name === 'AppVersion' && (
        <VersionText fontSizeMode={fontSizeMode}>v{appVersion}</VersionText>
      )}
    </SettingItem>
  );

  return (
    <Container>
      <SettingCategory lastItem={false}>
        {[
          {
            name: 'Profile',
            label: '프로필 설정',
            icon: (
              <SettingsIcons.profileSettings
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
          {
            name: 'Notification',
            label: '알림 설정',
            icon: (
              <SettingsIcons.notifications
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
          {
            name: 'FontSize',
            label: '글자 크기 설정',
            icon: (
              <SettingsIcons.textSize
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
          {
            name: 'Favorites',
            label: '관심 목록',
            icon: (
              <SettingsIcons.favorites
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
        ].map(item => renderSettingItem(item))}
      </SettingCategory>

      <SettingCategory lastItem={false}>
        {[
          {
            name: 'Announcements',
            label: '공지사항',
            icon: (
              <SettingsIcons.announcement
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
          {
            name: 'Feedback',
            label: '의견 남기기',
            icon: (
              <SettingsIcons.feedback
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
          {
            name: 'FAQ',
            label: '자주 하는 질문',
            icon: (
              <SettingsIcons.faq
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
          {
            name: 'AppVersion',
            label: '앱 버전',
            icon: (
              <SettingsIcons.appVersion
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
        ].map(item => renderSettingItem(item))}
      </SettingCategory>

      <SettingCategory lastItem={true}>
        {[
          {
            name: 'Logout',
            label: '로그아웃',
            icon: (
              <SettingsIcons.logout
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
          {
            name: 'DeleteAccount',
            label: '계정 삭제',
            icon: (
              <SettingsIcons.trashcan
                width={20}
                height={20}
                style={{color: themes.light.textColor.Primary30}}
              />
            ),
          },
        ].map(item => renderSettingItem(item))}
      </SettingCategory>

      {/* 계정 삭제 다이얼로그 */}
      <Dialog.Container visible={isDialogVisible}>
        <Dialog.Title>계정 삭제</Dialog.Title>
        {renderDialogContent()}
        {loading && (
          <View style={{alignItems: 'center', marginVertical: 8}}>
            <ActivityIndicator
              size="small"
              color={themes.light.textColor.Primary30}
            />
          </View>
        )}
        <Dialog.Button label="취소" onPress={() => setDialogVisible(false)} />
        <Dialog.Button
          label="삭제"
          onPress={performAccountDelete}
          disabled={loading}
        />
      </Dialog.Container>
    </Container>
  );
};

const Container = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const SettingCategory = styled.View`
  margin-bottom: 10px;
  border-bottom-width: ${({lastItem}) => (lastItem ? 0 : 10)};
  border-color: ${themes.light.borderColor.borderSecondary};
`;

const SettingItem = styled.TouchableOpacity`
  flex-direction: row;
  padding: 16px 25px;
  align-items: center;
`;

const SettingText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.textPrimary};
  margin-left: 20px;
  flex: 1;
`;

const VersionText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
  margin-left: auto;
`;

export default SettingList;
