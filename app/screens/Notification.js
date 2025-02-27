import React from 'react';
import styled from 'styled-components/native';
import {FlatList} from 'react-native';
import {themes} from '../styles';
import {Header} from '../components';

const Notification = () => {
  const notifications = [
    {id: 1, title: '복용 알림', message: '오후 8시에 약을 복용하세요.'},
    {
      id: 2,
      title: '진료 알림',
      message: '내일 오전 10시에 병원 진료가 있습니다.',
    },
    {
      id: 3,
      title: '새로운 메시지',
      message: 'AI 챗봇 메디씨로부터 새로운 메시지가 도착했습니다.',
    },
  ];

  const renderItem = ({item}) => (
    <NotificationItem>
      <NotificationTitle>{item.title}</NotificationTitle>
      <NotificationMessage>{item.message}</NotificationMessage>
    </NotificationItem>
  );

  return (
    <Container>
      <Header>알림</Header>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{padding: 16}}
      />
    </Container>
  );
};
const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const NotificationItem = styled.View`
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.primary};
`;

const NotificationTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${themes.light.textColor.textPrimary};
  margin-bottom: 8px;
`;

const NotificationMessage = styled.Text`
  font-size: 16px;
  color: ${themes.light.textColor.textSecondary};
`;

export default Notification;
