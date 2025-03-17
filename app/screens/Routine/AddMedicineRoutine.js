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
import { searchMedicine } from '../../api/medicine';

const AddMedicineRoutine = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalResponseData, setOriginalResponseData] = useState([]);

    // 검색 결과 가져오기
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
  
      console.log('검색 요청 파라미터:', {
        searchQuery,
      });
  
      try {
        // 기본 검색만 수행
        const response = await searchMedicine(searchQuery);
        console.log('API 응답 전체:', response);
  
        // API 응답에서 데이터 추출
        if (response.data && response.data.result && response.data.result.result_code === 200) {
          console.log('API 응답 데이터:', response.data.body);
  
          // 원본 응답 데이터 저장
          setOriginalResponseData(response.data.body);
  
          // API 응답 데이터를 기존 앱 구조에 맞게 변환
          const formattedResults = response.data.body.map(item => {
            const formatted = {
              item_name: item.item_name,
              entp_name: item.entp_name,
              item_image: item.item_image,
              class_name: item.class_name,
              etc_otc_name: item.etc_otc_name,
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

  // 검색어가 바뀔 때마다 검색 실행
  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    } else {
      // 검색어가 비어있으면 결과 초기화
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSearchResultPress = item => {
    // API 원본 데이터 찾기
    const originalItem = originalResponseData.find(
      originalItem => originalItem.id === item.original_id
    );
    
    // 원본 데이터 전달
    navigation.navigate('MedicineDetail', { 
      item: originalItem,
      isModal: true, 
      title: '루틴 추가'
    });
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