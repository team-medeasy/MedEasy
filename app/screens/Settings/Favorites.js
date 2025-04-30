import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { Header, SearchResultsList } from '../../components';
import { getInteresedMedicine } from '../../api/interestedMedicine';
import { useNavigation } from '@react-navigation/native';

const Favorites = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // 관심 목록 데이터 가져오기
  const fetchFavorites = async (page = 0) => {
    if (isLoading || (!hasMoreData && page > 0)) return;

    try {
      setIsLoading(true);
      const response = await getInteresedMedicine({page: page, size: 10});
      
      // API 응답 구조에 맞게 처리 (data 객체 내부에 result와 body가 있음)
      if (response.data?.result?.result_code === 200) {
        const newItems = response.data.body || [];
        
        // 데이터 가공 - SearchResultsList에 맞는 형식으로 변환
        const processedItems = newItems.map(item => ({
          ...item,
          original_id: item.medicine_id,
          uniqueKey: `interested_${item.interested_medicine_id}`
        }));
        
        if (page === 0) {
          setFavorites(processedItems);
        } else {
          setFavorites(prev => [...prev, ...processedItems]);
        }
        
        // 더 불러올 데이터가 있는지 확인
        setHasMoreData(newItems.length === 10);
      } else {
        console.error('API 에러:', response);
        // 오류 처리 (필요시)
      }
    } catch (error) {
      console.error('관심 목록 불러오기 오류:', error);
      Alert.alert('오류', '관심 목록을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 최초 로딩
  useEffect(() => {
    fetchFavorites();
  }, []);

  // 페이지 포커스 될 때마다 데이터 새로고침
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCurrentPage(0);
      setHasMoreData(true);
      fetchFavorites(0);
    });

    return unsubscribe;
  }, [navigation]);

  // 스크롤 끝에 도달했을 때 추가 데이터 로드
  const handleLoadMore = () => {
    if (!isLoading && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchFavorites(nextPage);
    }
  };

  // 아이템 클릭 처리
  const handleItemPress = (item) => {
    // 상세 페이지로 이동
    navigation.navigate('MedicineDetail', { medicineId: item.medicine_id });
  };

  // 데이터가 없을 때 표시할 컴포넌트
  const renderEmptyState = () => (
    <EmptyContainer>
      <EmptyText>관심 목록에 추가된 약품이 없습니다.</EmptyText>
    </EmptyContainer>
  );

  return (
    <Container>
      <Header>관심 목록</Header>
      
      <ListContainer>
        {favorites.length > 0 ? (
          <SearchResultsList
            searchResults={favorites}
            handleSearchResultPress={handleItemPress}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={isLoading}
            footer={false}
          />
        ) : (
          !isLoading && renderEmptyState()
        )}
      </ListContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const ListContainer = styled.View`
  flex: 1;
  margin: 10px 0 20px 0;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
`;

const EmptyText = styled.Text`
  text-align: center;
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.Primary50};
`;

export default Favorites;