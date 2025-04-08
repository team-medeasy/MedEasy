import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {FlatList} from 'react-native';
import {themes} from '../styles';
import {Header} from '../components/Header/Header';
import {RoutineIcons} from './../../assets/icons';
import FontSizes from '../../assets/fonts/fontSizes';
import { getNotificationList } from '../api/notification';
const {medicine: MediIcon, hospital: HospitalIcon} = RoutineIcons;

// 날짜 형식 변환 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // 오늘 날짜인 경우 시간만 표시
  if (date.toDateString() === now.toDateString()) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // 어제 날짜인 경우
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '어제';
  }
  
  // 그 외의 경우 날짜 표시
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const Notification = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationList({ page: 0, size: 20 });
      const notiData = res.data.body;
      console.log('알림 목록: ', notiData);
      
      const formattedNotifications = notiData.map(item => ({
        id: item.notification_id,
        title: item.title,
        message: item.content,
        time: formatDate(item.sent_at),
        type: 'medicine', // 모든 알림을 medicine 타입으로 설정
      }));
      
      setNotifications(formattedNotifications);
    } catch (err) {
      console.error('알림 목록 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchNotifications(); // 컴포넌트 mount 시 실행
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // 새로고침 로직 - API 호출로 대체
    fetchNotifications().finally(() => {
      setRefreshing(false);
    });
  }, []);

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
        refreshing={refreshing}
        onRefresh={onRefresh}
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

const NotiTextContainer = styled.View`
  overflow: hidden;
`;

const NotificationTitle = styled.Text`
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  margin-bottom: 10px;
`;

const NotificationMessage = styled.Text`
  width: 80%;
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
`;

const NotiTime = styled.Text`
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.Primary30};
  font-family: 'Pretendard-SemiBold';
`;

export default Notification;