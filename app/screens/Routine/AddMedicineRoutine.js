import React, { useState, useRef } from 'react';
import styled from 'styled-components/native';
import { Platform, Keyboard, View, Text, ActivityIndicator } from 'react-native';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [loadingTimer, setLoadingTimer] = useState(null);
  const loadingTimerRef = useRef(null);
  
  const [originalResponseData, setOriginalResponseData] = useState([]);

  // 검색 결과 가져오기
  const fetchSearchResults = async (isLoadMore = false) => {
    if (!isLoadMore) {
      // 기존 타이머가 있다면 정리
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      
      // 400ms 후에 로딩 상태를 true로 설정하는 타이머 생성
      const timer = setTimeout(() => {
        setLoading(true);
      }, 400);
      
      setLoadingTimer(timer);
      loadingTimerRef.current = timer;
      
      setPage(0);
      setHasMore(true);
      setHasSearched(true);
    }
  
    try {
      let response;
      let requestParams = {
        name: searchQuery,
        page: isLoadMore ? page + 1 : 0,
        size: 10
      };

      console.log('검색 요청 파라미터:', requestParams);
  
      response = await searchMedicine(requestParams);

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
        isLoadMore ? [...prev, ...response.data.body] : response.data.body
      );

      const formattedResults = response.data.body.map((item, index) => ({
        item_name: item.item_name,
        entp_name: item.entp_name,
        item_image: item.item_image,
        class_name: item.class_name,
        etc_otc_name: item.etc_otc_name,
        original_id: item.id,
        uniqueKey: `${item.id}_${index}`
      }));

      console.log('포맷된 결과:', {
        resultCount: formattedResults.length,
        results: formattedResults
      });

      // 첫 페이지면 결과 교체, 추가 로드면 기존 결과에 추가
      setSearchResults(prev => 
        isLoadMore ? [...prev, ...formattedResults] : formattedResults
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
      if (!isLoadMore) {
        // 타이머가 있다면 정리
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
        setLoading(false);
      }
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

  // 검색어 변경 핸들러
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // 검색 버튼 클릭 또는 엔터 키 누를 때 검색 실행
  const handleSearch = () => {
    Keyboard.dismiss();
    fetchSearchResults(false); // 새 검색 실행
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

  const renderContent = () => {
    // 로딩 중일 때
    if (loading) {
      return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator 
            size="large" 
            color={themes.light.pointColor.Primary} />
          <Text>검색 중...</Text>
        </View>
      );
    }
    
    // 검색이 시작되었지만 아직 로딩 중이 아닌 상태 처리
    if (loadingTimerRef.current && hasSearched && !loading) {
      // 이전 결과를 유지하거나 빈 화면 표시
      return (
        <View style={{flex: 1}}>
          {searchResults.length > 0 ? (
            <SearchResultsList
              searchResults={searchResults}
              handleSearchResultPress={handleSearchResultPress}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              refreshing={loadingMore}
            />
          ) : null}
        </View>
      );
    }
    
    // 검색 완료 후 결과가 없을 때
    if (hasSearched && (noResults || searchResults.length === 0)) {
      return <NoSearchResults />;
    }
    
    // 검색 완료 후 결과가 있을 때
    if (hasSearched) {
      return (
        <SearchResultsList
          searchResults={searchResults}
          handleSearchResultPress={handleSearchResultPress}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={loadingMore}
        />
      );
    }
    
    // 초기 상태
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      </View>
    );
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
            setSearchQuery={handleSearchChange}
            onSearch={handleSearch}
            placeholder={"복용 중인 약을 입력하세요"}
          />
        </LogoAndSearchContainer>
      </HeaderContainer>

      <SearchResultContainer>
        {renderContent()}
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
`;

export default AddMedicineRoutine;