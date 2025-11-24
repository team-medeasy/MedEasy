import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components/native';
import {
  View,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
  Image as RNImage,
  Alert,
  BackHandler,
} from 'react-native';
import { Header, ModalHeader, Button } from '../../components';
import { themes } from '../../styles';
import { useNavigation, useRoute, useFocusEffect, CommonActions } from '@react-navigation/native';
import ImageSize from 'react-native-image-size';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';

const { width, height } = Dimensions.get('window');

const PhotoPreviewScreen = () => {
  const route = useRoute();
  const {
    photoUri,
    isModal = false,
    isPrescription = false,
    actionType = null,
    sourceScreen = null
  } = route.params || {};

  const { fontSizeMode } = useFontSize();
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigation = useNavigation();
  const imageRef = useRef(null);
  const isMounted = useRef(true);

  // 수정된 뒤로가기 핸들러
  const handleGoBack = useCallback(() => {
    console.log('[PhotoPreview] 뒤로가기 버튼 클릭');

    try {
      // 안전하게 뒤로가기 처리
      if (navigation.canGoBack()) {
        console.log('[PhotoPreview] 일반 뒤로가기 실행');
        navigation.goBack();
      } else {
        // 뒤로 갈 화면이 없을 경우 홈으로 이동
        console.log('[PhotoPreview] 뒤로갈 화면 없음, TabNavigator로 이동');
        navigation.navigate('TabNavigator');
      }
    } catch (error) {
      console.error('[PhotoPreview] 뒤로가기 처리 중 오류:', error);
      navigation.navigate('TabNavigator');
    }
  }, [navigation]);

  // 안드로이드 뒤로가기 버튼 처리
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleGoBack();
          return true;
        }
      );

      return () => subscription.remove();
    }, [handleGoBack])
  );

  // 이미지 크기를 기반으로 화면에 최적화된 크기 계산
  const optimizedImageSize = React.useMemo(() => {
    if (!imageSize) return { width: 0, height: 0 };

    const availableWidth = width * 0.9;
    const availableHeight = height * 0.6;
    const imageAspectRatio = imageSize.width / imageSize.height;
    let displayWidth, displayHeight;

    if (imageSize.width > imageSize.height) {
      displayWidth = Math.min(availableWidth, imageSize.width);
      displayHeight = displayWidth / imageAspectRatio;
      if (displayHeight < availableHeight * 0.5) {
        displayHeight = availableHeight * 0.5;
        displayWidth = displayHeight * imageAspectRatio;
      }
    } else {
      displayHeight = Math.min(availableHeight, imageSize.height);
      displayWidth = displayHeight * imageAspectRatio;
      if (displayWidth > availableWidth) {
        displayWidth = availableWidth;
        displayHeight = displayWidth / imageAspectRatio;
      }
    }

    return {
      width: displayWidth,
      height: displayHeight,
    };
  }, [imageSize]);

  // 이미지 로드 함수
  const loadImage = async (uri) => {
    try {
      setIsLoading(true);
      if (!uri) {
        throw new Error('유효하지 않은 이미지 URI');
      }

      const properUri = uri.startsWith('file://') ? uri : `file://${uri}`;
      console.log('[PhotoPreview] 이미지 로드 시작:', properUri.substring(0, 30) + '...');

      const size = await ImageSize.getSize(properUri);
      console.log('[PhotoPreview] 이미지 크기 계산 완료:', size);

      if (!isMounted.current) return;

      setImageSize(size);
      setPhoto(properUri);
      setIsLoading(false);
    } catch (error) {
      console.error('[PhotoPreview] 이미지 로드 오류:', error);
      if (isMounted.current) {
        setIsLoading(false);
        Alert.alert('오류', '이미지를 로드할 수 없습니다.', [
          { text: '확인', onPress: handleGoBack }
        ]);
      }
    }
  };

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    console.log('[PhotoPreview] 컴포넌트 마운트');
    console.log('[PhotoPreview] 파라미터:', {
      sourceScreen,
      actionType,
      isPrescription
    });

    if (photoUri) {
      loadImage(photoUri);
    } else {
      console.error('[PhotoPreview] 사진 URI가 없음');
      setIsLoading(false);
      Alert.alert('오류', '이미지를 찾을 수 없습니다.', [
        { text: '확인', onPress: handleGoBack }
      ]);
    }

    return () => {
      console.log('[PhotoPreview] 컴포넌트 언마운트');
      isMounted.current = false;
    };
  }, [photoUri]);

  // 헤더 컴포넌트 선택
  const HeaderComponent = ({ isModal = false, ...props }) => {
    if (isModal) {
      return <ModalHeader {...props} />;
    }
    return (
      <Header
        onBackPress={handleGoBack}
        hideBorder={true}
        {...props}
      />
    );
  };

  // 수정된 검색/분석 처리 핸들러 - CommonActions.navigate 사용
  const handleNavigateToSearch = () => {
    if (!photo || isLoading || isNavigating) {
      console.log('[PhotoPreview] 검색 불가: 이미지 로딩 중이거나 네비게이션 진행 중');
      return;
    }

    console.log('[PhotoPreview] 검색/분석 버튼 클릭');
    setIsNavigating(true);

    try {
      // VoiceChat에서 왔을 경우
      if (sourceScreen === 'VoiceChat') {
        console.log('[PhotoPreview] 기존 VoiceChat 인스턴스로 돌아가기 (merge+pop)');

        // 기존 VoiceChat으로 돌아가면서 params 업데이트
        navigation.dispatch(
          CommonActions.navigate({
            name: 'VoiceChat',
            params: {
              photoUri: photo,
              isPrescription: isPrescription,
              actionType: actionType,
              timestamp: Date.now(),
              photoProcessed: true
            },
            merge: true,   // 기존 params와 병합
            pop: true,     // 스택에서 해당 화면까지 pop
          })
        );
      } else {
        // 일반 검색 흐름
        const targetScreen = isPrescription ? 'PrescriptionSearchResults' : 'CameraSearchResults';
        console.log(`[PhotoPreview] ${targetScreen}으로 이동`);

        navigation.navigate(targetScreen, {
          photoUri: photo,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('[PhotoPreview] 네비게이션 오류:', error);
      Alert.alert('오류', '화면 이동 중 문제가 발생했습니다.');
      navigation.goBack(); // 오류 시 뒤로가기
    }
  };

  // 버튼 텍스트 결정
  const getButtonText = () => {
    if (sourceScreen === 'VoiceChat') {
      if (isPrescription) {
        return "처방전 분석하기";
      } else {
        return "알약 분석하기";
      }
    } else {
      if (isPrescription) {
        return "처방전 분석하기";
      } else {
        return "검색하기";
      }
    }
  };

  // 화면 제목 결정
  const getScreenTitle = () => {
    if (isPrescription) {
      return "처방전 미리보기";
    } else {
      return "의약품 미리보기";
    }
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor={themes.light.bgColor.bgPrimary} />
      <HeaderComponent
        isModal={isModal}
        onBackPress={handleGoBack}
      >
        {getScreenTitle()}
      </HeaderComponent>

      <ContentContainer>
        {isLoading ? (
          <LoadingContainer>
            <ActivityIndicator size="large" color={themes.light.pointColor.Primary} />
            <LoadingText>이미지를 불러오는 중...</LoadingText>
          </LoadingContainer>
        ) : (
          <ImageContainer>
            {photo && (
              <PreviewImage
                ref={imageRef}
                source={{ uri: photo }}
                style={{
                  width: optimizedImageSize.width,
                  height: optimizedImageSize.height,
                }}
                resizeMode="contain"
              />
            )}
          </ImageContainer>
        )}
      </ContentContainer>

      <GuideText fontSizeMode={fontSizeMode}>
        {isPrescription ?
          "처방전이 선명하게 나오도록 촬영했는지 확인해주세요." :
          "알약의 문자와 모양이 잘 보이는지 확인해주세요."}
      </GuideText>

      <ButtonContainer>
        <Button
          title={getButtonText()}
          onPress={handleNavigateToSearch}
          disabled={isLoading || !photo || isNavigating}
        />
      </ButtonContainer>
    </Container>
  );
};

// 스타일 컴포넌트
const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  margin-top: 10px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary70};
`;

const ImageContainer = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const PreviewImage = styled.Image`
  background-color: ${themes.light.bgColor.bgSecondary};
  border-radius: 8px;
`;

const GuideText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({ fontSizeMode }) => FontSizes.caption[fontSizeMode]}px;
  color: ${themes.light.textColor.Primary50};
  text-align: center;
  padding: 0 40px;
  margin-bottom: 10px;
`;

const ButtonContainer = styled.View`
  padding: 20px;
  padding-bottom: 30px;
`;

export default PhotoPreviewScreen;