import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {resetNavigate} from './Navigation/NavigationRef';
import styled from 'styled-components/native';
import {
  FlatList,
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {themes} from '../styles';
import {Header} from '../components/Header/Header';
import {RoutineIcons, Images} from './../../assets/icons';
import FontSizes from '../../assets/fonts/fontSizes';
import {getNotificationList, markNotificationAsRead} from '../api/notification';
import EmptyState from '../components/\bEmptyState';
const {medicine: MediIcon, hospital: HospitalIcon} = RoutineIcons;

// 날짜 형식 변환 함수
const formatDate = dateString => {
  const date = new Date(dateString);
  const now = new Date();

  // 오늘 날짜인 경우 시간만 표시
  if (date.toDateString() === now.toDateString()) {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
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
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const PAGE_SIZE = 10;

  const fetchNotifications = async (page = 0, refresh = false) => {
    if (loading) return;

    try {
      setLoading(true);
      const res = await getNotificationList({page: page, size: PAGE_SIZE});
      const notificationData = res.data.body;
      console.log(`알림 목록 (페이지 ${page}): `, notificationData);

      const formattedNotifications = notificationData.map(item => {
        // sent_at에서 날짜 부분만 추출 (YYYY-MM-DD 형식)
        const routineDate = item.sent_at ? item.sent_at.split('T')[0] : null;

        return {
          notification_id: item.notification_id,
          title: item.title,
          content: item.content,
          sent_at: item.sent_at,
          formatted_time: formatDate(item.sent_at),
          is_read: item.is_read,
          routine_date: routineDate,
          type: 'medicine', // 모두
        };
      });

      if (refresh) {
        setNotifications(formattedNotifications);
      } else {
        setNotifications(prev => [...prev, ...formattedNotifications]);
      }

      // 더 이상 불러올 데이터가 없는 경우
      if (formattedNotifications.length < PAGE_SIZE) {
        setHasMoreData(false);
      }
    } catch (err) {
      console.error('알림 목록 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(0, true); // 컴포넌트 mount 시 첫 페이지 실행
  }, []);

  const onRefresh = useCallback(() => {
    if (loading) return;

    setRefreshing(true);
    setCurrentPage(0);
    setHasMoreData(true);

    // 새로고침 로직 - 첫 페이지부터 다시 로드
    fetchNotifications(0, true).finally(() => {
      setRefreshing(false);
    });
  }, [loading]);

  const loadMoreNotifications = () => {
    if (loading || !hasMoreData) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchNotifications(nextPage);
  };

  const handlePress = async item => {
    try {
      console.log('📖 읽으려는 알림: ', item);
      await markNotificationAsRead(item.notification_id); // ✅ 알림 읽음 처리
      resetNavigate('NavigationBar', {
        screen: 'TabNavigator',
        params: {
          screen: '루틴',
          params: {
            selectedDate: item.routine_date,
          },
        },
      });
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <NotificationItem isRead={item.is_read}>
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
            <NotificationMessage>{item.content}</NotificationMessage>
          </NotiTextContainer>
        </NotiContainer>
        <NotiTime>{item.formatted_time}</NotiTime>
      </NotificationItem>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
        <ActivityIndicator
          size="medium"
          color={themes.light.pointColor.Primary}
        />
        <Text
          style={{
            marginTop: 10,
            fontSize: FontSizes.caption.default,
            color: themes.light.textColor.Primary50,
            fontFamily: 'Pretendard-Medium',
          }}>
          검색 중...
        </Text>
      </View>
    );
  };

  return (
    <Container>
      <Header>알림</Header>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.notification_id.toString()}
        contentContainerStyle={{paddingBottom: 100, flexGrow: 1}}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              image={<Images.emptyNotification style={{marginBottom: 32}} />}
              title="알림이 없습니다."
              description={`복용 중인 약을 검색하고\n루틴을 추가해 보세요.`}
            />
          )
        }
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
  background-color: ${props =>
    props.isRead === false
      ? `${themes.light.pointColor.Primary10}`
      : `${themes.light.bgColor.bgPrimary}`};
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
