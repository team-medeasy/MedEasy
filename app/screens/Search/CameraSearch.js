import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, Dimensions} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import styled from 'styled-components/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Rect, Mask} from 'react-native-svg';

const {width, height} = Dimensions.get('window');
const PREVIEW_SIZE = width - 60; // 양쪽 30px씩 여백을 제외한 너비 = 높이
const BORDER_RADIUS = 24;
const OPACITY = 0.6;
const OVERLAY_COLOR = `rgba(0, 0, 0, ${OPACITY})`;

const CameraSearchScreen = () => {
  const devices = useCameraDevices();
  const device = devices && devices[0];
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);

  useEffect(() => {
    const checkCameraPermission = async () => {
      console.log('Checking camera permission...');
      const cameraPermission = await Camera.getCameraPermissionStatus();
      console.log('Camera permission status:', cameraPermission);
      console.log('isFocused:', isFocused);

      if (cameraPermission === 'authorized' || cameraPermission === 'granted') {
        console.log('카메라 권한이 이미 있습니다. 카메라를 시작합니다.');
      } else {
        console.warn('카메라 권한이 없습니다. 요청 중...');
        const requestPermission = await Camera.requestCameraPermission();
        console.log('Requested Camera Permission:', requestPermission);
        if (requestPermission !== 'authorized') {
          console.warn('카메라 권한 요청 거부됨. 이전 화면으로 이동합니다.');
          navigation.goBack();
        } else {
          console.log('카메라 권한 획득 성공!');
        }
      }
      console.log('Devices:', devices);
      console.log('Device:', device);
    };

    checkCameraPermission();
  }, [navigation, isFocused]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
      });
      console.log('Photo taken:', photo.path);
      navigation.goBack();
    } catch (error) {
      console.error('사진 촬영 실패:', error);
    }
  };

  if (!device) {
    console.log('Device is null, rendering loading...');
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#007AFF" />
      </LoadingContainer>
    );
  }

  return (
    <CameraContainer>
      {/* 카메라 미리보기 */}
      {isFocused && (
        <Camera
          ref={cameraRef}
          style={{flex: 1}}
          device={device}
          isActive={true}
          photo={true}
        />
      )}

      {/* 마스크로 오버레이 처리 */}
      <MaskContainer>
        <Svg height="100%" width="100%">
          <Mask id="mask" x="0" y="0" height="100%" width="100%">
            <Rect x="0" y="0" width="100%" height="100%" fill="white" />
            <Rect
              x={(width - PREVIEW_SIZE) / 2}
              y={(height - PREVIEW_SIZE) / 2}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              rx={BORDER_RADIUS}
              ry={BORDER_RADIUS}
              fill="black"
            />
          </Mask>

          {/* 마스크 적용 */}
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={OVERLAY_COLOR}
            mask="url(#mask)"
          />
        </Svg>
      </MaskContainer>

      {/* 가운데 정사각형 */}
      <FocusArea />

      {/* 닫기 버튼 */}
      <CloseButton onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="close" size={30} color="#fff" />
      </CloseButton>

      {/* 촬영 버튼 */}
      <ButtonContainer>
        <CaptureButton onPress={handleCapture}>
          <CaptureButtonInner />
        </CaptureButton>
      </ButtonContainer>
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

/* 마스크 컨테이너 */
const MaskContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: ${width}px;
  height: ${height}px;
`;

/* 촬영 미리보기 (오퍼시티 X) */
const FocusArea = styled.View`
  position: absolute;
  top: ${(height - PREVIEW_SIZE) / 2}px;
  left: ${(width - PREVIEW_SIZE) / 2}px;
  width: ${PREVIEW_SIZE}px;
  height: ${PREVIEW_SIZE}px;
  border-radius: ${BORDER_RADIUS}px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  background-color: transparent;
`;

/* 닫기 버튼 */
const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 40px;
  right: 20px;
  padding: 10px;
`;

/* 촬영 버튼 부모 컨테이너 */
const ButtonContainer = styled.View`
  position: absolute;
  bottom: 50px;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

/* 촬영 버튼 */
const CaptureButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 50px;
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

export default CameraSearchScreen;
