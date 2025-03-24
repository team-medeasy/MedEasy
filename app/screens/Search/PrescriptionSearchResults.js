import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { themes } from './../../styles';
import {
  Header,
  PrescriptionSearchResultsList,
  NoSearchResults,
  Button
} from '../../components';
import { searchMedicine } from '../../api/medicine';
import FontSizes from '../../../assets/fonts/fontSizes';

const PrescriptionSearchResultsScreen = ({ navigation }) => {
  const testSearchQuery = "술"; // 테스트용 검색어
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);
  const [dataSize, setDataSize] = useState(10);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  
  // API 응답 데이터를 저장할 상태 변수
  const [originalResponseData, setOriginalResponseData] = useState([]);

  // 검색 결과 가져오기
  const fetchSearchResults = async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setDataSize(10); // 새 검색시 데이터 크기 초기화
      setAllDataLoaded(false);
    } else {
      setLoadingMore(true);
    }
    setError(null);
  
    console.log('카메라 검색 요청 파라미터:', {
      searchQuery: testSearchQuery,
      size: isLoadMore ? dataSize + 10 : 10 // 데이터 크기 증가
    });
  
    try {
      // 기본 검색 실행
      const requestParams = {
        name: testSearchQuery,
        size: isLoadMore ? dataSize + 10 : 10 // 로드 시마다 10개씩 증가
      };
      
      console.log('검색 요청:', requestParams);
      const response = await searchMedicine(requestParams);
  
      console.log('API 응답 전체:', response);
  
      // API 응답에서 데이터 추출
      if (response.data && response.data.result && response.data.result.result_code === 200) {
        console.log('API 응답 데이터:', response.data.body);
  
        // 이전 데이터 크기와 새 데이터 크기 비교하여 모든 데이터 로드 여부 확인
        if (!response.data.body || response.data.body.length === 0) {
          setNoResults(true);
          setAllDataLoaded(true);
          setSearchResults([]);
        } else if (isLoadMore && response.data.body.length <= dataSize) {
          // 추가 로드 요청했는데 데이터가 더 안 늘어났으면 모든 데이터 로드 완료
          setAllDataLoaded(true);
        }
  
        // 원본 응답 데이터 저장
        setOriginalResponseData(response.data.body);
  
        // API 응답 데이터를 기존 앱 구조에 맞게 변환
        const formattedResults = response.data.body.map((item, index) => {
          const formatted = {
            // 기본 정보
            item_name: item.item_name,
            entp_name: item.entp_name,
            item_image: item.item_image,
            class_name: item.class_name,
            etc_otc_name: item.etc_otc_name,
            // id
            original_id: item.id,
            uniqueKey: `${item.id}_${index}` // 고유 키 생성
          };
          return formatted;
        });
  
        console.log('변환된 검색 결과:', formattedResults);
  
        // 검색 결과 설정
        setSearchResults(formattedResults);
        
        // 데이터 크기 업데이트 (추가 로드인 경우)
        if (isLoadMore) {
          setDataSize(dataSize + 10);
        }
        
        setNoResults(false);
      } else {
        console.error('API 에러 응답:', response);
        setError('검색 결과를 가져오는데 실패했습니다.');
        setNoResults(true);
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
      setNoResults(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 스크롤 이벤트 핸들러
  const handleLoadMore = () => {
    if (!loading && !loadingMore && !allDataLoaded) {
      fetchSearchResults(true);
    }
  };

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    fetchSearchResults(false);
  }, []);

  const handleSearchResultPress = item => {
    // API 원본 데이터 찾기
    const originalItem = originalResponseData.find(
      originalItem => originalItem.id === item.original_id
    );
    
    // 원본 데이터 전달
    navigation.navigate('MedicineDetail', { 
      item: originalItem,
    });
  };

  return (
    <Container>
      <Header 
        onBackPress={() => navigation.goBack()}
      >약 검색 결과</Header>

      <View style={{
        paddingHorizontal: 30,
        paddingTop: 40,
        gap: 7,
      }}>
        <Text style={{
           fontFamily: 'KimjungchulGothic-Bold', 
           fontSize: FontSizes.title.default,
           color: themes.light.textColor.textPrimary
        }}>이대로 루틴을 등록할까요?</Text>
        <Text style={{
            fontFamily: 'Pretendard-Medium',
            fontSize: FontSizes.body.default,
            color: themes.light.textColor.Primary50
        }}>메디지가 일정에 맞춰 복약 알림을 보내드릴게요!</Text>
      </View>

      <SearchResultContainer>
        {loading ? (
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" color={themes.light.pointColor.Primary} />
            <Text>검색 중...</Text>
          </View>
        ) : noResults || searchResults.length === 0 ? (
          <NoSearchResults />
        ) : (
          <PrescriptionSearchResultsList
            searchResults={searchResults}
            handleSearchResultPress={handleSearchResultPress}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={loadingMore}
          />
        )}
      </SearchResultContainer>

      <View style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 30,
        gap: 20,
        alignItems: 'center',
        backgroundColor: themes.light.bgColor.bgPrimary
      }}>
        <Button title='확인' onPress={() => {}} />
        <ModifyButton>
          <ModifyText>내용을 수정하고 싶어요.</ModifyText>
        </ModifyButton>
      </View>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const SearchResultContainer = styled.View`
  flex: 1;
  margin-top: 37px;
  margin-bottom: 120px;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const ModifyButton = styled(TouchableOpacity)`
`;

const ModifyText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.Primary50};
  text-decoration: underline;
  text-decoration-color: ${themes.light.textColor.Primary50}; 
`;

export default PrescriptionSearchResultsScreen;