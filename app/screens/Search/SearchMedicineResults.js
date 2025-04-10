import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {Text} from 'react-native-gesture-handler';
import {View, ActivityIndicator} from 'react-native';
import {themes} from './../../styles';
import {
  ColorShapeView,
  SearchScreenHeader,
  SearchResultsList,
  NoSearchResults,
  FilterModal,
} from '../../components';

import {searchMedicine, searchMedicineWithFilters} from '../../api/medicine';

const SearchMedicineResultsScreen = ({route, navigation}) => {
  const {searchQuery} = route.params; // MedicineSearchScreen에서 전달된 검색어
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [selectedDosageForms, setSelectedDosageForms] = useState([]);
  const [selectedSplits, setSelectedSplits] = useState([]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // API 응답 데이터를 저장할 상태 변수 추가
  const [originalResponseData, setOriginalResponseData] = useState([]);

  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [tempFilters, setTempFilters] = useState({
    color: [],
    shape: [],
    dosageForm: [],
    split: [],
  });

  function mapColorToApiValue(koreanColor) {
    const colorMap = {
      하양: 'WHITE',
      노랑: 'YELLOW',
      주황: 'ORANGE',
      분홍: 'PINK',
      빨강: 'RED',
      갈색: 'BROWN',
      초록: 'GREEN',
      청록: 'CYAN',
      연두: 'LIGHT_GREEN',
      파랑: 'BLUE',
      남색: 'NAVY',
      보라: 'PURPLE',
      자홍: 'MAGENTA',
      회색: 'GRAY',
      검정: 'BLACK',
      투명: 'TRANSPARENT',
    };
    return colorMap[koreanColor] || koreanColor;
  }

  function mapShapeToApiValue(koreanShape) {
    const shapeMap = {
      원형: 'CIRCLE',
      타원형: 'OVAL',
      장방형: 'OBLONG',
      삼각형: 'TRIANGLE',
      사각형: 'RECTANGLE',
      마름모형: 'DIAMOND',
      오각형: 'PENTAGON',
      육각형: 'HEXAGON',
      캡슐형: 'CAPSULE',
      반원형: 'HALF_MOON',
      기타: 'OTHER',
    };
    return shapeMap[koreanShape] || koreanShape;
  }

  // 검색 결과 가져오기
  const fetchSearchResults = async (isLoadMore = false) => {
    if (!isLoadMore) {
      setPage(0);
      setHasMore(true);
    }

    try {
      let response;
      let requestParams = {
        name: searchQuery,
        page: isLoadMore ? page + 1 : 0,
        size: 10,
      };

      console.log('검색 요청 파라미터:', requestParams);

      if (selectedColors.length > 0 || selectedShapes.length > 0) {
        const mappedColors = selectedColors.map(color =>
          mapColorToApiValue(color),
        );
        const mappedShapes = selectedShapes.map(shape =>
          mapShapeToApiValue(shape),
        );

        requestParams = {
          ...requestParams,
          colors: mappedColors,
          shape: mappedShapes,
        };
        response = await searchMedicineWithFilters(requestParams);
      } else {
        response = await searchMedicine(requestParams);
      }

      // 결과 없을 때 처리
      if (!response.data?.body || response.data.body.length === 0) {
        // 추가 로딩 시 결과가 없다면
        if (isLoadMore) {
          setHasMore(false);
          setLoadingMore(false);
          return;
        }

        // 초기 검색 시 결과 없음 처리
        setNoResults(true);
        setSearchResults([]);
        setHasMore(false);
        return;
      }

      // 결과 있을 때 처리
      setOriginalResponseData(prev =>
        isLoadMore ? [...prev, ...response.data.body] : response.data.body,
      );

      const formattedResults = response.data.body.map((item, index) => ({
        item_name: item.item_name,
        entp_name: item.entp_name,
        item_image: item.item_image,
        class_name: item.class_name,
        etc_otc_name: item.etc_otc_name,
        original_id: item.id,
        uniqueKey: `${item.id}_${index}`,
      }));

      console.log('포맷된 결과:', {
        resultCount: formattedResults.length,
        results: formattedResults,
      });

      // 첫 페이지면 결과 교체, 추가 로드면 기존 결과에 추가
      setSearchResults(prev =>
        isLoadMore ? [...prev, ...formattedResults] : formattedResults,
      );

      // NoResults 상태 초기화
      setNoResults(false);

      // 페이지 업데이트
      if (isLoadMore) {
        setPage(page + 1);
      }

      // 더 이상 로드할 데이터가 없으면 hasMore 상태 업데이트
      setHasMore(formattedResults.length === 10);
    } catch (err) {
      console.error('검색 중 오류:', err);

      // 추가 로딩 시 에러 처리
      if (isLoadMore) {
        setHasMore(false);
        setLoadingMore(false);
      } else {
        setError('검색 중 오류가 발생했습니다.');
        setNoResults(true);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 스크롤 이벤트 핸들러
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      fetchSearchResults(true);
    }
  };

  // 검색어나 필터가 변경될 때마다 API 호출
  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(false);
    }
  }, [searchQuery, selectedColors, selectedShapes]);

  // 필터 옵션들
  const filterOptions = {
    color: [
      '하양',
      '노랑',
      '주황',
      '분홍',
      '빨강',
      '갈색',
      '초록',
      '청록',
      '연두',
      '파랑',
      '남색',
      '보라',
      '자홍',
      '회색',
      '검정',
      '투명',
    ],
    shape: [
      '원형',
      '타원형',
      '장방형',
      '삼각형',
      '사각형',
      '마름모형',
      '오각형',
      '육각형',
      '캡슐형',
      '반원형',
      '기타',
    ],
    dosageForm: ['정제', '경질캡슐', '연질캡슐', '그 외'],
    split: ['없음', '(+)형', '(-)형'],
  };

  const openFilterModal = type => {
    setFilterModalVisible(type);
    setTempFilters(prev => ({
      ...prev,
      [type]: [
        ...(type === 'color'
          ? selectedColors
          : type === 'shape'
          ? selectedShapes
          : type === 'dosageForm'
          ? selectedDosageForms
          : selectedSplits),
      ],
    }));
  };

  const applyFilters = () => {
    // 임시 상태에서 실제 필터 상태로 적용
    setSelectedColors(tempFilters.color);
    setSelectedShapes(tempFilters.shape);
    setSelectedDosageForms(tempFilters.dosageForm);
    setSelectedSplits(tempFilters.split);
    setFilterModalVisible(false);
  };

  const handleFilterChange = (type, value) => {
    setTempFilters(prev => {
      const currentValues = [...prev[type]];
      const valueIndex = currentValues.indexOf(value);

      // 값이 이미 있으면 제거, 없으면 추가
      if (valueIndex !== -1) {
        currentValues.splice(valueIndex, 1);
      } else {
        currentValues.push(value);
      }

      return {
        ...prev,
        [type]: currentValues,
      };
    });
  };

  const getFilterButtonText = (type, selectedItems) => {
    if (selectedItems.length === 0) {
      // 선택된 항목이 없을 때
      return type === 'color'
        ? '색상'
        : type === 'shape'
        ? '모양'
        : type === 'dosageForm'
        ? '제형'
        : '분할선';
    } else if (selectedItems.length === 1) {
      // 하나만 선택되었을 때
      return selectedItems[0];
    } else {
      // 여러 개 선택되었을 때
      return `${selectedItems[0]} 외 ${selectedItems.length - 1}건`;
    }
  };

  // 필터 버튼 아이콘 렌더링
  const renderFilterButtonIcon = (type, selectedItems) => {
    if (selectedItems.length === 0) return null;

    const firstItem = selectedItems[0];

    return <ColorShapeView type={type} value={firstItem} />;
  };

  // 개별 필터 초기화
  const clearFilter = type => {
    if (type === 'color') {
      setSelectedColors([]);
      setTempFilters(prev => ({...prev, color: []}));
    } else if (type === 'shape') {
      setSelectedShapes([]);
      setTempFilters(prev => ({...prev, shape: []}));
    } else if (type === 'dosageForm') {
      setSelectedDosageForms([]);
      setTempFilters(prev => ({...prev, dosageForm: []}));
    } else if (type === 'split') {
      setSelectedSplits([]);
      setTempFilters(prev => ({...prev, split: []}));
    }
  };

  const handleSearchBarPress = () => {
    navigation.navigate('SearchMedicine');
  };

  const handleSearchResultPress = item => {
    // API 원본 데이터 찾기
    const originalItem = originalResponseData.find(
      originalItem => originalItem.id === item.original_id,
    );

    // 원본 데이터 전달
    navigation.navigate('MedicineDetail', {
      item: originalItem,
    });
  };

  return (
    <Container>
      <SearchScreenHeader
        searchQuery={searchQuery}
        onBackPress={() => navigation.goBack()}
        onSearchPress={handleSearchBarPress}
        onFilterPress={openFilterModal}
        selectedColors={selectedColors}
        selectedShapes={selectedShapes}
        selectedDosageForms={selectedDosageForms}
        selectedSplits={selectedSplits}
        onClearFilter={clearFilter}
        getFilterButtonText={getFilterButtonText}
        renderFilterButtonIcon={renderFilterButtonIcon}
      />
      {['color', 'shape', 'dosageForm', 'split'].map(type => (
        <FilterModal
          key={type}
          visible={filterModalVisible === type}
          onClose={() => setFilterModalVisible(false)}
          filterType={type}
          filterOptions={filterOptions}
          tempFilters={tempFilters}
          handleFilterChange={handleFilterChange}
          applyFilters={applyFilters}
          currentFilters={{
            color: selectedColors,
            shape: selectedShapes,
            dosageForm: selectedDosageForms,
            split: selectedSplits,
          }}
        />
      ))}
      <SearchResultContainer>
        {loading ? (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator
              size="large"
              color={themes.light.pointColor.Primary}
            />
            <Text>검색 중...</Text>
          </View>
        ) : noResults || searchResults.length === 0 ? (
          <NoSearchResults />
        ) : (
          <SearchResultsList
            searchResults={searchResults}
            handleSearchResultPress={handleSearchResultPress}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={loadingMore}
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
  margin-top: 8px;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

export default SearchMedicineResultsScreen;
