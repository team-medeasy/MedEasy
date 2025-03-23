import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import styled from 'styled-components/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Rect, Mask} from 'react-native-svg';
import {CameraIcons, HeaderIcons} from '../../../assets/icons';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {launchImageLibrary} from 'react-native-image-picker';

const {width, height} = Dimensions.get('window');
const PREVIEW_SIZE = width - 60; // 양쪽 30px씩 여백을 제외한 너비 = 높이
const BORDER_RADIUS = 24;
const OPACITY = 0.6;
const OVERLAY_COLOR = `rgba(0, 0, 0, ${OPACITY})`;

const CameraSearchScreen = () => {
  const [lastPhoto, setLastPhoto] = useState(null);
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

  const loadLastPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (result && result.assets && result.assets.length > 0) {
        setLastPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to load last photo:', error);
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (result && result.assets && result.assets.length > 0) {
        console.log('Selected Photo:', result.assets[0].uri);
        setLastPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to open gallery:', error);
    }
  };

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
      <Header>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <HeaderButton>
            <HeaderIcons.chevron
              width={20}
              height={20}
              style={{color: themes.light.textColor.buttonText}}
            />
          </HeaderButton>
        </TouchableOpacity>
        <Title>사진으로 검색하기</Title>
        <HeaderButton>
          <CameraIcons.flash
            width={20}
            height={20}
            style={{color: themes.light.textColor.buttonText}}
          />
        </HeaderButton>
      </Header>
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

      {/* 촬영 버튼 */}
      <ButtonContainer>
        <ButtonItem onPress={openGallery}>
          {lastPhoto ? (
            <Image
              source={{uri: lastPhoto}}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 8,
              }}
            />
          ) : (
            <MaterialCommunityIcons name="image" size={24} color="#fff" />
          )}
        </ButtonItem>
        <CaptureButton onPress={handleCapture}>
          <CaptureButtonInner />
        </CaptureButton>
        <ButtonItem>
          <CameraIcons.cameraSwitch
            width={24}
            height={24}
            style={{color: themes.light.textColor.buttonText}}
          />
        </ButtonItem>
      </ButtonContainer>
    </CameraContainer>
  );
};

const Header = styled.View`
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;
  padding: 10px 20px;
  z-index: 10;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderButton = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.1);
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  flex: 1;
  text-align: center;
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.heading.default};
  color: ${themes.light.textColor.buttonText};
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

const ButtonContainer = styled.View`
  padding: 0 32px;
  position: absolute;
  bottom: 50px;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ButtonItem = styled.TouchableOpacity`
  width: 48px;
  height: 48px;
  background-color: transparent;
  justify-content: center;
  align-items: center;
`;

/* 촬영 버튼 */
const CaptureButton = styled.TouchableOpacity`
  width: 70px;
  height: 70px;
  border-radius: 35px;
  border-width: 6px;
  border-color: white;
  background-color: transparent;
  justify-content: center;
  align-items: center;
  align-self: center; /* 중앙 정렬 */
`;

const CaptureButtonInner = styled.View`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: white;
`;

export default CameraSearchScreen;
