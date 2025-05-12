import React, { useState } from 'react';
import { Alert, Linking, View } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import Dialog from 'react-native-dialog';
import { SettingsIcons } from './../../assets/icons';
import { themes } from './../styles';
import { deleteUser } from '../api/user';
import FontSizes from '../../assets/fonts/fontSizes';
import { useFontSize } from '../../assets/fonts/FontSizeContext';
import { 
  removeAccessToken,
  removeRefreshToken, 
  removeUserInfo,
  clearAuthData } from '../api/storage';

import { useSignUp } from '../api/context/SignUpContext';

const SettingList = () => {
  const navigation = useNavigation();
  const {fontSizeMode} = useFontSize();
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [password, setPassword] = useState('');
  const appVersion = "1.0.0"; // 앱 버전 정보

  const { resetSignUpData } = useSignUp();

  // 의견 남기기 기능
  const handleFeedback = async () => {
    const email = 'team.medeasy@gmail.com';
    const subject = '메디지 앱 의견';
    const body = '안녕하세요, 메디지 앱에 대한 의견을 남깁니다:\n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // 먼저 경고창을 통해 사용자에게 확인
    Alert.alert(
      '📨 외부 메일 앱으로 이동해요',
      '여러분의 소중한 의견이 사용성 개선에 큰 힘이 됩니다.',
      [
        { text: '취소', style: 'cancel' },
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
          }
        }
      ],
      { cancelable: true }
    );
  };

  const handlePress = name => {
    switch (name) {
      case 'Profile':
      case 'Notification':
      case 'FontSize':
      case 'Favorites':
      case 'Announcements':
      case 'FAQ':
        navigation.navigate('SettingStack', { screen: name });
        break;
      case 'Feedback':
        handleFeedback();
        break;
      case 'AppVersion':
        // 기능 없음
        break;
      case 'DeleteAccount':
        // 회원 탈퇴 다이얼로그 표시
        setDialogVisible(true);
        break;
      case 'Logout':
        Alert.alert(
          '로그아웃',
          '정말 로그아웃하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '확인', 
              onPress: async () => {
                try {
                  console.log('로그아웃 시작');

                  // AsyncStorage 데이터 삭제
                  await removeAccessToken();
                  await removeRefreshToken();
                  await removeUserInfo();
                  await clearAuthData();
                  
                  // // SignUpContext 데이터 초기화
                  resetSignUpData();
                  console.log('SignUpContext 데이터 초기화 완료');
                  
                  // 스택을 모두 비우고 새로운 화면으로 이동 (뒤로가기 방지)
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                  });
                } catch (error) {
                  console.error('로그아웃 중 오류 발생:', error);
                  Alert.alert('오류', '로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.');
                }
              }},
          ],
          { cancelable: false }
        );
        break;
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
            
            // AsyncStorage 데이터 삭제
            await removeAccessToken();
            await removeRefreshToken();
            await removeUserInfo();
            await clearAuthData();
            
            // // SignUpContext 데이터 초기화
            resetSignUpData();
            console.log('SignUpContext 데이터 초기화 완료');
            // 로그인 화면으로 이동
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

  const renderSettingItem = (item) => (
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
          { name: 'Profile', label: '프로필 설정', icon: <SettingsIcons.profileSettings width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
          { name: 'Notification', label: '알림 설정', icon: <SettingsIcons.notifications width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
          { name: 'FontSize', label: '글자 크기 설정', icon: <SettingsIcons.textSize width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
          { name: 'Favorites', label: '관심 목록', icon: <SettingsIcons.favorites width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
        ].map(item => renderSettingItem(item))}
      </SettingCategory>

      <SettingCategory lastItem={false}>
        {[
          { name: 'Announcements', label: '공지사항', icon: <SettingsIcons.announcement width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
          { name: 'Feedback', label: '의견 남기기', icon: <SettingsIcons.feedback width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
          { name: 'FAQ', label: '자주 하는 질문', icon: <SettingsIcons.faq width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
          { name: 'AppVersion', label: '앱 버전', icon: <SettingsIcons.appVersion width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
        ].map(item => renderSettingItem(item))}
      </SettingCategory>

      <SettingCategory lastItem={true}>
        {[
          { name: 'Logout', label: '로그아웃', icon: <SettingsIcons.logout width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
          { name: 'DeleteAccount', label: '계정 삭제', icon: <SettingsIcons.trashcan width={20} height={20} style={{ color: themes.light.textColor.Primary30 }} /> },
        ].map(item => renderSettingItem(item))}
      </SettingCategory>

      {/* 비밀번호 입력 다이얼로그 */}
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
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const SettingCategory = styled.View`
  margin-bottom: 10px;
  border-bottom-width: ${({ lastItem }) => (lastItem ? 0 : 10)}px;
  border-color: ${themes.light.borderColor.borderSecondary};
`;

const SettingItem = styled.TouchableOpacity`
  flex-direction: row;
  padding: 16px 25px;
  align-items: center;
`;

const SettingText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.textPrimary};
  margin-left: 20px;
  flex: 1;
`;

const VersionText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
  margin-left: auto;
`;

export default SettingList;