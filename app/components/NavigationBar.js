import React, { useState, useCallback } from 'react';
import styled from 'styled-components/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';

import Home from '../screens/Navigation/Home';
import Search from '../screens/Navigation/Search';
import Routine from '../screens/Navigation/Routine';
import MyPage from '../screens/Navigation/MyPage';

// 카메라 스크린 컴포넌트
const CameraScreen = () => {
  const devices = useCameraDevices();
  const device = devices.back;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const camera = React.useRef(null);

  const handleCapture = async () => {
    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
      });
      console.log('Photo taken:', photo.path);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to take photo:', error);
    }
  };

  if (!device) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#007AFF" />
      </LoadingContainer>
    );
  }

  return (
    <CameraContainer>
      <Camera
        ref={camera}
        style={{ flex: 1 }}
        device={device}
        isActive={isFocused}
        photo={true}
      />
      <CameraOverlay>
        <CloseButton onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="close" size={30} color="#fff" />
        </CloseButton>
        <CaptureButton onPress={handleCapture}>
          <CaptureButtonInner />
        </CaptureButton>
      </CameraOverlay>
    </CameraContainer>
  );
};

const CameraButton = ({ onPress }) => {
  return (
    <StyledCameraButton onPress={onPress}>
      <MaterialCommunityIcons name="camera" size={25} color="#fff" />
    </StyledCameraButton>
  );
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
              <MaterialCommunityIcons name="pill" color={color} size={size} />
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
      <CameraButton onPress={handleCameraPress} />
    </MainContainer>
  );
};

const NavigationBar = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const MainContainer = styled.View`
  flex: 1;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: black;
`;

const CameraContainer = styled.View`
  flex: 1;
  background-color: black;
`;

const CameraOverlay = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  justify-content: center;
  align-items: center;
`;

const StyledCameraButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 50px;
  align-self: center;
  background-color: #007AFF;
  width: 55px;
  height: 55px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
`;

const CaptureButton = styled.TouchableOpacity`
  width: 70px;
  height: 70px;
  border-radius: 35px;
  border-width: 6px;
  border-color: white;
  background-color: transparent;
  justify-content: center;
  align-items: center;
`;

const CaptureButtonInner = styled.View`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: white;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: -500px;
  right: 20px;
  padding: 10px;
`;

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #fff;
`;

const StyledText = styled.Text`
  font-size: 24px;
  color: #333;
`;

export default NavigationBar;
