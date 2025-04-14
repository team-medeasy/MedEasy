import React, {useEffect, useState, useRef} from 'react';
import styled from 'styled-components/native';
import {
  View, 
  Dimensions, 
  ActivityIndicator, 
  StatusBar, 
  Platform,
  Image as RNImage,
  Alert,
} from 'react-native';
import {Header, ModalHeader, Button} from '../../components';
import {themes} from '../../styles';
import {useNavigation} from '@react-navigation/native';
import ImageSize from 'react-native-image-size';

const { width, height } = Dimensions.get('window');

const PhotoPreviewScreen = ({route}) => {
  const {photoUri, isModal = false, isPrescription = false} = route.params || {};
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false); // 네비게이션 상태 추가
  const navigation = useNavigation();
  const imageRef = useRef(null);
  const isMounted = useRef(true);

  // 이미지 크기를 기반으로 화면에 최적화된 크기 계산
  const optimizedImageSize = React.useMemo(() => {
    if (!imageSize) return { width: 0, height: 0 };

    // 헤더 및 버튼 영역을 고려한 가용 화면 크기
    const availableWidth = width * 0.9; // 화면 너비의 90% 사용
    const availableHeight = height * 0.6; // 화면 높이의 60% 사용 (헤더/버튼 고려)
    
    const imageAspectRatio = imageSize.width / imageSize.height;
    
    let displayWidth, displayHeight;
    
    if (imageSize.width > imageSize.height) {
      // 가로 이미지
      displayWidth = Math.min(availableWidth, imageSize.width);
      displayHeight = displayWidth / imageAspectRatio;
      
      // 가로 이미지가 너무 작아지지 않도록 조정
      if (displayHeight < availableHeight * 0.5) {
        displayHeight = availableHeight * 0.5;
        displayWidth = displayHeight * imageAspectRatio;
      }
    } else {
      // 세로 이미지
      displayHeight = Math.min(availableHeight, imageSize.height);
      displayWidth = displayHeight * imageAspectRatio;
      
      // 이미지가 화면을 벗어나면 조정
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
  
  // 이미지 로드 및 크기 계산
  const loadImage = async (uri) => {
    try {
      setIsLoading(true);
      if (!uri) {
        throw new Error('유효하지 않은 이미지 URI');
      }
      
      // 이미지 경로 정규화
      const properUri = uri.startsWith('file://') ? uri : `file://${uri}`;
      
      console.log('[PhotoPreview] 이미지 로드 시작:', properUri);
      
      // 이미지 크기 가져오기
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
        Alert.alert('오류', '이미지를 로드할 수 없습니다.');
      }
    }
  };

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    console.log('[PhotoPreview] 컴포넌트 마운트');
    
    // 이미지 로드
    if (photoUri) {
      loadImage(photoUri);
    } else {
      console.error('[PhotoPreview] 사진 URI가 없음');
      setIsLoading(false);
    }
    
    // 언마운트 시 정리
    return () => {
      console.log('[PhotoPreview] 컴포넌트 언마운트');
      isMounted.current = false;
    };
  }, [photoUri]);

  // 헤더 컴포넌트 선택
  const HeaderComponent = ({isModal = false, ...props}) => {
    if (isModal) {
      return <ModalHeader {...props} />;
    }
    return <Header {...props} />;
  };

  // 검색 처리 - 개선된 버전
  const handleNavigateToSearch = () => {
    if (!photo || isLoading || isNavigating) {
      console.log('[PhotoPreview] 검색 불가: 사진 로드 중이거나 이미 네비게이션 중');
      return;
    }
    
    console.log('[PhotoPreview] 검색 버튼 클릭, 대상:', isPrescription ? 'Prescription' : 'Camera');
    
    // 중복 클릭 방지
    setIsNavigating(true);
    
    // 단순한 네비게이션 즉시 수행
    const targetScreen = isPrescription ? 'PrescriptionSearchResults' : 'CameraSearchResults';
    
    console.log(`[PhotoPreview] ${targetScreen}로 네비게이션 시작`);
    
    // 네비게이션 직접 수행
    navigation.navigate(targetScreen, {
      photoUri: photo,
      timestamp: new Date().getTime(), // 중복 방지용 타임스탬프 추가
    });
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor={themes.light.bgColor.bgPrimary} />
      <HeaderComponent 
        isModal={isModal} 
        onBackPress={() => {
          console.log('[PhotoPreview] 뒤로가기 버튼 클릭');
          navigation.goBack();
        }}
      >
        {isPrescription ? '처방전 미리보기' : '사진 미리보기'}
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
                source={{uri: photo}}
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

      <ButtonContainer>
        <Button 
          title={isPrescription ? "처방전 분석하기" : "검색하기"} 
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

const ButtonContainer = styled.View`
  padding: 20px;
  padding-bottom: 30px;
`;

export default PhotoPreviewScreen;