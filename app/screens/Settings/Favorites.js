import React, {useState, useRef, useEffect} from 'react';
import {Alert, ActivityIndicator, View, Text} from 'react-native';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {Header, SearchResultsList} from '../../components';
import {getInteresedMedicine} from '../../api/interestedMedicine';
import {useNavigation} from '@react-navigation/native';
import {Images} from '../../../assets/icons';
import EmptyState from '../../components/EmptyState';

const Favorites = () => {
  const navigation = useNavigation();

  // 데이터 상태 관리
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 로딩 상태 관리
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState(null);
  const loadingTimerRef = useRef(null);

  // 에러 및 결과 상태 관리
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 관심 목록 데이터 가져오기
  const fetchFavorites = async (isLoadMore = false) => {
    if (!isLoadMore) {
      // 기존 타이머가 있다면 정리
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }

      // 400ms 후에 로딩 상태를 true로 설정하는 타이머 생성
      // 이렇게 하면 빠른 응답에 대해서는 로딩 UI가 깜빡이지 않음
      const timer = setTimeout(() => {
        setLoading(true);
      }, 400);

      setLoadingTimer(timer);
      loadingTimerRef.current = timer;

      setPage(0);
      setHasMore(true);
    }

    try {
      // 요청 파라미터
      const requestParams = {
        page: isLoadMore ? page + 1 : 0,
        size: 10,
      };

      console.log('API 호출 파라미터:', requestParams);

      // API 호출
      const response = await getInteresedMedicine(requestParams);
      console.log('API 응답:', response);

      // API 응답 검증
      if (response.data?.result?.result_code === 200) {
        const newItems = response.data.body || [];

        // 결과 없을 때 처리
        if (newItems.length === 0) {
          // 추가 로딩 시 결과가 없다면
          if (isLoadMore) {
            setHasMore(false);
            setLoadingMore(false);
            return;
          }

          // 초기 로딩 시 결과 없음 처리
          setNoResults(true);
          setFavorites([]);
          setHasMore(false);
          setHasLoaded(true);
          return;
        }

        // 데이터 가공 - SearchResultsList에 맞는 형식으로 변환
        const processedItems = newItems.map((item, index) => ({
          ...item,
          original_id: item.medicine_id,
          uniqueKey: `interested_${item.interested_medicine_id}_${
            isLoadMore ? page + 1 : 0
          }_${index}`,
        }));

        // 첫 페이지면 결과 교체, 추가 로드면 기존 결과에 추가
        setFavorites(prev =>
          isLoadMore ? [...prev, ...processedItems] : processedItems,
        );

        // NoResults 상태 초기화
        setNoResults(false);

        // 페이지 업데이트
        if (isLoadMore) {
          setPage(page + 1);
        }

        // 더 이상 로드할 데이터가 없으면 hasMore 상태 업데이트
        setHasMore(newItems.length === 10);
        setHasLoaded(true);
      } else {
        console.warn('API 응답 코드가 200이 아님:', response.data?.result);

        // 추가 로딩 시 에러 처리
        if (isLoadMore) {
          setHasMore(false);
          setLoadingMore(false);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
          setNoResults(true);
          setFavorites([]);
        }
      }
    } catch (error) {
      console.error('관심 목록 불러오기 오류:', error);
      console.error(
        '오류 세부 정보:',
        error.response || error.request || error.message,
      );

      // 추가 로딩 시 에러 처리
      if (isLoadMore) {
        setHasMore(false);
        setLoadingMore(false);
      } else {
        setError('관심 목록을 불러오는 중 문제가 발생했습니다');
        setNoResults(true);
        setFavorites([]);
      }

      // 개발 모드에서만 Alert 표시 (선택사항)
      if (__DEV__) {
        Alert.alert(
          '오류',
          '관심 목록을 불러오는 중 문제가 발생했습니다.\n' +
            '(개발자 정보: API 서버 응답 오류)',
        );
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

  // 페이지 포커스 될 때마다 데이터 새로고침
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFavorites(false);
    });

    return unsubscribe;
  }, [navigation]);

  // 수동 새로고침 처리
  const handleRefresh = () => {
    fetchFavorites(false);
  };

  // 스크롤 끝에 도달했을 때 추가 데이터 로드
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      fetchFavorites(true);
    }
  };

  // 아이템 클릭 처리
  const handleItemPress = item => {
    // 상세 페이지로 이동
    navigation.navigate('MedicineDetail', {medicineId: item.medicine_id});
  };

  // 화면 콘텐츠 렌더링 처리
  const renderContent = () => {
    // 로딩 중일 때
    if (loading) {
      return (
        <LoadingContainer>
          <ActivityIndicator
            size="large"
            color={themes.light.pointColor.Primary}
          />
          <LoadingText>데이터를 불러오는 중...</LoadingText>
        </LoadingContainer>
      );
    }

    // 데이터 로딩은 완료되었지만 타이머로 인해 로딩 UI가 표시되지 않는 상태
    if (loadingTimerRef.current && hasLoaded && !loading) {
      // 이전 결과를 유지하거나 빈 화면 표시
      return (
        <View style={{flex: 1}}>
          {favorites.length > 0 ? (
            <SearchResultsList
              searchResults={favorites}
              handleSearchResultPress={handleItemPress}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              refreshing={loadingMore}
              onRefresh={handleRefresh}
              footer={false}
            />
          ) : null}
        </View>
      );
    }

    // 데이터 로딩 완료 후 결과가 없을 때
    if (hasLoaded && (noResults || favorites.length === 0)) {
      return (
        <EmptyContainer>
          {error ? (
            <EmptyText>{error}</EmptyText>
          ) : (
            <EmptyState
              image={<Images.emptyLike style={{marginBottom: 32}} />}
              title="관심 목록에 의약품이 없습니다."
              description={`약을 검색하고\n관심 목록에 추가해 보세요.`}
            />
          )}

          {error && (
            <RetryButton onPress={handleRefresh}>
              <RetryButtonText>다시 시도</RetryButtonText>
            </RetryButton>
          )}
        </EmptyContainer>
      );
    }

    // 데이터 로딩 완료 후 결과가 있을 때
    if (hasLoaded) {
      return (
        <SearchResultsList
          searchResults={favorites}
          handleSearchResultPress={handleItemPress}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={loadingMore}
          onRefresh={handleRefresh}
          footer={false}
        />
      );
    }

    // 초기 상태 (아직 로딩 시작 안함)
    return (
      <LoadingContainer>
        <ActivityIndicator
          size="small"
          color={themes.light.pointColor.Primary}
        />
        <LoadingText>준비 중...</LoadingText>
      </LoadingContainer>
    );
  };

  return (
    <Container>
      <Header>관심 목록</Header>
      <ListContainer>{renderContent()}</ListContainer>
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

const RetryButton = styled.TouchableOpacity`
  margin-top: 16px;
  padding: 10px 20px;
  background-color: ${themes.light.bgColor.bgSecondary};
  border-radius: 8px;
`;

const RetryButtonText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.small};
  color: ${themes.light.textColor.Secondary};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  margin-top: 10px;
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.small};
  color: ${themes.light.textColor.Primary50};
`;

export default Favorites;
