import React, { useState, useCallback } from 'react';
import styled from 'styled-components/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Camera } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import {pointColor} from './../styles';

import Home from '../screens/Navigation/Home';
import Search from '../screens/Navigation/Search';
import Routine from '../screens/Navigation/Routine';
import MyPage from '../screens/Navigation/MyPage';

import HomeIcon from '../../assets/icons/nav/home.svg';
import SearchIcon from '../../assets/icons/nav/search.svg';
import RoutineIcon from '../../assets/icons/nav/routine.svg';
import MyIcon from '../../assets/icons/nav/my.svg';

// 카메라 버튼
const CameraButton = ({ onPress }) => {
  return (
    <StyledCameraButton onPress={onPress}>
      <MaterialCommunityIcons name="camera" size={25} color="#fff" />
    </StyledCameraButton>
  );
};

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
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
        screenOptions={{
          tabBarStyle: {
            paddingBottom: 15,
            paddingTop: 10,
          },
          tabBarActiveTintColor: pointColor.pointPrimary,
        }}>
        <Tab.Screen
          name="홈"
          component={Home}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <HomeIcon width={30} height={30} fill={color} />
            ),
          }}
        />
        <Tab.Screen
          name="약 검색"
          component={Search}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <SearchIcon width={30} height={30} fill={color} />
            ),
            tabBarItemStyle: {
              marginLeft: -30,
            },
          }}
        />
        <Tab.Screen
          name="루틴"
          component={Routine}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <RoutineIcon width={30} height={30} fill={color} />
            ),
            tabBarItemStyle: {
              marginRight: -30,
            },
          }}
        />
        <Tab.Screen
          name="내 정보"
          component={MyPage}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MyIcon width={30} height={30} fill={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <CameraButton onPress={handleCameraPress} />
    </MainContainer>
  );
};

const NavigationBar = () => {
  return <TabNavigator />;
};

const MainContainer = styled.View`
  flex: 1;
`;

const StyledCameraButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 50px;
  align-self: center;
  background-color: ${pointColor.pointPrimary};
  width: 55px;
  height: 55px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
`;

export default NavigationBar;
