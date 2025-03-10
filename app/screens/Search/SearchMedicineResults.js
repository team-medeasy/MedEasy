import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {themes} from './../../styles';
import { ColorShapeView} from '../../components';

import SearchResultsList from './../../components/SearchResult/SearchResultsList'; // Import SearchResultsList
import NoSearchResults from '../../components/SearchResult/NoSearchResults';
import SearchScreenHeader from '../../components/SearchResult/SearchScreenHeader';
import FilterModal from '../../components/SearchResult/FilterModal';

import { dummyMedicineData } from '../../../assets/data/data';

const SearchMedicineResultsScreen = ({route, navigation}) => {
  const {searchQuery} = route.params; // MedicineSearchScreen에서 전달된 검색어
  const [searchResults, setSearchResults] = useState([]);

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [selectedDosageForms, setSelectedDosageForms] = useState([]);
  const [selectedSplits, setSelectedSplits] = useState([]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [tempFilters, setTempFilters] = useState({
    color: [],
    shape: [],
    dosageForm: [],
    split: [],
  });

  useEffect(() => {
    setSearchResults(dummyMedicineData);
  }, [searchQuery]);

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
  const handleSearchResultPress = itemSeq => {
    navigation.navigate('MedicineDetail', {itemSeq});
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
