import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'react-native-vision-camera';
import { Home, MyPage } from './Navigation/HomePage';
import { Search } from './Navigation/Search';
import { Routine } from './Navigation/Routine';
import { MyPage } from './Navigation/MyPage';

const Tab = createBottomTabNavigator();

const NavigationBar = () => {
  const navigation = useNavigation();

  const handleCameraPress = useCallback(async () => {
    const permission = await Camera.requestCameraPermission();
    if (permission === 'denied') {
      console.warn('Camera permission denied');
      return;
    }
    navigation.navigate('Camera');
  }, [navigation]);

  return (
    <MainContainer>
      <Tab.Navigator
        initialRouteName="홈"
        screenOptions={{
          tabBarStyle: {
            paddingBottom: 15,
            paddingTop: 10,
          },
        }}>
        <Tab.Screen
          name="홈"
          component={Home}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="약 검색"
          component={Search}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="search" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="루틴"
          component={Routine}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="lightbulb" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="내 정보"
          component={MyPage}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
      <CameraButton onPress={handleCameraPress}>
        <MaterialCommunityIcons name="camera" size={25} color="#fff" />
      </CameraButton>
    </MainContainer>
  );
};

const MainContainer = styled.View`
  flex: 1;
`;

const CameraButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 50px;
  align-self: center;
  background-color: #007AFF;
  width: 55px;
  height: 55px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

export default NavigationBar;