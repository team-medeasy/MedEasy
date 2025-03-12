import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { themes } from './../../styles';
import {
  ModalHeader,
  SearchBar,
  NoSearchResults,
  SearchResultsList,
} from '../../components';
import { LogoIcons } from '../../../assets/icons';
import { dummyMedicineData } from '../../../assets/data/data';

const { logo: LogoIcon } = LogoIcons;

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const HeaderContainer = styled.View`
  ${Platform.OS === 'ios' && `padding-top: 10px;`}
  padding-bottom: 10px;
  background-color: ${themes.light.bgColor.headerBG};
`;

const ChevronAndSearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-right: 16px;
  padding-left: 12px;
`;

const ChevronIconContainer = styled.View`
  margin-right: 12px;
`;

const SearchResultContainer = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const AddMedicineRoutine = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 검색어에 따라 필터링하는 함수
  const handleSearch = (query) => {
    if (!query.trim()) {
      // 검색어가 비어있으면 모든 데이터 표시
      setSearchResults(dummyMedicineData);
    } else {
      // 검색어에 맞는 데이터만 필터링
      const filteredResults = dummyMedicineData.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredResults);
    }
  };

  // 검색어가 바뀔 때마다 검색 실행
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery]);

  return (
    <Container>
      <ModalHeader>루틴 추가</ModalHeader>
      <HeaderContainer>
        <ChevronAndSearchContainer>
          <ChevronIconContainer>
            <LogoIcon width={14} height={22} style={{ color: themes.light.pointColor.Primary }} />
          </ChevronIconContainer>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={() => handleSearch(searchQuery)}
            placeholder={"복용 중인 약을 입력하세요"}
          />
        </ChevronAndSearchContainer>
      </HeaderContainer>

      <SearchResultContainer>
        {searchResults.length > 0 ? (
          <SearchResultsList
            searchResults={searchResults}
            handleSearchResultPress={() => {}}
          />
        ) : (
          <NoSearchResults />
        )}
      </SearchResultContainer>
    </Container>
  );
};

export default AddMedicineRoutine;