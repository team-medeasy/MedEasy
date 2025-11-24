import React from 'react';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SearchResultItem} from './SearchResultItem';
import {Footer} from './../index';
import {FlatList, ActivityIndicator, Platform, Dimensions} from 'react-native';
import {themes} from '../../styles';

export const SearchResultsList = ({
  searchResults,
  handleSearchResultPress,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing,
  footer = true,
  useBottomInset = false,
}) => {
  const insets = useSafeAreaInsets(); // ✅ safe area inset 사용

  // 화면 높이 구하기
  const windowHeight = Dimensions.get('window').height;
  
  // 아이템 컴포넌트와 Footer 렌더링
  const renderItem = ({item}) => (
    <SearchResultItem item={item} onPress={handleSearchResultPress} />
  );
  
  // 일반적인 방식으로 FlatList 사용 (결과가 4개 이상일 때)
  if (searchResults.length >= 4) {
    return (
      <Container>
        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) =>
              item.uniqueKey || `item_${item.original_id}_${index}`
            }
            renderItem={renderItem}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            contentContainerStyle={{
              paddingBottom:
                useBottomInset
                  ? Platform.OS === 'android'
                    ? insets.bottom + 10
                    : insets.bottom
                  : 0,
            }}
            ListFooterComponent={() => (
              <>
                {refreshing && (
                  <LoadingContainer>
                    <ActivityIndicator
                      size="small"
                      color={themes.light.pointColor.Primary}
                    />
                  </LoadingContainer>
                )}
                {footer && <Footer />}
              </>
            )}
          />
        )}
      </Container>
    );
  }
  
  // 결과가 적을 때 (1-3개) ScrollView 대신 직접 배치하여 Footer 고정
  return (
    <FullHeightContainer>
      <ResultsContainer>
        {searchResults.map((item, index) => (
          <SearchResultItem 
            key={item.uniqueKey || `item_${item.original_id}_${index}`}
            item={item} 
            onPress={handleSearchResultPress} 
          />
        ))}
      </ResultsContainer>
      
      <FooterWrapper>
        {refreshing && (
          <LoadingContainer>
            <ActivityIndicator
              size="small"
              color={themes.light.pointColor.Primary}
            />
          </LoadingContainer>
        )}
        {footer && <Footer />}
      </FooterWrapper>
    </FullHeightContainer>
  );
};

const Container = styled.View`
  flex: 1;
`;

// 전체 높이를 차지하는 컨테이너
const FullHeightContainer = styled.View`
  flex: 1;
  justify-content: space-between;
`;

// 상단에 결과를 보여주는 컨테이너
const ResultsContainer = styled.View`
  flex-grow: 0;
`;

// Footer를 하단에 고정하는 래퍼
const FooterWrapper = styled.View`
  margin-top: auto;
`;

const LoadingContainer = styled.View`
  padding: 10px;
  align-items: center;
`;