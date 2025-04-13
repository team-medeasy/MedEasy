import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  Linking,
  Platform,
  View,
  StyleSheet,
  Text,
  InteractionManager,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {cropCenterArea} from '../../api/services/cameraService';
import styled from 'styled-components/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Rect, Mask, Defs} from 'react-native-svg';
import {CameraIcons, HeaderIcons} from '../../../assets/icons';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {launchImageLibrary} from 'react-native-image-picker';

// --- Constants ---
const {width: windowWidth, height: windowHeight} = Dimensions.get('window');
const PREVIEW_SIZE = windowWidth - 60; // 양쪽 30px 여백 제외
const BORDER_RADIUS = 24;
const OVERLAY_OPACITY = 0.6;
const OVERLAY_COLOR = `rgba(0, 0, 0, ${OVERLAY_OPACITY})`;
const TOGGLE_WIDTH = 120;
const TOGGLE_HEIGHT = 40;
const TOGGLE_PADDING = 4;
const FOCUS_INDICATOR_SIZE = 80;

// --- Animated Components ---
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedFocusArea = Animated.View;

const CameraSearchScreen = () => {
  // --- Hooks ---
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {hasPermission, requestPermission} = useCameraPermission();
  
  // --- State ---
  const [activeIndex, setActiveIndex] = useState(0);
  const [cameraPosition, setCameraPosition] = useState('back');
  const [flash, setFlash] = useState('off');
  const [focusPoint, setFocusPoint] = useState(null);
  const [showFocusIndicator, setShowFocusIndicator] = useState(false);
  const [cameraLayout, setCameraLayout] = useState({
    width: windowWidth,
    height: windowHeight,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // --- Refs ---
  const cameraRef = useRef(null);
  const translateX = useRef(new Animated.Value(TOGGLE_PADDING)).current;
  const focusAreaHeight = useRef(new Animated.Value(PREVIEW_SIZE)).current;
  const focusIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const focusIndicatorScale = useRef(new Animated.Value(1.2)).current;
  const isMounted = useRef(true);

  // --- Derived State ---
  const isPrescriptionMode = activeIndex === 1;
  const device = useCameraDevice(cameraPosition);

  // --- Clean up on unmount ---
  useEffect(() => {
    return () => {
      isMounted.current = false;
      
      // Cleanup animation values to avoid memory leaks
      translateX.stopAnimation();
      focusAreaHeight.stopAnimation();
      focusIndicatorOpacity.stopAnimation();
      focusIndicatorScale.stopAnimation();
    };
  }, []);

  // Manage camera active state based on screen focus
  useEffect(() => {
    if (isFocused && hasPermission) {
      // Start camera when screen is focused
      InteractionManager.runAfterInteractions(() => {
        if (isMounted.current) {
          setIsCameraActive(true);
        }
      });
    } else {
      // Stop camera when screen loses focus
      setIsCameraActive(false);
    }
  }, [isFocused, hasPermission]);

  // --- Permission Handling ---
  const checkAndRequestCameraPermission = useCallback(async () => {
    if (hasPermission) return true;
    
    console.log('Requesting camera permission...');
    const granted = await requestPermission();
    
    if (!granted && isMounted.current) {
      Alert.alert(
        '카메라 권한 필요',
        '사진 검색을 위해 카메라 권한이 필요합니다. 설정에서 권한을 활성화해 주세요.',
        [
          {text: '취소', onPress: () => navigation.goBack(), style: 'cancel'},
          {
            text: '설정으로 이동',
            onPress: () => {
              Linking.openSettings();
              navigation.goBack();
            },
          },
        ],
      );
    }
    
    return granted;
  }, [hasPermission, requestPermission, navigation]);

  // --- Effects ---
  // 화면 포커스 시 권한 확인
  useEffect(() => {
    if (isFocused && !hasPermission) {
      // 화면에 포커스가 있고 권한이 없는 경우만 권한 요청 시도
      checkAndRequestCameraPermission();
    }
  }, [isFocused, hasPermission, checkAndRequestCameraPermission]);

  // --- Event Handlers ---
  const handleGoBack = useCallback(() => {
    // Disable camera before navigation
    setIsCameraActive(false);
    
    // Use setTimeout to ensure camera is properly released before navigation
    setTimeout(() => {
      if (isMounted.current) {
        navigation.goBack();
      }
    }, 50);
  }, [navigation]);

  const toggleFlash = useCallback(() => {
    setFlash(prev => (prev === 'off' ? 'on' : 'off'));
  }, []);

  const handleToggle = useCallback((index) => {
    setActiveIndex(index);
    const isPrescription = index === 1;
    const targetHeight = isPrescription ? (PREVIEW_SIZE * 4) / 3 : PREVIEW_SIZE;
    const targetTranslateX = index * TOGGLE_WIDTH + TOGGLE_PADDING;

    Animated.parallel([
      Animated.spring(focusAreaHeight, {
        toValue: targetHeight,
        useNativeDriver: false,
        friction: 8,
        tension: 50,
      }),
      Animated.spring(translateX, {
        toValue: targetTranslateX,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }),
    ]).start();
  }, [focusAreaHeight, translateX]);

  const openGallery = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.9,
      });

      if (!isMounted.current) return;

      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.error('ImagePicker Error: ', result.errorMessage);
        Alert.alert('오류', '갤러리를 여는 데 실패했습니다.');
      } else if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setIsCameraActive(false);
        
        // Use interaction manager to improve transition performance
        InteractionManager.runAfterInteractions(() => {
          if (isMounted.current) {
            navigation.navigate('PhotoPreview', {photoUri: result.assets[0].uri});
          }
        });
      }
    } catch (error) {
      console.error('갤러리 열기 실패:', error);
      if (isMounted.current) {
        Alert.alert('오류', '갤러리를 여는 데 실패했습니다.');
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  }, [navigation, isProcessing]);

  const handleCapture = useCallback(async () => {
    if (isProcessing || !cameraRef.current || !hasPermission || !cameraLayout.width || !cameraLayout.height) {
      if (!hasPermission) {
        // 권한이 없는 상태에서 촬영 버튼 누르면 권한 요청
        const granted = await checkAndRequestCameraPermission();
        if (!granted) return;
      } else if (isProcessing) {
        return; // 이미 처리 중인 경우 중복 촬영 방지
      } else {
        Alert.alert('오류', '사진을 촬영할 준비가 되지 않았습니다.');
      }
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Taking photo...');
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: flash,
        enableAutoStabilization: true,
        skipMetadata: false,
      });
      
      if (!isMounted.current) return;
      
      console.log('Photo taken:', photo.path);

      console.log('Cropping photo...');
      const croppedUri = await cropCenterArea(photo.path, isPrescriptionMode, cameraLayout);
      
      if (!isMounted.current) return;
      
      console.log('Cropped URI:', croppedUri);

      if (croppedUri) {
        // 전환 전 카메라 비활성화
        setIsCameraActive(false);
        
        // 무거운 작업 전에 UI 트랜잭션이 완료되도록 처리
        InteractionManager.runAfterInteractions(() => {
          if (isMounted.current) {
            navigation.navigate('PhotoPreview', {
              photoUri: croppedUri,
              isPrescription: isPrescriptionMode
            });
          }
        });
      } else {
        console.error('Photo cropping failed or returned null URI');
        if (isMounted.current) {
          Alert.alert('오류', '사진 처리 중 문제가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      if (isMounted.current) {
        if (error.message && error.message.includes('permission')) {
          Alert.alert('오류', '카메라 접근 권한 문제로 촬영에 실패했습니다.');
        } else {
          Alert.alert('오류', '사진 촬영 중 오류가 발생했습니다.');
        }
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  }, [hasPermission, isProcessing, cameraLayout, flash, isPrescriptionMode, navigation, checkAndRequestCameraPermission]);

  const animateFocusIndicator = useCallback(() => {
    setShowFocusIndicator(true);
    focusIndicatorOpacity.setValue(1);
    focusIndicatorScale.setValue(1.2);

    Animated.parallel([
      Animated.timing(focusIndicatorScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(focusIndicatorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (isMounted.current) {
        setShowFocusIndicator(false);
      }
    });
  }, [focusIndicatorOpacity, focusIndicatorScale]);

  const handleCameraScreenTouch = useCallback(async (event) => {
    if (!cameraRef.current || !isFocused || !device?.supportsFocus) {
      console.log('Focus not supported or camera not ready.');
      return;
    }

    try {
      const {locationX, locationY} = event.nativeEvent;
      const point = {
        x: Math.round(locationX),
        y: Math.round(locationY),
      };

      console.log('Focus tapped at:', point);
      setFocusPoint(point);
      animateFocusIndicator();

      await cameraRef.current.focus(point);
      console.log('Focus successful');

    } catch (error) {
      console.error('Failed to focus:', error);
    }
  }, [isFocused, device?.supportsFocus, animateFocusIndicator]);

  const onCameraLayout = useCallback((event) => {
    const {width: layoutWidth, height: layoutHeight} = event.nativeEvent.layout;
    if (layoutWidth !== cameraLayout.width || layoutHeight !== cameraLayout.height) {
      console.log('Camera layout updated:', layoutWidth, layoutHeight);
      setCameraLayout({width: layoutWidth, height: layoutHeight});
    }
  }, [cameraLayout.width, cameraLayout.height]);

  // --- Memoized Values ---
  const animatedCenterY = useMemo(() => {
    return Animated.divide(
      Animated.subtract(cameraLayout.height, focusAreaHeight),
      2
    );
  }, [cameraLayout.height, focusAreaHeight]);

  const maskRectX = useMemo(() => {
    return (cameraLayout.width - PREVIEW_SIZE) / 2;
  }, [cameraLayout.width]);

  // --- Loading / No Permission / No Device Handling ---
  if (!hasPermission) {
    return (
      <LoadingContainer>
        <LoadingText style={{textAlign: 'center', paddingHorizontal: 20, marginBottom: 15}}>
          카메라 사용 권한이 필요합니다. {'\n'}앱 설정에서 권한을 허용해주세요.
        </LoadingText>
        <TouchableOpacity onPress={() => Linking.openSettings()} style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>설정 열기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>뒤로가기</Text>
        </TouchableOpacity>
      </LoadingContainer>
    );
  }

  if (!device) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color={themes.light.pointColor.Primary} />
        <LoadingText>사용 가능한 카메라를 찾을 수 없습니다.</LoadingText>
      </LoadingContainer>
    );
  }

  // --- Render ---
  return (
    <CameraContainer>
      {/* Header */}
      <Header>
        <HeaderTopRow>
          <HeaderButtonWrapper onPress={handleGoBack} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} disabled={isProcessing}>
            <HeaderButton>
              <HeaderIcons.chevron
                width={20}
                height={20}
                style={{color: themes.light.textColor.buttonText}}
              />
            </HeaderButton>
          </HeaderButtonWrapper>
          <Title>사진으로 검색하기</Title>
          <HeaderButtonWrapper onPress={toggleFlash} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} disabled={isProcessing}>
            <HeaderButton
              style={{
                backgroundColor: flash === 'on' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              }}>
              <CameraIcons.flash
                width={24}
                height={24}
                style={{
                  color: flash === 'on' ? '#FFD700' : themes.light.textColor.buttonText,
                }}
              />
            </HeaderButton>
          </HeaderButtonWrapper>
        </HeaderTopRow>

        <HeaderBottomRow>
          <ToggleContainer>
            <Animated.View
              style={[
                styles.toggleBackground,
                { transform: [{ translateX }] },
              ]}
            />
            <ToggleOption onPress={() => handleToggle(0)} disabled={isProcessing}>
              <ToggleButton>
                <ToggleText isActive={activeIndex === 0}>알약 촬영</ToggleText>
              </ToggleButton>
            </ToggleOption>
            <ToggleOption onPress={() => handleToggle(1)} disabled={isProcessing}>
              <ToggleButton>
                <ToggleText isActive={activeIndex === 1}>처방전 촬영</ToggleText>
              </ToggleButton>
            </ToggleOption>
          </ToggleContainer>
        </HeaderBottomRow>
      </Header>

      {/* Camera Preview Area (Touchable for Focus) */}
      <TouchableOpacity
        style={styles.cameraPreviewTouchable}
        activeOpacity={1}
        onPress={handleCameraScreenTouch}
        disabled={isProcessing}
      >
        {isFocused && hasPermission && device && (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isFocused && isCameraActive}
            photo={true}
            audio={false}
            enableZoomGesture={false}
            enableHighQualityPhotos={true}
            onLayout={onCameraLayout}
            orientation="portrait"
            torch={flash === 'on' ? 'on' : 'off'}
            preset="photo"
          />
        )}
      </TouchableOpacity>

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Focus Indicator */}
      {showFocusIndicator && focusPoint && (
        <Animated.View
          style={[
            styles.focusIndicator,
            {
              left: focusPoint.x - FOCUS_INDICATOR_SIZE / 2,
              top: focusPoint.y - FOCUS_INDICATOR_SIZE / 2,
              opacity: focusIndicatorOpacity,
              transform: [{scale: focusIndicatorScale}],
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Mask Overlay - SVG */}
      <MaskContainer pointerEvents="none">
        <Svg height="100%" width="100%">
          <Defs>
            <Mask id="mask" x="0" y="0" height="100%" width="100%">
              <Rect x="0" y="0" width="100%" height="100%" fill="white" />
              <AnimatedRect
                x={maskRectX}
                y={animatedCenterY}
                width={PREVIEW_SIZE}
                height={focusAreaHeight}
                rx={BORDER_RADIUS}
                ry={BORDER_RADIUS}
                fill="black"
              />
            </Mask>
          </Defs>
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

      {/* Center Focus Area Border (Animated) */}
      <AnimatedFocusArea
        style={[
          styles.focusAreaBorder,
          {
            left: maskRectX,
            top: animatedCenterY,
            height: focusAreaHeight,
          },
        ]}
        pointerEvents="none"
      />

      {/* Bottom UI (Hint, Buttons) */}
      <BottomContainer pointerEvents="box-none">
        {/* Hint (Pill mode only) */}
        {!isPrescriptionMode && (
          <Animated.View style={{opacity: activeIndex === 0 ? 1 : 0, marginBottom: 25}}>
            <Hint>
              <HintIconWrapper>
                <CameraIcons.tip
                  width={20}
                  height={20}
                  style={{color: themes.light.textColor.buttonText}}
                />
              </HintIconWrapper>
              <HintTextWrapper>
                <HintTitle>인식률을 높이려면?</HintTitle>
                <HintText>
                  문자가 적힌 면이 위로 가도록 밝은 곳에서 촬영해주세요.
                </HintText>
              </HintTextWrapper>
            </Hint>
          </Animated.View>
        )}

        {/* Buttons */}
        <ButtonContainer>
          <ButtonItem onPress={openGallery} disabled={isProcessing}>
            <MaterialCommunityIcons 
              name="image" 
              size={28} 
              color={isProcessing ? "rgba(255,255,255,0.5)" : "#fff"} 
            />
          </ButtonItem>
          <CaptureButton 
            onPress={handleCapture} 
            disabled={isProcessing}
            style={isProcessing ? {opacity: 0.7} : {}}
          >
            <CaptureButtonInner />
          </CaptureButton>
          <ButtonItem
            onPress={() => {
              setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
            }}
            disabled={isProcessing}>
            <CameraIcons.cameraSwitch
              width={28}
              height={28}
              style={{
                color: isProcessing 
                  ? "rgba(255,255,255,0.5)" 
                  : themes.light.textColor.buttonText
              }}
            />
          </ButtonItem>
        </ButtonContainer>
      </BottomContainer>
    </CameraContainer>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  cameraPreviewTouchable: {
    flex: 1,
    backgroundColor: 'black',
  },
  toggleBackground: {
    position: 'absolute',
    top: TOGGLE_PADDING,
    left: 0,
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT - TOGGLE_PADDING * 2,
    backgroundColor: 'white',
    borderRadius: (TOGGLE_HEIGHT - TOGGLE_PADDING * 2) / 2,
  },
  focusIndicator: {
    position: 'absolute',
    width: FOCUS_INDICATOR_SIZE,
    height: FOCUS_INDICATOR_SIZE,
    borderWidth: 1.5,
    borderColor: 'white',
    borderRadius: FOCUS_INDICATOR_SIZE / 2,
  },
  focusAreaBorder: {
    position: 'absolute',
    width: PREVIEW_SIZE,
    borderRadius: BORDER_RADIUS,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'transparent',
  },
  settingsButton: {
    padding: 10,
  },
  settingsButtonText: {
    color: themes.light.pointColor.Primary,
    fontSize: 16,
  },
  backButton: {
    padding: 10,
    marginTop: 5,
  },
  backButtonText: {
    color: 'grey',
    fontSize: 14,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

// Styled Components
const CameraContainer = styled.View`
  flex: 1;
  background-color: black;
`;

const Header = styled.View`
  position: absolute;
  top: ${Platform.OS === 'ios' ? 60 : 20}px;
  left: 0;
  right: 0;
  padding: 0 20px;
  z-index: 10;
`;

const HeaderTopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 44px;
`;

const HeaderButtonWrapper = styled.TouchableOpacity``;

const HeaderButton = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.heading.default};
  color: ${themes.light.textColor.buttonText};
`;

const HeaderBottomRow = styled.View`
  margin-top: 20px;
  align-items: center;
`;

const ToggleContainer = styled.View`
  flex-direction: row;
  width: ${TOGGLE_WIDTH * 2 + TOGGLE_PADDING * 2}px;
  height: ${TOGGLE_HEIGHT}px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: ${TOGGLE_HEIGHT / 2}px;
  padding: 0;
  align-items: center;
  position: relative;
`;

const ToggleOption = styled.TouchableOpacity`
  width: ${TOGGLE_WIDTH}px;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const ToggleButton = styled.View``;

const ToggleText = styled.Text`
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.body.default};
  color: ${({isActive}) => (isActive ? 'black' : 'rgba(255, 255, 255, 0.8)')};
  font-weight: ${({isActive}) => (isActive ? 'bold' : 'normal')};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: black;
`;

const LoadingText = styled.Text`
  color: white;
  margin-top: 10px;
`;

const MaskContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const BottomContainer = styled.View`
  position: absolute;
  bottom: ${Platform.OS === 'ios' ? 40 : 20}px;
  left: 0;
  right: 0;
  align-items: center;
  padding-bottom: 10px;
`;

const Hint = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 10px 15px;
  border-radius: 12px;
  max-width: ${windowWidth - 80}px;
`;

const HintIconWrapper = styled.View`
  margin-right: 10px;
`;

const HintTextWrapper = styled.View`
  flex-shrink: 1;
`;

const HintTitle = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.body.small};
  color: white;
  margin-bottom: 4px;
`;

const HintText = styled.Text`
  font-family: 'Pretendard-Regular';
  font-size: ${FontSizes.caption.small};
  color: rgba(255, 255, 255, 0.9);
  line-height: 16px;
`;

const ButtonContainer = styled.View`
  width: 100%;
  padding: 0 40px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ButtonItem = styled.TouchableOpacity`
  width: 50px;
  height: 50px;
  justify-content: center;
  align-items: center;
`;

const CaptureButton = styled.TouchableOpacity`
  width: 72px;
  height: 72px;
  border-radius: 36px;
  border-width: 4px;
  border-color: white;
  background-color: rgba(255, 255, 255, 0.2);
  justify-content: center;
  align-items: center;
`;

const CaptureButtonInner = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: white;
`;

export default CameraSearchScreen;