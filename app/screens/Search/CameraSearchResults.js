import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {View, ActivityIndicator, Text, Alert} from 'react-native';
import {themes} from './../../styles';
import {
  Header,
  CameraSearchResultsList,
  NoSearchResults,
} from '../../components';
import {searchPillByImage} from '../../api/pillSearch';
import {getMedicineDetail} from '../../api/search';
import {CameraSearchPlaceholder} from '../../components/CameraSearchResult/CameraSearchPlaceholder';

const CameraSearchResultsScreen = ({route, navigation}) => {
  const {photoUri} = route.params || {};

  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(false);

  const handleSearchResultPress = item => {
    navigation.navigate('MedicineDetail', {item});
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!photoUri) return;

      try {
        const response = await searchPillByImage(photoUri);

        const detailedResults = await Promise.all(
          response.flatMap(item =>
            item.searchResults.map(async result => {
              try {
                const detail = await getMedicineDetail(result.itemSeq);
                return detail?.body
                  ? {
                      ...result,
                      detail: detail.body,
                    }
                  : result;
              } catch {
                return result;
              }
            }),
          ),
        );

        const mappedResults = detailedResults.map(result => {
          if (result.detail) {
            return {
              uniqueKey: `${result.itemSeq}`,
              id: result.detail.id || '',
              item_image: result.detail.item_image || '',
              entp_name: result.detail.entp_name || '정보 없음',
              etc_otc_name: result.detail.etc_otc_name || '정보 없음',
              class_name: result.detail.class_name || '정보 없음',
              item_name: result.detail.item_name || '정보 없음',
              chart: result.detail.chart || '정보 없음',
              drug_shape: result.detail.drug_shape || '',
              color_classes: result.detail.color_classes || '',
              print_front: result.detail.print_front || '',
              print_back: result.detail.print_back || '',
              leng_long: result.detail.leng_long || '',
              leng_short: result.detail.leng_short || '',
              thick: result.detail.thick || '',
              original_id: result.itemSeq,
              indications: result.detail.indications || '',
              dosage: result.detail.dosage || '',
              storage_method: result.detail.storage_method || '',
              precautions: result.detail.precautions || '',
              side_effects: result.detail.side_effects || '',
              // colorClasses:
              //   result.colorClasses || result.detail.color_classes || '',
              // colorGroup: result.colorGroup || result.detail.colorGroup || '',
              // drugShape: result.drugShape || result.detail.drug_shape || '',
              // score: result.score || 0,
            };
          }
          return {
            uniqueKey: `${result.itemSeq}`,
            item_image: '',
            etc_otc_name: '정보 없음',
            class_name: '정보 없음',
            item_name: '정보 없음',
            chart: '정보 없음',
            original_id: result.itemSeq,
            colorClasses: result.colorClasses || '',
            colorGroup: result.colorGroup || '',
            drugShape: result.drugShape || '',
            score: result.score || 0,
          };
        });

        setSearchResults(mappedResults);
      } catch (err) {
        console.error('검색 실패:', err);
        Alert.alert('검색 실패', '문제가 발생했습니다. 다시 시도해주세요.');
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [photoUri]);

  return (
    <Container>
      <Header onBackPress={() => navigation.goBack()}>약 검색 결과</Header>

      <SearchResultContainer>
        {loading ? (
          <>
            <CameraSearchPlaceholder />
            <CameraSearchPlaceholder />
          </>
        ) : error || searchResults.length === 0 ? (
          <NoSearchResults />
        ) : (
          <CameraSearchResultsList
            searchResults={searchResults}
            handleSearchResultPress={handleSearchResultPress}
            onEndReachedThreshold={0.5}
          />
        )}
      </SearchResultContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const SearchResultContainer = styled.View`
  flex: 1;
  margin-top: 16px;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

export default CameraSearchResultsScreen;
