import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {View, ActivityIndicator, Text} from 'react-native';
import {themes} from './../../styles';
import {
  Header,
  CameraSearchResultsList,
  NoSearchResults,
} from '../../components';

const CameraSearchResultsScreen = ({route, navigation}) => {
  const {searchResults} = route.params || {};

  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    if (!searchResults || searchResults.length === 0) {
      setNoResults(true);
    }
  }, [searchResults]);

  const handleSearchResultPress = item => {
    navigation.navigate('MedicineDetail', {item});
  };

  return (
    <Container>
      <Header onBackPress={() => navigation.goBack()}>약 검색 결과</Header>

      <SearchResultContainer>
        {loading ? (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator
              size="large"
              color={themes.light.pointColor.Primary}
            />
            <Text>검색 중...</Text>
          </View>
        ) : noResults || searchResults.length === 0 ? (
          <NoSearchResults />
        ) : (
          <CameraSearchResultsList
            searchResults={searchResults}
            handleSearchResultPress={handleSearchResultPress}
            onEndReachedThreshold={0.5}
            refreshing={loading}
          />
        )}
      </SearchResultContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const SearchResultContainer = styled.View`
  flex: 1;
  margin-top: 16px;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

export default CameraSearchResultsScreen;
