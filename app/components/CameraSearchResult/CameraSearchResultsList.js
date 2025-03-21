import React from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { themes } from '../../styles';
import { CameraSearchResultItem } from './CameraSearchResultItem';

export const CameraSearchResultsList = ({ 
  searchResults,
  handleSearchResultPress,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing
 }) => {
  return (
    <ResultsContainer>
      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => item.uniqueKey || `item_${item.original_id}_${index}`}
        renderItem={({item}) => (
          <CameraSearchResultItem item={item} onPress={handleSearchResultPress} />
        )}
        showsVerticalScrollIndicator={false}

        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        ListFooterComponent={() => (
          <>
            {refreshing && (
              <LoadingContainer>
                <ActivityIndicator size="small" color={themes.light.pointColor.Primary} />
              </LoadingContainer>
            )}
          </>
        )}
      />
    </ResultsContainer>
  );
};

const ResultsContainer = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 15px;
`;

const LoadingContainer = styled.View`
  padding: 10px;
  align-items: center;
`;