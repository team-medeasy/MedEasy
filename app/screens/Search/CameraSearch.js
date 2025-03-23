import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
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
const TOGGLE_WIDTH = 120;
const TOGGLE_HEIGHT = 40;
const TOGGLE_PADDING = 4;
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CameraSearchScreen = () => {
  const [lastPhoto, setLastPhoto] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const focusAreaHeight = useRef(new Animated.Value(PREVIEW_SIZE)).current;
  const maskRectHeight = useRef(new Animated.Value(PREVIEW_SIZE)).current; // Re-introduced
  const [isPrescriptionMode, setIsPrescriptionMode] = useState(false);
  const previewSize = useRef(new Animated.Value(PREVIEW_SIZE)).current;

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

  // Toggle에서 상태 변경 시 애니메이션 설정
  const handleToggle = index => {
    setActiveIndex(index);
    setIsPrescriptionMode(index === 1);

    const targetHeight = index === 1 ? (PREVIEW_SIZE * 4) / 3 : PREVIEW_SIZE;

    // FocusArea 높이 애니메이션 적용
    Animated.spring(focusAreaHeight, {
      toValue: targetHeight,
      useNativeDriver: false,
    }).start();

    // 마스크 Rect 높이 애니메이션 적용
    Animated.spring(maskRectHeight, {
      toValue: targetHeight,
      useNativeDriver: false,
    }).start();

    // 토글 애니메이션 적용
    Animated.spring(translateX, {
      toValue: index * (TOGGLE_WIDTH + TOGGLE_PADDING),
      useNativeDriver: true,
    }).start();
  };

  if (!device) {
    console.log('Device is null, rendering loading...');
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#007AFF" />
      </LoadingContainer>
    );
  }

  const animatedMaskRectY = Animated.divide(
    Animated.subtract(height, maskRectHeight),
    2,
  );

  return (
    <CameraContainer>
      <Header>
        <HeaderItem>
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
        </HeaderItem>
        <HeaderItem>
          <Toggle>
            <Animated.View
              style={{
                position: 'absolute',
                left: TOGGLE_PADDING,
                top: TOGGLE_PADDING + 1,
                width: TOGGLE_WIDTH - TOGGLE_PADDING,
                height: TOGGLE_HEIGHT - TOGGLE_PADDING * 2,
                backgroundColor: 'white',
                borderRadius: TOGGLE_HEIGHT / 2,
                transform: [{translateX}],
              }}
            />
            <TouchableOpacity onPress={() => handleToggle(0)}>
              <ToggleButton isActive={activeIndex === 0}>
                <ToggleText isActive={activeIndex === 0}>알약 촬영</ToggleText>
              </ToggleButton>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleToggle(1)}>
              <ToggleButton isActive={activeIndex === 1}>
                <ToggleText isActive={activeIndex === 1}>
                  처방전 촬영
                </ToggleText>
              </ToggleButton>
            </TouchableOpacity>
          </Toggle>
        </HeaderItem>
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
            <AnimatedRect
              x={Animated.divide(Animated.subtract(width, previewSize), 2)}
              y={Animated.divide(Animated.subtract(height, maskRectHeight), 2)}
              width={previewSize}
              height={maskRectHeight}
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
      <Animated.View
        style={{
          position: 'absolute',
          top: Animated.divide(Animated.subtract(height, focusAreaHeight), 2),
          left: (width - PREVIEW_SIZE) / 2,
          width: PREVIEW_SIZE,
          height: focusAreaHeight,
          borderRadius: BORDER_RADIUS,
          borderWidth: 3,
          borderColor: 'rgba(255, 255, 255, 0.4)',
          backgroundColor: 'transparent',
        }}
      />

      <BottomContainer>
        {/* Hint 애니메이션 적용 */}
        {!isPrescriptionMode && (
          <Animated.View
            style={{
              opacity: isPrescriptionMode ? 0 : 1,
              height: isPrescriptionMode ? 0 : 'auto',
            }}>
            <Hint>
              <HintItem>
                <CameraIcons.tip
                  width={20}
                  height={20}
                  style={{color: themes.light.textColor.buttonText}}
                />
              </HintItem>
              <HintItem>
                <HintTitle>인식률을 높이려면?</HintTitle>
                <HintText>
                  문자가 적힌 면이 위로 가도록 밝은 곳에서 촬영해주세요.
                </HintText>
              </HintItem>
            </Hint>
          </Animated.View>
        )}

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
      </BottomContainer>
    </CameraContainer>
  );
};

const Header = styled.View`
  position: absolute;
  top: 60px;
  width: 100%;
  padding: 10px 20px;
  z-index: 10;
`;

const HeaderItem = styled.View`
  flex-direction: row;
  justify-content: center;
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

const Toggle = styled.View`
  margin-top: 32px;
  flex-direction: row;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 40px;
  padding: 4px;
`;

const ToggleButton = styled.View`
  width: 120px;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
  border-radius: 40px;
`;

const ToggleText = styled.Text`
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.body.default};
  color: ${({isActive}) => (isActive ? 'black' : 'rgba(255, 255, 255, 0.7)')};
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

const BottomContainer = styled.View`
  position: absolute;
  bottom: 50px;
  width: 100%;
  gap: 32px;
  align-items: center;
`;

const ButtonContainer = styled.View`
  width: 100%;
  padding: 0 32px;
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

const Hint = styled.View`
  flex-direction: row;
  gap: 20px;
  align-items: center;
`;

const HintItem = styled.View`
  gap: 8px;
`;

const HintTitle = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.body.default};
  color: white;
`;

const HintText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.caption.default};
  color: white;
`;

export default CameraSearchScreen;
