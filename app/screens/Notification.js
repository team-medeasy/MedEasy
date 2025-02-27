import React from 'react';
import styled from 'styled-components/native';
import {FlatList} from 'react-native';
import {themes} from '../styles';
import {Header} from '../components';
import {RoutineIcons} from './../../assets/icons';

const {medicine: MediIcon, hospital: HospitalIcon} = RoutineIcons;

const Notification = () => {
  const notifications = [
    {
      id: 1,
      title: '아침 식사 전 복용해야 하는 약이 있어요.',
      message: '파모시드정 20mg(내복), 슬로젠정(내복) 외 2건',
      time: '3분 전',
      type: 'medicine',
    },
    {
      id: 2,
      title: '취침 전 복용해야 하는 약이 있어요.',
      message: '파모시드정 20mg(내복), 슬로젠정(내복) 외 2건',
      time: '6시간 전',
      type: 'medicine',
    },
    {
      id: 3,
      title: '저녁 식사 전 전 복용해야 하는 약이 있어요.',
      message: '파모시드정 20mg(내복), 슬로젠정(내복) 외 2건',
      time: '9시간 전',
      type: 'medicine',
    },
    {
      id: 4,
      title: '오늘은 병원 진료 예약이 있어요.',
      message: '오전 10시 30분 한성대병원 외래진료',
      time: '어제',
      type: 'hospital',
    },
    {
      id: 5,
      title: '아침 식사 전 복용해야 하는 약이 있어요.',
      message: '파모시드정 20mg(내복), 슬로젠정(내복) 외 2건',
      time: '3분 전',
      type: 'medicine',
    },
    {
      id: 6,
      title: '취침 전 복용해야 하는 약이 있어요.',
      message: '파모시드정 20mg(내복), 슬로젠정(내복) 외 2건',
      time: '6시간 전',
      type: 'medicine',
    },
    {
      id: 7,
      title: '저녁 식사 전 전 복용해야 하는 약이 있어요.',
      message: '파모시드정 20mg(내복), 슬로젠정(내복) 외 2건',
      time: '9시간 전',
      type: 'medicine',
    },
    {
      id: 8,
      title: '오늘은 병원 진료 예약이 있어요.',
      message: '오전 10시 30분 한성대병원 외래진료',
      time: '어제',
      type: 'hospital',
    },
    {
      id: 9,
      title: '아침 식사 전 복용해야 하는 약이 있어요.',
      message: '파모시드정 20mg(내복), 슬로젠정(내복) 외 2건',
      time: '3분 전',
      type: 'medicine',
    },
    {
      id: 10,
      title: '취침 전 복용해야 하는 약이 있어요.',
      message: '파모시드정 20mg(내복), 슬로젠정(내복) 외 2건',
      time: '6시간 전',
      type: 'medicine',
    },
    {
      id: 11,
      title: '저녁 식사 전 전 복용해야 하는 약이 있어요.',
      message: '파모시드정 20mg(내복), 슬로젠정(내복) 외 2건',
      time: '9시간 전',
      type: 'medicine',
    },
    {
      id: 12,
      title: '오늘은 병원 진료 예약이 있어요.',
      message: '오전 10시 30분 한성대병원 외래진료',
      time: '어제',
      type: 'hospital',
    },
  ];

  const renderItem = ({item}) => (
    <NotificationItem>
      <NotiContainer>
        {item.type === 'medicine' ? (
          <MediIcon
            width={18}
            height={18}
            marginRight={15}
            style={{color: themes.light.pointColor.Primary}}
          />
        ) : item.type === 'hospital' ? (
          <HospitalIcon
            width={18}
            height={18}
            marginRight={15}
            style={{color: themes.light.pointColor.Secondary}}
          />
        ) : null}
        <NotiTextContainer>
          <NotificationTitle>{item.title}</NotificationTitle>
          <NotificationMessage>{item.message}</NotificationMessage>
        </NotiTextContainer>
      </NotiContainer>
      <NotiTime>{item.time}</NotiTime>
    </NotificationItem>
  );

  return (
    <Container>
      <Header>알림</Header>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{paddingBottom: 100}}
      />
    </Container>
  );
};
const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const NotificationItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
`;

const NotiContainer = styled.View`
  flex-direction: row;
`;

const NotiTextContainer = styled.View``;

const NotificationTitle = styled.Text`
  font-size: 15px;
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  margin-bottom: 10px;
`;

const NotificationMessage = styled.Text`
  font-size: 12px;
  color: ${themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
`;

const NotiTime = styled.Text`
  font-size: 12px;
  color: ${themes.light.textColor.Primary30};
  font-family: 'Pretendard-SemiBold';
`;

export default Notification;
