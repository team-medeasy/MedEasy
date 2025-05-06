import React, {useEffect, useState, useRef} from 'react';
import styled from 'styled-components/native';
import {View, ActivityIndicator, Text, Alert} from 'react-native';
import {themes} from './../../styles';
import {
  Header,
  CameraSearchResultsList,
  NoSearchResults,
} from '../../components';
import {searchPillByImage} from '../../api/pillSearch';
import {getMedicineDetailByItemSeq} from '../../api/search';
import {CameraSearchPlaceholder} from '../../components/CameraSearchResult/CameraSearchPlaceholder';

const CameraSearchResultsScreen = ({route, navigation}) => {
  const {photoUri, timestamp} = route.params || {};
  const isMounted = useRef(true);
  const apiCallStarted = useRef(false);

  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // 검색 결과 항목 클릭 처리
  const handleSearchResultPress = item => {
    console.log('[CameraResults] 검색 결과 항목 클릭:', item.uniqueKey);
    navigation.navigate('MedicineDetail', {item});
  };

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    console.log('[CameraResults] 컴포넌트 마운트');

    // 언마운트 시 정리
    return () => {
      console.log('[CameraResults] 컴포넌트 언마운트');
      isMounted.current = false;
    };
  }, []);

  // 포커스 이벤트 리스너
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[CameraResults] 화면에 포커스됨');
    });

    return unsubscribe;
  }, [navigation]);

  // API 호출 처리
  useEffect(() => {
    // API 호출이 이미 시작되었는지 확인
    if (apiCallStarted.current) {
      console.log('[CameraResults] API 호출이 이미 진행 중입니다');
      return;
    }

    console.log('[CameraResults] photoUri 확인:', !!photoUri);

    if (!photoUri) {
      console.error('[CameraResults] 사진 URI가 없음');
      setLoading(false);
      setError(true);
      return;
    }

    // API 호출 시작 표시
    apiCallStarted.current = true;

    const fetchSearchResults = async () => {
      console.log('[CameraResults] API 호출 시작');

      const startTime = Date.now();

      try {
        // API 호출
        const response = await searchPillByImage(photoUri);

        const endTime = Date.now(); // ← 응답 받은 시간 저장
        const elapsedTime = (endTime - startTime) / 1000; // 초 단위로 변환
        console.log(
          `[CameraResults] 알약 검색 API 응답 시간: ${elapsedTime}초`,
        );

        console.log(
          '[CameraResults] 알약 검색 API 응답 받음:',
          response?.length || 0,
        );

        if (!isMounted.current) {
          console.log('[CameraResults] 마운트 해제됨, 작업 취소');
          return;
        }

        // 검색 결과가 있는지 확인
        if (!response || response.length === 0 || !response[0].searchResults) {
          console.log('[CameraResults] 검색 결과 없음');
          setSearchResults([]);
          setLoading(false);
          return;
        }

        // 모든 검색 결과 처리
        const allItems = response.flatMap(item => item.searchResults);
        console.log('[CameraResults] 총 검색 결과 수:', allItems.length);

        // 모든 상세 정보 가져오기
        const detailedResults = await Promise.all(
          allItems.map(async (result, index) => {
            console.log(
              `[CameraResults] 상세 정보 로딩 중 (${index + 1}/${
                allItems.length
              })`,
            );
            try {
              const detail = await getMedicineDetailByItemSeq(result.itemSeq);
              return detail?.body ? {...result, detail: detail.body} : result;
            } catch (error) {
              console.error(
                `[CameraResults] 항목 ${result.itemSeq} 상세 정보 로드 실패:`,
                error,
              );
              return result;
            }
          }),
        );

        if (!isMounted.current) return;

        console.log('[CameraResults] 모든 상세 정보 로드 완료');

        // 결과 매핑
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

        console.log(
          '[CameraResults] 결과 매핑 완료, 항목 수:',
          mappedResults.length,
        );

        if (isMounted.current) {
          setSearchResults(mappedResults);
          setInitialDataLoaded(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('[CameraResults] 검색 실패:', err);

        if (isMounted.current) {
          Alert.alert('검색 실패', '문제가 발생했습니다. 다시 시도해주세요.');
          setError(true);
          setLoading(false);
        }
      }
    };

    // API 호출 즉시 시작
    console.log('[CameraResults] API 호출 함수 시작');
    fetchSearchResults();
  }, [photoUri, timestamp]);

  return (
    <Container>
      <Header
        onBackPress={() => {
          console.log('[CameraResults] 뒤로가기 버튼 클릭');
          navigation.goBack();
        }}>
        약 검색 결과
      </Header>

      <SearchResultContainer>
        {loading ? (
          <>
            <CameraSearchPlaceholder />
            <CameraSearchPlaceholder />
          </>
        ) : error || (initialDataLoaded && searchResults.length === 0) ? (
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
