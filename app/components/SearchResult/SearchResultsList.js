import React from 'react';
import styled from 'styled-components/native';
import {SearchResultItem} from './SearchResultItem';
import {Footer} from './../index';
import {FlatList, ActivityIndicator, View} from 'react-native';
import {themes} from '../../styles';

export const SearchResultsList = ({
  searchResults,
  handleSearchResultPress,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing,
  footer = true,
}) => {
  return (
    <Container>
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) =>
            item.uniqueKey || `item_${item.original_id}_${index}`
          }
          renderItem={({item}) => (
            <SearchResultItem item={item} onPress={handleSearchResultPress} />
          )}
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
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
              {footer && (
                 <Footer />
              )}
            </>
          )}
        />
      )}
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
`;

const LoadingContainer = styled.View`
  padding: 0px;
  align-items: center;
`;
