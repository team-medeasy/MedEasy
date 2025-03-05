import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import styled from 'styled-components/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CameraSearchScreen = () => {
  const devices = useCameraDevices();
  const device = devices.back;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      if (permission !== 'authorized') {
        console.warn('카메라 권한이 없습니다.');
        navigation.goBack();
      }
    })();
  }, [navigation]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off', // 플래시 설정 가능 ('on' | 'off' | 'auto')
      });
      console.log('Photo taken:', photo.path);
      navigation.goBack();
    } catch (error) {
      console.error('사진 촬영 실패:', error);
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
      {isFocused && (
        <Camera
          ref={cameraRef}
          style={{flex: 1}}
          device={device}
          isActive={true}
          photo={true}
        />
      )}
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
  bottom: 50px;
  left: 0;
  right: 0;
  height: 200px;
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
  top: 40px;
  right: 20px;
  padding: 10px;
`;

export default CameraSearchScreen;
