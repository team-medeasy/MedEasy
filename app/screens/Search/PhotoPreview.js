import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {Header, ModalHeader, Button} from '../../components';
import {themes} from '../../styles';
import {useNavigation} from '@react-navigation/native';
import {View, Alert} from 'react-native';
import {searchPillByImage} from '../../api/pillSearch';

const PhotoPreviewScreen = ({route}) => {
  const {photoUri, isModal = false} = route.params;
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (photoUri) {
      setPhoto(photoUri);
    } else {
      console.error('사진 URI를 찾을 수 없습니다.');
    }
  }, [photoUri]);

  const HeaderComponent = ({isModal = false, ...props}) => {
    if (isModal) {
      return <ModalHeader {...props} />;
    }
    return <Header {...props} />;
  };

  // 알약 검색 API 호출 및 결과 처리
  const handleSearch = async () => {
    if (!photo) return;

    setLoading(true);

    try {
      console.log('검색 시작...');
      const results = await searchPillByImage(photo, 5); // top_k 기본값 = 5
      console.log('검색 결과:', results);

      // 검색 결과 스크린으로 전달
      navigation.navigate('CameraSearchResults', {searchResults: results});
    } catch (error) {
      console.error('검색 실패:', error);
      Alert.alert('검색 실패', '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!photo) {
    return (
      <Container>
        <HeaderComponent isModal={isModal}>
          사진을 불러오는 중...
        </HeaderComponent>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderComponent isModal={isModal}>사진 미리보기</HeaderComponent>

      <ImageContainer>
        <PreviewImage source={{uri: photo}} resizeMode="contain" />
      </ImageContainer>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 30,
          alignItems: 'center',
        }}>
        <Button
          title={loading ? '검색 중...' : '검색하기'}
          onPress={handleSearch}
          disabled={loading}
        />
      </View>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const ImageContainer = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const PreviewImage = styled.Image`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export default PhotoPreviewScreen;
