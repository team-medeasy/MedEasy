import React from 'react';
import {Alert} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {SettingsIcons} from './../../assets/icons';
import {themes} from './../styles';

const SettingList = () => {
  const navigation = useNavigation();

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
            {text: '취소', style: 'cancel'},
            {text: '확인', onPress: () => console.log('로그아웃 수행')},
          ],
          {cancelable: false},
        );
        break;
      case 'DeleteAccount':
        Alert.alert(
          '계정 삭제',
          '정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
          [
            {text: '취소', style: 'cancel'},
            {text: '삭제', onPress: () => console.log('계정 삭제 수행')},
          ],
          {cancelable: false},
        );
        break;
      default:
        break;
    }
  };

  const profileSettings = [
    {
      name: 'Profile',
      icon: (
        <SettingsIcons.profileSettings
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '프로필 설정',
    },
    {
      name: 'Notification',
      icon: (
        <SettingsIcons.notifications
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '알림 설정',
    },
    {
      name: 'FontSize',
      icon: (
        <SettingsIcons.textSize
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '글자 크기 설정',
    },
    {
      name: 'Favorites',
      icon: (
        <SettingsIcons.favorites
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '관심 목록',
    },
  ];

  const generalSettings = [
    {
      name: 'Announcements',
      icon: (
        <SettingsIcons.announcement
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '공지사항',
    },
    {
      name: 'Feedback',
      icon: (
        <SettingsIcons.feedback
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '의견 남기기',
    },
    {
      name: 'FAQ',
      icon: (
        <SettingsIcons.faq
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '자주 하는 질문',
    },
    {
      name: 'AppVersion',
      icon: (
        <SettingsIcons.appVersion
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '앱 버전',
    },
  ];

  const accountSettings = [
    {
      name: 'Logout',
      icon: (
        <SettingsIcons.logout
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '로그아웃',
    },
    {
      name: 'DeleteAccount',
      icon: (
        <SettingsIcons.trashcan
          width={20}
          height={20}
          style={{color: themes.light.textColor.Primary30}}
        />
      ),
      label: '계정 삭제',
    },
  ];

  return (
    <Container>
      {/* 프로필 설정 그룹 */}
      <SettingCategory lastItem={false}>
        {profileSettings.map(item => (
          <SettingItem key={item.name} onPress={() => handlePress(item.name)}>
            {item.icon}
            <SettingText>{item.label}</SettingText>
          </SettingItem>
        ))}
      </SettingCategory>

      {/* 일반 설정 그룹 */}
      <SettingCategory lastItem={false}>
        {generalSettings.map(item => (
          <SettingItem key={item.name} onPress={() => handlePress(item.name)}>
            {item.icon}
            <SettingText>{item.label}</SettingText>
          </SettingItem>
        ))}
      </SettingCategory>

      {/* 계정 설정 그룹 */}
      <SettingCategory lastItem={true}>
        {accountSettings.map(item => (
          <SettingItem key={item.name} onPress={() => handlePress(item.name)}>
            {item.icon}
            <SettingText>{item.label}</SettingText>
          </SettingItem>
        ))}
      </SettingCategory>
    </Container>
  );
};

const Container = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const SettingCategory = styled.View`
  margin-bottom: 10px;
  border-bottom-width: ${({lastItem}) => (lastItem ? 0 : 10)}px;
  border-color: ${themes.light.borderColor.borderSecondary};
`;

const SettingItem = styled.TouchableOpacity`
  flex-direction: row;
  padding: 16px 25px;
  align-items: center;
`;

const SettingText = styled.Text`
  font-size: 16px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.textPrimary};
  margin-left: 20px;
`;

export default SettingList;
