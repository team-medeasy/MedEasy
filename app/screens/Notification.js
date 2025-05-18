import React, {useCallback, useEffect, useState, useRef} from 'react';
import {resetNavigate} from './Navigation/NavigationRef';
import styled from 'styled-components/native';
import {
  FlatList,
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {themes} from '../styles';
import {Header} from '../components/Header/Header';
import {RoutineIcons, Images} from './../../assets/icons';
import FontSizes from '../../assets/fonts/fontSizes';
import {useFontSize} from '../../assets/fonts/FontSizeContext';
import {
  getNotificationList,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notification';
import EmptyState from '../components/EmptyState';
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

const Notification = ({route, navigation}) => {
  const {fontSizeMode} = useFontSize();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const PAGE_SIZE = 10;
  const isMounted = useRef(true); // 컴포넌트 마운트 상태 추적

  // 화면에서 벗어날 때 콜백 호출을 위한 로직
  useEffect(() => {
    // 컴포넌트가 마운트되었음을 표시
    isMounted.current = true;

    // 화면이 언마운트될 때 onGoBack 콜백 실행 및 마운트 상태 변경
    return () => {
      isMounted.current = false;
      if (route.params?.onGoBack) {
        console.log('알림 화면 종료: onGoBack 콜백 실행');
        route.params.onGoBack();
      }
    };
  }, [route.params]);

  const fetchNotifications = async (page = 0, refresh = false) => {
    if (loading) return;

    try {
      setLoading(true);
      const res = await getNotificationList({page: page, size: PAGE_SIZE});

      // 컴포넌트가 언마운트되었으면 상태 업데이트하지 않음
      if (!isMounted.current) return;

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
      // 컴포넌트가 마운트된 상태일 때만 로딩 상태 업데이트
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // 컴포넌트 마운트 시 첫 페이지 실행
  useEffect(() => {
    fetchNotifications(0, true);
  }, []);

  // 화면에서 포커스가 사라질 때 모든 알림 읽음 처리
  useFocusEffect(
    useCallback(() => {
      return () => {
        // 화면을 떠날 때 모든 알림 읽음 처리
        handleMarkAllAsRead();
      };
    }, []),
  );

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      console.log('모든 알림이 읽음 처리되었습니다.');

      // 컴포넌트가 마운트된 상태일 때만 UI 업데이트
      if (isMounted.current) {
        // 현재 알림 목록을 읽음 상태로 UI 업데이트
        setNotifications(prev =>
          prev.map(notification => ({
            ...notification,
            is_read: true,
          })),
        );
      }
    } catch (error) {
      console.error('전체 알림 읽음 처리 실패:', error);
    }
  };

  const onRefresh = useCallback(() => {
    if (loading) return;

    setRefreshing(true);
    setCurrentPage(0);
    setHasMoreData(true);

    // 새로고침 시 전체 알림 읽음 처리 추가
    handleMarkAllAsRead().then(() => {
      // 새로고침 로직 - 첫 페이지부터 다시 로드
      fetchNotifications(0, true).finally(() => {
        // 컴포넌트가 마운트된 상태일 때만 UI 업데이트
        if (isMounted.current) {
          setRefreshing(false);
        }
      });
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
            <NotificationTitle fontSizeMode={fontSizeMode}>
              {item.title}
            </NotificationTitle>
            <NotificationMessage fontSizeMode={fontSizeMode}>
              {item.content}
            </NotificationMessage>
          </NotiTextContainer>
        </NotiContainer>
        <NotiTime fontSizeMode={fontSizeMode}>{item.formatted_time}</NotiTime>
      </NotificationItem>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;

    // ActivityIndicator 관련 Android 문제 해결을 위한 플랫폼별 스타일
    const indicatorStyle =
      Platform.OS === 'android' ? {height: 36, width: 36} : {};

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 0,
          alignItems: 'center',
        }}>
        <ActivityIndicator
          style={indicatorStyle}
          size="small"
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
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
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
  padding: 16px 20px;
  background-color: ${props =>
    props.isRead === false
      ? `${themes.light.pointColor.Primary10}`
      : `${themes.light.bgColor.bgPrimary}`};
`;

const NotiContainer = styled.View`
  flex-direction: row;
  flex: 1;
`;

const NotiTextContainer = styled.View`
  flex: 1;
  flex-shrink: 1;
`;

const NotificationMessage = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode]};
  color: ${themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
  line-height: 16px;
`;

const NotificationTitle = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  margin-bottom: 8px;
`;

const NotiTime = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode]};
  color: ${themes.light.textColor.Primary30};
  font-family: 'Pretendard-SemiBold';
`;

export default Notification;
