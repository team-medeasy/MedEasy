import React from 'react';
import styled from 'styled-components/native';
import {SearchResultItem} from './SearchResultItem';
import {Footer} from './../index';
import {FlatList} from 'react-native';

export const SearchResultsList = ({searchResults, handleSearchResultPress}) => {
  return (
    <Container>
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.item_seq}
          renderItem={({item}) => (
            <SearchResultItem item={item} onPress={handleSearchResultPress} />
          )}
          ListFooterComponent={() => <Footer />}
        />
      )}
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
`;