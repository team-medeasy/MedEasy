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
  const [autoFocus, setAutoFocus] = useState('on'); // 자동 포커스 상태 추가
  const [isProcessing, setIsProcessing] = useState(false); // 사진 처리 중 상태 추가
  const [cameraLayout, setCameraLayout] = useState({
    width: windowWidth,
    height: windowHeight,
  });

  // --- Refs ---
  const cameraRef = useRef(null);
  const translateX = useRef(new Animated.Value(TOGGLE_PADDING)).current;
  const focusAreaHeight = useRef(new Animated.Value(PREVIEW_SIZE)).current;
  const focusIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const focusIndicatorScale = useRef(new Animated.Value(1.2)).current;

  // --- Derived State ---
  const isPrescriptionMode = activeIndex === 1;
  const device = useCameraDevice(cameraPosition);
  
  // 최적의 카메라 포맷 선택
  const optimalFormat = useMemo(() => {
    if (!device?.formats) return null;
    
    // 자동 포커스 지원 포맷 중 해상도가 높은 포맷 선택
    const autoFocusFormats = device.formats.filter(format => 
      format.autoFocusSystem === 'phase-detection' || 
      format.autoFocusSystem === 'contrast-detection'
    );
    
    if (autoFocusFormats.length > 0) {
      // 해상도 기준으로 정렬 (높은 것 우선)
      return autoFocusFormats.sort((a, b) => {
        const aResolution = a.photoWidth * a.photoHeight;
        const bResolution = b.photoWidth * b.photoHeight;
        return bResolution - aResolution;
      })[0]; // 가장 높은 해상도 선택
    }
    
    return null;
  }, [device?.formats]);

  // --- Permission Handling ---
  const checkAndRequestCameraPermission = useCallback(async () => {
    if (hasPermission) return true;
    
    console.log('Requesting camera permission...');
    const granted = await requestPermission();
    
    if (!granted) {
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
    // 처리 중이면 뒤로가기 동작 막기
    if (isProcessing) return;
    
    // 화면 전환 애니메이션 적용
    const backOptions = {
      animation: 'slide_from_left', // 왼쪽에서 슬라이드 (기본 뒤로가기 애니메이션)
      duration: 300, // 애니메이션 시간 (300ms)
    };
    
    navigation.goBack(backOptions);
  }, [navigation, isProcessing]);

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
      }),
      Animated.spring(translateX, {
        toValue: targetTranslateX,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focusAreaHeight, translateX]);

  const openGallery = useCallback(async () => {
    // 이미 처리 중인 경우 중복 실행 방지
    if (isProcessing) return;
    
    // 갤러리 열기 전 처리 중 상태로 변경
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

      if (result.didCancel) {
        console.log('User cancelled image picker');
        setIsProcessing(false); // 취소 시 처리 상태 해제
      } else if (result.errorCode) {
        console.error('ImagePicker Error: ', result.errorMessage);
        setIsProcessing(false); // 오류 시 처리 상태 해제
        Alert.alert('오류', '갤러리를 여는 데 실패했습니다.');
      } else if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        // 이미지 선택 완료 후 잠시 로딩 상태 유지 (자연스러운 전환을 위해)
        setTimeout(() => {
          setIsProcessing(false); // 처리 상태 해제
          navigation.navigate('PhotoPreview', {
            photoUri: result.assets[0].uri,
            // 화면 전환 애니메이션 설정
            transitionAnimation: {
              animation: 'slide_from_right',
              duration: 350,
            },
          });
        }, 200);
      }
    } catch (error) {
      console.error('갤러리 열기 실패:', error);
      setIsProcessing(false); // 오류 시 처리 상태 해제
      Alert.alert('오류', '갤러리를 여는 데 실패했습니다.');
    }
  }, [navigation, isProcessing]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !hasPermission || !cameraLayout.width || !cameraLayout.height) {
      if (!hasPermission) {
        // 권한이 없는 상태에서 촬영 버튼 누르면 권한 요청
        const granted = await checkAndRequestCameraPermission();
        if (!granted) return;
      } else {
        Alert.alert('오류', '사진을 촬영할 준비가 되지 않았습니다.');
      }
      return;
    }
    
    // 이미 처리 중인 경우 중복 실행 방지
    if (isProcessing) return;
    
    // 처리 중 상태로 변경 (UI에 로딩 표시 및 버튼 비활성화)
    setIsProcessing(true);

    try {
      // 촬영 전 자동 포커스 맞추기 시도
      if (autoFocus === 'on' && device?.supportsFocus) {
        try {
          // 화면 중앙에 포커스 맞추기
          const centerPoint = {
            x: Math.round(cameraLayout.width / 2),
            y: Math.round(cameraLayout.height / 2),
          };
          await cameraRef.current.focus(centerPoint);
          console.log('Auto focus applied before capture');
        } catch (focusError) {
          console.warn('Failed to auto-focus before capture:', focusError);
          // 포커스 실패해도 계속 촬영 진행
        }
      }

      // 잠시 지연 후 촬영 (포커스가 적용될 시간)
      setTimeout(async () => {
        try {
          console.log('Taking photo...');
          const photo = await cameraRef.current.takePhoto({
            qualityPrioritization: 'quality',
            flash: flash,
            enableAutoStabilization: true,
            skipMetadata: false,
            // 물체에 가까이 갈수록 매크로 모드 활성화
            photoCodec: 'jpeg',
            quality: 90, // 높은 품질
          });
          console.log('Photo taken:', photo.path);

          console.log('Cropping photo...');
          const croppedUri = await cropCenterArea(photo.path, isPrescriptionMode, cameraLayout);
          console.log('Cropped URI:', croppedUri);

          if (croppedUri) {
            // 잠시 지연 후 화면 전환하여 처리가 완료된 느낌을 줌
            setTimeout(() => {
              setIsProcessing(false); // 처리 완료
              navigation.navigate('PhotoPreview', {
                photoUri: croppedUri,
                // 화면 전환 애니메이션 설정
                transitionAnimation: {
                  animation: 'slide_from_right',
                  duration: 350,
                },
              });
            }, 200);
          } else {
            console.error('Photo cropping failed or returned null URI');
            setIsProcessing(false); // 처리 완료
            Alert.alert('오류', '사진 처리 중 문제가 발생했습니다.');
          }
        } catch (photoError) {
          console.error('Failed to take photo:', photoError);
          setIsProcessing(false); // 처리 완료
          if (photoError.message.includes('permission')) {
            Alert.alert('오류', '카메라 접근 권한 문제로 촬영에 실패했습니다.');
          } else {
            Alert.alert('오류', '사진 촬영 중 오류가 발생했습니다.');
          }
        }
      }, 300); // 포커스 적용 시간 300ms
    } catch (error) {
      console.error('Failed during capture preparation:', error);
      setIsProcessing(false); // 처리 완료
      Alert.alert('오류', '사진 촬영 준비 중 오류가 발생했습니다.');
    }
  }, [hasPermission, cameraLayout, flash, isPrescriptionMode, navigation, checkAndRequestCameraPermission, autoFocus, device?.supportsFocus, isProcessing]);

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
      setShowFocusIndicator(false);
    });
  }, [focusIndicatorOpacity, focusIndicatorScale]);

  const handleCameraScreenTouch = useCallback(async (event) => {
    if (!cameraRef.current || !isFocused || !device?.supportsFocus) {
      console.log('Focus not supported or camera not ready.');
      return;
    }

    try {
      // 자동 포커스를 일시적으로 비활성화하고 수동 포커스로 전환
      setAutoFocus('off');
      
      const {locationX, locationY} = event.nativeEvent;
      const point = {
        x: Math.round(locationX),
        y: Math.round(locationY),
      };

      console.log('Focus tapped at:', point);
      setFocusPoint(point);
      animateFocusIndicator();

      // 터치한 포인트에 포커스 맞추기 
      await cameraRef.current.focus(point);
      console.log('Focus successful');
      
      // 3초 후에 자동 포커스 다시 활성화 (선택적)
      setTimeout(() => {
        setAutoFocus('on');
      }, 3000);

    } catch (error) {
      console.error('Failed to focus:', error);
      // 포커스 실패 시 자동 포커스로 복귀
      setAutoFocus('on');
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
          <HeaderButtonWrapper 
            onPress={handleGoBack} 
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            disabled={isProcessing}
          >
            <HeaderButton style={isProcessing ? {opacity: 0.5} : null}>
              <HeaderIcons.chevron
                width={20}
                height={20}
                style={{color: themes.light.textColor.buttonText}}
              />
            </HeaderButton>
          </HeaderButtonWrapper>
          <Title>사진으로 검색하기</Title>
          <View style={{flexDirection: 'row'}}>
            {/* 자동 포커스 토글 버튼 추가 */}
            <HeaderButtonWrapper 
              onPress={() => !isProcessing && setAutoFocus(prev => prev === 'on' ? 'off' : 'on')} 
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={{marginRight: 10}}
              disabled={isProcessing}
            >
              <HeaderButton
                style={{
                  backgroundColor: autoFocus === 'on' ? 'rgba(0, 150, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  opacity: isProcessing ? 0.5 : 1,
                }}>
                <MaterialCommunityIcons
                  name={autoFocus === 'on' ? 'focus-auto' : 'focus-field'}
                  size={20}
                  color={autoFocus === 'on' ? '#00BFFF' : themes.light.textColor.buttonText}
                />
              </HeaderButton>
            </HeaderButtonWrapper>
            
            {/* 플래시 버튼 */}
            <HeaderButtonWrapper 
              onPress={toggleFlash} 
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              disabled={isProcessing}
            >
              <HeaderButton
                style={{
                  backgroundColor: flash === 'on' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  opacity: isProcessing ? 0.5 : 1,
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
          </View>
        </HeaderTopRow>

        <HeaderBottomRow>
          <ToggleContainer style={isProcessing ? {opacity: 0.5} : null}>
            <Animated.View
              style={[
                styles.toggleBackground,
                { transform: [{ translateX }] },
              ]}
            />
            <ToggleOption onPress={() => !isProcessing && handleToggle(0)} disabled={isProcessing}>
              <ToggleButton>
                <ToggleText isActive={activeIndex === 0}>알약 촬영</ToggleText>
              </ToggleButton>
            </ToggleOption>
            <ToggleOption onPress={() => !isProcessing && handleToggle(1)} disabled={isProcessing}>
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
            isActive={isFocused}
            photo={true}
            audio={false}
            enableZoomGesture={true} // 줌 제스처 활성화
            enableHighQualityPhotos={true}
            onLayout={onCameraLayout}
            orientation="portrait"
            torch={flash === 'on' ? 'on' : 'off'}
            focusMode={autoFocus} // 자동 포커스 설정 적용
            minZoom={device.minZoom}
            maxZoom={device.maxZoom}
            format={optimalFormat} // 최적화된 포맷 사용
          />
        )}
      </TouchableOpacity>

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

      {/* Processing Overlay - 사진 처리 중 표시 */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.processingText}>사진 처리 중...</Text>
        </View>
      )}
      
      {/* Bottom UI (Hint, Buttons) */}
      <BottomContainer pointerEvents={isProcessing ? "none" : "box-none"}>
        {/* Hint (Pill mode only) */}
        {!isPrescriptionMode && !isProcessing && (
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
              color={isProcessing ? "rgba(255, 255, 255, 0.5)" : "#fff"} 
            />
          </ButtonItem>
          <CaptureButton onPress={handleCapture} disabled={isProcessing}>
            <CaptureButtonInner style={isProcessing ? {opacity: 0.7} : null} />
          </CaptureButton>
          <ButtonItem
            onPress={() => {
              if (!isProcessing) {
                setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
              }
            }}>
            <CameraIcons.cameraSwitch
              width={28}
              height={28}
              style={{
                color: isProcessing 
                  ? "rgba(255, 255, 255, 0.5)" 
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 15,
    fontFamily: 'Pretendard-Medium',
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
  opacity: ${props => props.disabled ? 0.7 : 1};
`;

const CaptureButtonInner = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: white;
`;

export default CameraSearchScreen;