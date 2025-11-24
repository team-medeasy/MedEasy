import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { Platform, AppState, Animated, Easing, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation, CommonActions } from '@react-navigation/native';

import Home from '../screens/Navigation/Home';
import Routine from '../screens/Navigation/Routine';
import MyPage from '../screens/Navigation/MyPage';
import CameraSearchScreen from '../screens/Search/CameraSearch.js';
import CameraSearchResultsScreen from '../screens/Search/CameraSearchResults.js';
import PhotoPreviewScreen from '../screens/Search/PhotoPreview.js';
import Chat from '../screens/Chat/Chat.js';
import VoiceChat from '../screens/Chat/VoiceChat.js';
import { pointColor, themes } from './../styles';
import { TabIcons, CameraIcons, OtherIcons } from './../../assets/icons';
import FontSizes from '../../assets/fonts/fontSizes';
import useRoutineUrl from '../hooks/useRoutineUrl';
import RoutineCheckModal from './RoutineCheckModal';
import { useFontSize } from '../../assets/fonts/FontSizeContext.js';

// 토큰 관리 및 사용자 정보 갱신을 위한 import 추가
import { validateAndRefreshToken } from '../api/services/tokenService';
import { getUser } from '../api/user';
import { setUserInfo } from '../api/storage';

// 카메라 버튼
const CameraButton = ({ onPress }) => {
  return (
    <StyledCameraButton onPress={onPress}>
      <CameraIcons.camera width={25} height={25} color="#ffffff" />
    </StyledCameraButton>
  );
};

// 약 검색 탭을 위한 빈 컴포넌트
const EmptyScreen = () => <></>;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const navigation = useNavigation();
  const { fontSizeMode } = useFontSize();

  const handleCameraPress = useCallback(async () => {
    console.log('Camera button pressed');
    navigation.navigate('Camera');
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('SearchMedicine');
  }, [navigation]);

  const handleChatPress = useCallback(() => {
    console.log('[NavigationBar] VoiceChat 화면으로 이동');

    // 단순 navigate 대신, 완전히 새로운 네비게이션 스택으로 시작
    navigation.navigate('VoiceChat', {
      timestamp: Date.now() // 항상 새 파라미터로 화면 갱신
    });
  }, [navigation]);

  // useNfcListener 대신 useRoutineUrlHandler 사용
  const { routineData, isModalVisible, closeModal } = useRoutineUrl();

  // 토큰 검증 및 사용자 정보 갱신 함수
  const refreshUserInfo = useCallback(async () => {
    try {
      console.log('[NavigationBar] 토큰 검증 및 사용자 정보 갱신 시작');

      // 토큰 유효성 확인 및 필요시 갱신
      const isTokenValid = await validateAndRefreshToken();

      if (isTokenValid) {
        // 사용자 정보 새로 가져오기
        const userResponse = await getUser();
        console.log('[NavigationBar] 사용자 정보 갱신:', userResponse.data);

        const userData = userResponse.data?.body || {};

        // 사용자 정보 저장
        await setUserInfo({
          name: userData.name || '',
          gender: userData.gender || '',
          birthday: userData.birthday || '',
        });

        console.log('[NavigationBar] 사용자 정보 갱신 완료');
      } else {
        console.warn('[NavigationBar] 토큰이 유효하지 않아 사용자 정보를 갱신하지 못했습니다');
      }
    } catch (error) {
      console.error('[NavigationBar] 사용자 정보 갱신 실패:', error);
    }
  }, [navigation]);

  // 앱 마운트 시 및 포그라운드로 전환 시 사용자 정보 갱신
  useEffect(() => {
    // 컴포넌트 마운트 시 즉시 사용자 정보 갱신
    refreshUserInfo();

    // 앱 상태 변경 리스너 설정 (백그라운드 → 포그라운드)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('[NavigationBar] 앱이 활성화됨 - 사용자 정보 갱신 시도');
        refreshUserInfo();
      }
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      subscription.remove();
    };
  }, [refreshUserInfo]);

  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bubbleOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(bubbleOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <MainContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            paddingTop: 3,
            backgroundColor: themes.light.bgColor.bgPrimary,
            elevation: 0,
          },
          tabBarActiveTintColor: themes.light.pointColor.Primary,
          tabBarInactiveTintColor: themes.light.textColor.Primary20,
          tabBarLabelStyle: {
            fontSize: FontSizes.caption[fontSizeMode],
            fontFamily: 'Pretendard-SemiBold',
          },
        }}>
        <Tab.Screen
          name="홈"
          component={Home}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <TabIcons.home width={30} height={30} style={{ color: color }} />
            ),
            tabBarItemStyle: {
              paddingLeft: 20,
            },
          }}
        />
        <Tab.Screen
          name="약 검색"
          component={EmptyScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <TabIcons.search width={30} height={30} style={{ color: color }} />
            ),
            tabBarItemStyle: {
              paddingRight: 30,
            },
          }}
          listeners={{
            tabPress: e => {
              e.preventDefault(); // 기본 탭 동작 방지
              handleSearchPress();
            },
          }}
        />
        <Tab.Screen
          name="루틴"
          component={Routine}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <TabIcons.routine width={30} height={30} style={{ color: color }} />
            ),
            tabBarItemStyle: {
              paddingLeft: 30,
            },
          }}
          listeners={({ navigation }) => ({
            tabPress: e => {
              // 기본 탭 동작 방지
              e.preventDefault();
              // 루틴 화면으로 이동할 때 파라미터 초기화
              navigation.navigate('루틴', {
                selectedDate: null,
              });
            },
          })}
        />
        <Tab.Screen
          name="내 정보"
          component={MyPage}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <TabIcons.my width={30} height={30} style={{ color: color }} />
            ),
            tabBarItemStyle: {
              paddingRight: 20,
            },
          }}
        />
      </Tab.Navigator>
      <CameraButton onPress={handleCameraPress} />
      <ChatContainer>
        <Animated.View style={[chatBubbleStyles.container, { opacity: bubbleOpacity }]}>
          <ChatBubble>
            <BubbleText>AI 복약 매니저</BubbleText>
          </ChatBubble>
          <OtherIcons.ToolTip style={{ marginLeft: 70 }} />
        </Animated.View>
        <ChatButton onPress={handleChatPress}>
          <OtherIcons.chat
            width={25}
            height={25}
            style={{ color: themes.light.pointColor.Primary }}
          />
        </ChatButton>
      </ChatContainer>

      {/* ModalComponent 대신 RoutineCheckModal 사용 */}
      <RoutineCheckModal
        visible={isModalVisible}
        onClose={closeModal}
        routineData={routineData}
      />
    </MainContainer>
  );
};

