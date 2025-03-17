import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {themes} from './../../styles';
import {
  ColorShapeView,
  SearchScreenHeader,
  SearchResultsList,
  NoSearchResults,
  FilterModal
} from '../../components';

import { searchMedicine, searchMedicineWithFilters } from '../../api/medicine';
import { dummyMedicineData } from '../../../assets/data/data';

const SearchMedicineResultsScreen = ({route, navigation}) => {
  const {searchQuery} = route.params; // MedicineSearchScreen에서 전달된 검색어
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [selectedDosageForms, setSelectedDosageForms] = useState([]);
  const [selectedSplits, setSelectedSplits] = useState([]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // API 응답 데이터를 저장할 상태 변수 추가
  const [originalResponseData, setOriginalResponseData] = useState([]);

  const [tempFilters, setTempFilters] = useState({
    color: [],
    shape: [],
    dosageForm: [],
    split: [],
  });

  // useEffect(() => {
  //   // searchQuery가 존재하는지 확인하고 문자열인지 확인
  //   if (!searchQuery) {
  //     setSearchResults(dummyMedicineData);
  //     return;
  //   }

  //   const query = String(searchQuery).toLowerCase();

  //   // 필터링된 결과 생성
  //   const filteredResults = dummyMedicineData.filter(function(medicine) {
  //     const medicineName = medicine.item_name ? String(medicine.item_name).toLowerCase() : '';
  //     return medicineName.includes(query);
  //   });

  //   setSearchResults(filteredResults);
  // }, [searchQuery]);

  // 검색 결과 가져오기
  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);

    console.log('검색 요청 파라미터:', {
      searchQuery,
      selectedColors,
      selectedShapes
    });

    try {
      let response;
      let requestParams;

      if (selectedColors.length > 0 || selectedShapes.length > 0) {
        // 필터가 적용된 검색
        requestParams = {
          name: searchQuery,
          colors: selectedColors,
          shape: selectedShapes,
          size: 20
        };
        console.log('필터 적용 검색 요청:', requestParams);
        response = await searchMedicineWithFilters(requestParams);
      } else {
        // 기본 검색
        console.log('기본 검색 요청:', searchQuery);
        response = await searchMedicine(searchQuery);
      }

      console.log('API 응답 전체:', response);

      // API 응답에서 데이터 추출
      if (response.data && response.data.result && response.data.result.result_code === 200) {
        console.log('API 응답 데이터:', response.data.body);

        // 원본 응답 데이터 저장
        setOriginalResponseData(response.data.body);

        // API 응답 데이터를 기존 앱 구조에 맞게 변환
        const formattedResults = response.data.body.map(item => {
          const formatted = {
            item_seq: item.id.toString(),
            item_name: item.item_name,
            entp_name: item.entp_name,
            shape: item.shape,
            color: item.color,
            image_url: item.image_url,
            // 필요한 다른 필드가 있다면 여기에 추가
            original_id: item.id
          };
          return formatted;
        });

        console.log('변환된 검색 결과:', formattedResults);

        setSearchResults(formattedResults);
      } else {
        console.error('API 에러 응답:', response);
        setError('검색 결과를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('검색 중 오류:', err);
      if (err.response) {
        console.error('에러 응답:', err.response.data);
        console.error('에러 상태:', err.response.status);
      } else if (err.request) {
        console.error('요청 에러:', err.request);
      } else {
        console.error('에러 메시지:', err.message);
      }
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색어나 필터가 변경될 때마다 API 호출
  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
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
      '파랑',
      '남색',
      '자주',
      '보라',
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
      '팔각형',
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

    return (
      <ColorShapeView
        type={type}
        value={firstItem}
      />
    );
  };

  // 개별 필터 초기화
  const clearFilter = type => {
    if (type === 'color') {
      setSelectedColors([]);
      setTempFilters(prev => ({ ...prev, color: [] }));
    } else if (type === 'shape') {
      setSelectedShapes([]);
      setTempFilters(prev => ({ ...prev, shape: [] }));
    } else if (type === 'dosageForm') {
      setSelectedDosageForms([]);
      setTempFilters(prev => ({ ...prev, dosageForm: [] }));
    } else if (type === 'split') {
      setSelectedSplits([]);
      setTempFilters(prev => ({ ...prev, split: [] }));
    }
  };

  // 모든 필터 초기화
  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedShapes([]);
    setSelectedDosageForms([]);
    setSelectedSplits([]);
    setTempFilters({
      color: [],
      shape: [],
      dosageForm: [],
      split: [],
    });
  };

  const handleSearchBarPress = () => {
    navigation.navigate('SearchMedicine');
  };

  // 임시로 id 값 넘김
  const handleSearchResultPress = item => {
    // API 원본 데이터 찾기
    const originalItem = originalResponseData.find(
      originalItem => originalItem.id === item.original_id
    );
    
    // 원본 데이터 전달
    navigation.navigate('MedicineDetail', { 
      medicineData: originalItem,
      itemSeq: originalItem.item_seq
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
          renderFilterButtonIcon={renderFilterButtonIcon}
        />
      ))}
      <SearchResultContainer>
        {searchResults.length > 0 ? (
          <SearchResultsList
            searchResults={searchResults}
            handleSearchResultPress={handleSearchResultPress}
          />
        ) : (
          <NoSearchResults />
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

export default SearchMedicineResultsScreen;
