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

const AddMedicineRoutine = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 검색어에 따라 필터링하는 함수
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults(dummyMedicineData);
    } else {
      const filteredResults = dummyMedicineData.filter(medicine =>
        medicine.item_name?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredResults);
    }
  };  

  // 검색어가 바뀔 때마다 검색 실행
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery]);

  // 임시로 item_seq 값 넘김 + Modal화면 띄우기 요청 + title 지정
  const handleSearchResultPress = itemSeq => {
    navigation.navigate('MedicineDetail', {itemSeq, isModal: true, title: '루틴 추가'});
  };

  return (
    <Container>
      <ModalHeader>루틴 추가</ModalHeader>
      <HeaderContainer>
        <LogoAndSearchContainer>
          <LogoIconContainer>
            <LogoIcons.logo width={14} height={22} style={{ color: themes.light.pointColor.Primary }} />
          </LogoIconContainer>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={() => handleSearch(searchQuery)}
            placeholder={"복용 중인 약을 입력하세요"}
          />
        </LogoAndSearchContainer>
      </HeaderContainer>

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

const HeaderContainer = styled.View`
  ${Platform.OS === 'ios' && `padding-top: 10px;`}
  padding-bottom: 10px;
  background-color: ${themes.light.bgColor.headerBG};
`;

const LogoAndSearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-right: 16px;
  padding-left: 12px;
`;

const LogoIconContainer = styled.View`
  margin-right: 12px;
`;

const SearchResultContainer = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
  margin-top: 16px;
`;

export default AddMedicineRoutine;