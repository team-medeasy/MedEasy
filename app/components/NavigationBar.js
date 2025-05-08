import React, {useCallback, useEffect} from 'react';
import styled from 'styled-components/native';
import {Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';

import Home from '../screens/Navigation/Home';
import Routine from '../screens/Navigation/Routine';
import MyPage from '../screens/Navigation/MyPage';
import CameraSearchScreen from '../screens/Search/CameraSearch.js';
import CameraSearchResultsScreen from '../screens/Search/CameraSearchResults.js';
import PhotoPreviewScreen from '../screens/Search/PhotoPreview.js';
import Chat from '../screens/Chat/Chat.js';
import VoiceChat from '../screens/Chat/VoiceChat.js';
import {pointColor, themes} from './../styles';
import {TabIcons, CameraIcons, OtherIcons} from './../../assets/icons';
import FontSizes from '../../assets/fonts/fontSizes';
import useRoutineUrl from '../hooks/useRoutineUrl';
import RoutineCheckModal from './RoutineCheckModal';
import {useFontSize} from '../../assets/fonts/FontSizeContext.js';

// 카메라 버튼
const CameraButton = ({onPress}) => {
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
  const {fontSizeMode} = useFontSize();

  const handleCameraPress = useCallback(async () => {
    console.log('Camera button pressed');
    navigation.navigate('Camera');
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('SearchMedicine');
  }, [navigation]);

  const handleChatPress = useCallback(() => {
    navigation.navigate('VoiceChat');
  }, [navigation]);

  // useNfcListener 대신 useRoutineUrlHandler 사용
  const {routineData, isModalVisible, closeModal} = useRoutineUrl();

  return (
    <MainContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            paddingTop: 3,
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
            tabBarIcon: ({color, size}) => (
              <TabIcons.home width={30} height={30} style={{color: color}} />
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
            tabBarIcon: ({color, size}) => (
              <TabIcons.search width={30} height={30} style={{color: color}} />
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
            tabBarIcon: ({color, size}) => (
              <TabIcons.routine width={30} height={30} style={{color: color}} />
            ),
            tabBarItemStyle: {
              paddingLeft: 30,
            },
          }}
          listeners={({navigation}) => ({
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
            tabBarIcon: ({color, size}) => (
              <TabIcons.my width={30} height={30} style={{color: color}} />
            ),
            tabBarItemStyle: {
              paddingRight: 20,
            },
          }}
        />
      </Tab.Navigator>
      <CameraButton onPress={handleCameraPress} />
      <ChatContainer>
        {/* <ChatBuble>
          <BubbleTail />
          <BubbleText>챗봇 약사에게{'\n'}상담해보세요!</BubbleText>
        </ChatBuble> */}
        <ChatButton onPress={handleChatPress}>
          <OtherIcons.chat
            width={25}
            height={25}
            style={{color: themes.light.pointColor.Primary}}
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

const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Camera"
        component={CameraSearchScreen}
        options={{headerShown: false}}
        // name="Camera"
        // component={CameraSearchResultsScreen}
        // options={{headerShown: false}}
      />
      <Stack.Screen
        name="PhotoPreview"
        component={PhotoPreviewScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CameraSearchResults"
        component={CameraSearchResultsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="VoiceChat"
        component={VoiceChat}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const NavigationBar = () => {
  return <RootNavigator />;
};

const MainContainer = styled.View`
  flex: 1;
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

const ChatBuble = styled.View`
  position: absolute;
  background-color: ${themes.light.boxColor.buttonPrimary};
  width: 110px;
  height: 60px;
  right: 20px;
  ${Platform.OS === 'ios' &&
  `
      bottom: 170px;
    `}
  ${Platform.OS === 'android' &&
  `
      bottom: 140px;
    `}
  border-radius: 15px;
  justify-content: center;
  align-items: center;
`;

const BubbleTail = styled.View`
  position: absolute;
  background-color: ${themes.light.boxColor.buttonPrimary};
  width: 20px;
  height: 20px;
  right: 15px;
  bottom: -6px;
  transform: rotate(45deg);
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

export default NavigationBar;
