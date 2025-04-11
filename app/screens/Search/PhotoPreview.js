import React, {useEffect, useState, useRef} from 'react';
import styled from 'styled-components/native';
import {
  View, 
  Dimensions, 
  ActivityIndicator, 
  StatusBar, 
  Platform,
  Image as RNImage
} from 'react-native';
import {Header, ModalHeader, Button} from '../../components';
import {themes} from '../../styles';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import ImageSize from 'react-native-image-size';

const { width, height } = Dimensions.get('window');

const PhotoPreviewScreen = ({route}) => {
  const {photoUri, isModal = false} = route.params || {};
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState(null);
  const navigation = useNavigation();
  const imageRef = useRef(null);

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
      
      // 이미지 크기 가져오기
      const size = await ImageSize.getSize(properUri);
      console.log('프리뷰 이미지 크기:', size);
      
      setImageSize(size);
      setPhoto(properUri);
    } catch (error) {
      console.error('이미지 로드 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 포커스 시 이미지 로드 (딜레이 방지)
  useFocusEffect(
    React.useCallback(() => {
      if (photoUri) {
        loadImage(photoUri);
      } else {
        console.error('사진 URI를 찾을 수 없습니다.');
        setIsLoading(false);
      }
      
      return () => {
        // 화면에서 벗어날 때 메모리 관리
        setPhoto(null);
        setImageSize(null);
      };
    }, [photoUri])
  );

  const HeaderComponent = ({isModal = false, ...props}) => {
    if (isModal) {
      return <ModalHeader {...props} />;
    }
    return <Header {...props} />;
  };

  const handleNavigateToSearch = () => {
    if (!photo) return;

    navigation.navigate('CameraSearchResults', {
      photoUri: photo,
    });
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor={themes.light.bgColor.bgPrimary} />
      <HeaderComponent isModal={isModal}>사진 미리보기</HeaderComponent>

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
          title="검색하기" 
          onPress={handleNavigateToSearch} 
          disabled={isLoading || !photo}
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