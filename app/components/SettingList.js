import React from 'react';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {SettingsIcons} from './../../assets/icons';
import {themes} from './../styles';

const SettingList = () => {
  const navigation = useNavigation();

  const profileSettings = [
    {
      name: 'Profile',
      icon: <SettingsIcons.profileSettings width={20} height={20} />,
      label: '프로필 설정',
    },
    {
      name: 'Notification',
      icon: <SettingsIcons.notifications width={20} height={20} />,
      label: '알림 설정',
    },
    {
      name: 'FontSize',
      icon: <SettingsIcons.textSize width={20} height={20} />,
      label: '글자 크기 설정',
    },
    {
      name: 'Favorites',
      icon: <SettingsIcons.favorites width={20} height={20} />,
      label: '관심 목록',
    },
  ];

  const generalSettings = [
    {
      name: 'Announcements',
      icon: <SettingsIcons.announcement width={20} height={20} />,
      label: '공지사항',
    },
    {
      name: 'Feedback',
      icon: <SettingsIcons.feedback width={20} height={20} />,
      label: '의견 남기기',
    },
    {
      name: 'FAQ',
      icon: <SettingsIcons.faq width={20} height={20} />,
      label: '자주 하는 질문',
    },
    {
      name: 'AppVersion',
      icon: <SettingsIcons.appVersion width={20} height={20} />,
      label: '앱 버전',
    },
  ];

  const accountSettings = [
    {
      name: 'Logout',
      icon: <SettingsIcons.logout width={20} height={20} />,
      label: '로그아웃',
    },
    {
      name: 'DeleteAccount',
      icon: <SettingsIcons.trashcan width={20} height={20} />,
      label: '계정 삭제',
    },
  ];

  return (
    <Container>
      {/* 프로필 설정 그룹 */}
      <SettingCategory lastItem={false}>
        {profileSettings.map((item, index) => (
          <SettingItem
            key={item.name}
            onPress={() => navigation.navigate(item.name)}>
            {item.icon}
            <SettingText>{item.label}</SettingText>
          </SettingItem>
        ))}
      </SettingCategory>

      {/* 일반 설정 그룹 */}
      <SettingCategory lastItem={false}>
        {generalSettings.map((item, index) => (
          <SettingItem
            key={item.name}
            onPress={() => navigation.navigate(item.name)}>
            {item.icon}
            <SettingText>{item.label}</SettingText>
          </SettingItem>
        ))}
      </SettingCategory>

      {/* 계정 설정 그룹 */}
      <SettingCategory lastItem={true}>
        {accountSettings.map((item, index) => (
          <SettingItem
            key={item.name}
            onPress={() => navigation.navigate(item.name)}>
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
  font-family: 'Pretendard-Regular';
  color: ${themes.light.textColor.textPrimary};
  margin-left: 20px;
`;

export default SettingList;
