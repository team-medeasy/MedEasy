import React, {useEffect, useState, Suspense} from 'react';
import styled from 'styled-components/native';
import {ActivityIndicator} from 'react-native';
import {Header, ModalHeader, Button} from '../../components';
import {themes} from '../../styles';
import {useNavigation} from '@react-navigation/native';
import {View, Alert} from 'react-native';
import {searchPillByImage} from '../../api/pillSearch';
import {getMedicineDetail} from '../../api/search';

const PhotoPreviewContent = ({route}) => {
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

  const handleSearch = async () => {
    if (!photo) return;

    setLoading(true);

    try {
      console.log('Searching pill by image...');
      const response = await searchPillByImage(photo);
      console.log('Search response:', response);

      const detailedResults = await Promise.all(
        response.flatMap(item =>
          item.searchResults.map(async result => {
            try {
              const detail = await getMedicineDetail(result.itemSeq);
              console.log('Detail response:', detail);

              if (detail?.body) {
                return {
                  ...result,
                  detail: detail.body,
                };
              } else {
                console.error(`상세 정보 없음: itemSeq = ${result.itemSeq}`);
                return result;
              }
            } catch (error) {
              console.error(
                `상세 정보 가져오기 실패: itemSeq = ${result.itemSeq}`,
                error,
              );
              return result;
            }
          }),
        ),
      );

      console.log('Detailed search response:', detailedResults);

      const mappedResults = detailedResults.map(result => {
        // 상세 정보가 있는 경우
        if(result.detail) {
          return {
            uniqueKey: `${result.itemSeq}`,
            id: result.detail.id || "",
            item_image: result.detail.item_image || "",
            etc_otc_name: result.detail.etc_otc_name || "정보 없음",
            class_name: result.detail.class_name || "정보 없음",
            item_name: result.detail.item_name || "정보 없음",
            chart: result.detail.chart || "정보 없음",
            drug_shape: result.detail.drug_shape || "",
            color_classes: result.detail.color_classes || "",
            original_id: result.itemSeq,

            // ✅ 추가: 상세 정보 (효능/복용법/보관법/주의사항/부작용)
            indications: result.detail.indications || "",
            dosage: result.detail.dosage || "",
            storage_method: result.detail.storage_method || "",
            precautions: result.detail.precautions || "",
            side_effects: result.detail.side_effects || "",
            
            // MedicineAppearance 컴포넌트에 필요한 속성들
            colorClasses: result.colorClasses || result.detail.color_classes || "",
            colorGroup: result.colorGroup || result.detail.colorGroup || "",
            drugShape: result.drugShape || result.detail.drug_shape || "",
            score: result.score || 0,
          };
        }
        // 상세 정보가 없는 경우 기본 값
        return {
          uniqueKey: `${result.itemSeq}`,
          item_image: "",
          etc_otc_name: "정보 없음",
          class_name: "정보 없음",
          item_name: "정보 없음",
          chart: "정보 없음",
          original_id: result.itemSeq,
          colorClasses: result.colorClasses || "",
          colorGroup: result.colorGroup || "",
          drugShape: result.drugShape || "",
          score: result.score || 0,
        };
      })

      navigation.navigate('CameraSearchResults', {
        searchResults: mappedResults,
      });
    } catch (error) {
      console.error('Pill search failed:', error);
      if (error.response) {
        Alert.alert('검색 실패', '서버 응답 오류입니다. 다시 시도해주세요.');
      } else {
        Alert.alert(
          '검색 실패',
          '네트워크 오류 또는 기타 오류입니다. 다시 시도해주세요.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

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

const PhotoPreviewScreen = ({route}) => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" color="#007AFF" />}>
      <PhotoPreviewContent route={route} />
    </Suspense>
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
