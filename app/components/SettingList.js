import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import Dialog from 'react-native-dialog';
import { SettingsIcons } from './../../assets/icons';
import { themes } from './../styles';
import { deleteUser } from '../api/user';
import FontSizes from '../../assets/fonts/fontSizes';

const SettingList = () => {
  const navigation = useNavigation();
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [password, setPassword] = useState('');

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
        Alert.alert('의견 남기기', '의견을 남길 수 있는 화면이 준비 중입니다.');
        break;
      case 'AppVersion':
        // 기능 없음
        break;
      case 'Logout':
        Alert.alert(
          '로그아웃',
          '정말 로그아웃하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '확인', onPress: () => console.log('로그아웃 수행') },
          ],
          { cancelable: false }
        );
        break;
      case 'DeleteAccount':
        setDialogVisible(true);
        break;
      default:
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
      Alert.alert('완료', '계정이 삭제되었습니다.');
      setDialogVisible(false);
      // 로그아웃 후 초기 화면으로 이동하는 로직 추가 가능
    } catch (error) {
      Alert.alert('오류', error.response?.data?.message || '계정 삭제 실패');
    }
  };

  return (
    <Container>
      <SettingCategory lastItem={false}>
        {[
          { name: 'Profile', label: '프로필 설정', icon: <SettingsIcons.profileSettings width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
          { name: 'Notification', label: '알림 설정', icon: <SettingsIcons.notifications width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
          { name: 'FontSize', label: '글자 크기 설정', icon: <SettingsIcons.textSize width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
          { name: 'Favorites', label: '관심 목록', icon: <SettingsIcons.favorites width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
        ].map(item => (
          <SettingItem key={item.name} onPress={() => handlePress(item.name)}>
            {item.icon}
            <SettingText>{item.label}</SettingText>
          </SettingItem>
        ))}
      </SettingCategory>

      <SettingCategory lastItem={false}>
        {[
          { name: 'Announcements', label: '공지사항', icon: <SettingsIcons.announcement width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
          { name: 'Feedback', label: '의견 남기기', icon: <SettingsIcons.feedback width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
          { name: 'FAQ', label: '자주 하는 질문', icon: <SettingsIcons.faq width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
          { name: 'AppVersion', label: '앱 버전', icon: <SettingsIcons.appVersion width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
        ].map(item => (
          <SettingItem key={item.name} onPress={() => handlePress(item.name)}>
            {item.icon}
            <SettingText>{item.label}</SettingText>
          </SettingItem>
        ))}
      </SettingCategory>

      <SettingCategory lastItem={true}>
        {[
          { name: 'Logout', label: '로그아웃', icon: <SettingsIcons.logout width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
          { name: 'DeleteAccount', label: '계정 삭제', icon: <SettingsIcons.trashcan width={20} height={20} style={{color: themes.light.textColor.Primary30}}/> },
        ].map(item => (
          <SettingItem key={item.name} onPress={() => handlePress(item.name)}>
            {item.icon}
            <SettingText>{item.label}</SettingText>
          </SettingItem>
        ))}
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
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.textPrimary};
  margin-left: 20px;
`;

export default SettingList;