// 홈화면을 첫 화면으로 유지하면서 스크린 순서만 조정
const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="TabNavigator">
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VoiceChat"
        component={VoiceChat}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraSearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PhotoPreview"
        component={PhotoPreviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CameraSearchResults"
        component={CameraSearchResultsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const NavigationBar = () => {
  return <RootNavigator />;
};

// 스타일 컴포넌트 정의는 그대로 유지
const MainContainer = styled.View`
  flex: 1;
  ${Platform.OS === 'android' && `
    padding-bottom: 15px;
    background-color: ${themes.light.bgColor.bgPrimary};
  `}
`;

const StyledCameraButton = styled.TouchableOpacity`
  position: absolute;
  ${Platform.OS === 'ios' &&
  `
      bottom: 50px;
    `}
  ${Platform.OS === 'android' &&
  `
      bottom: 20px;
    `}
  align-self: center;
  background-color: ${pointColor.pointPrimary};
  width: 55px;
  height: 55px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
`;

const ChatContainer = styled.View``;

const ChatBubble = styled.View`
  background-color: ${themes.light.boxColor.buttonPrimary};
  border-radius: 8px;
  padding: 8px;
  justify-content: center;
  align-items: center;
`;

const BubbleText = styled.Text`
  color: ${themes.light.textColor.buttonText};
  font-family: 'KimjungchulGothic-Bold';
  font-size: ${FontSizes.caption.large};
`;

const ChatButton = styled.TouchableOpacity`
  position: absolute;
  right: 20px;
  ${Platform.OS === 'ios' &&
  `
      bottom: 100px;
    `}
  ${Platform.OS === 'android' &&
  `
      bottom: 70px;
    `}
  background-color: ${themes.light.bgColor.bgPrimary};
  width: 50px;
  height: 50px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  /* Android 그림자 */
  elevation: 5;

  /* iOS 그림자 */
  shadow-color: #000;
  shadow-offset: 2px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
`;

const chatBubbleStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
    bottom: Platform.OS === 'ios' ? 160 : 140,
  },
});

export default NavigationBar;