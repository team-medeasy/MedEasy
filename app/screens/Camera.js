import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import styled from 'styled-components/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Camera = () => {
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

export default Camera;