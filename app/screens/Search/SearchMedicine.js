import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { themes, pointColor } from './../../styles';

import Delete from './../../../assets/icons/delete.svg';
import Chevron from './../../../assets/icons/header/chevron.svg';
import SearchBar from './../../components/SearchBar';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const ChevronAndSearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-right: 15px;
  padding-left: 12px;
  margin-bottom: 7px;
`;

const ChevronIconButton = styled(TouchableOpacity)`
  margin-right: 12px;
`;

const RecentSearchesContainer = styled.View`
  margin-top: 25px;
`;

const RecentSearchHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-left: 25px;
  padding-right: 25px;
`;

const RecentSearchTitle = styled.Text`
  font-size: 16px;
  font-family: 'Pretendard-Semibold';
  color: ${themes.light.textColor.textPrimary};
`;

const ClearAllButton = styled(TouchableOpacity)``;

const ClearAllText = styled.Text`
  font-size: 14px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.textPrimary};
`;

const NoRecentSearchesText = styled.Text`
  font-size: 14px;
  color: #0004;
  text-align: center;
  margin-top: 60px;
`;

const ScrollContainer = styled.ScrollView`
  padding-left: 20px;
`;

const SearchItemButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  border: 1px;
  border-color: ${themes.light.borderColor.borderPrimary};
  padding: 8px 15px 7px 14px;
  border-radius: 20px;
  margin-right: 10px;
`;

const SearchItemText = styled.Text`
  font-size: 14px;
  color: ${themes.light.textColor.textPrimary};
`;

const DeleteIconButton = styled(TouchableOpacity)`
  margin-left: 10px;
`;

const SearchMedicineScreen = ({ navigation, route }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);

    const handleSearch = () => {
      if (searchQuery.trim() !== '') {
          const updatedSearches = [searchQuery, ...recentSearches.filter(item => item !== searchQuery)];
          setRecentSearches(updatedSearches);
          navigation.navigate('SearchMedicineResults', { 
              searchQuery,
              recentSearches: updatedSearches 
          });
      }
    };

    const handleRecentSearchClick = (query) => {
      const updatedSearches = [query, ...recentSearches.filter(item => item !== query)];
      setRecentSearches(updatedSearches);
      navigation.navigate('SearchMedicineResults', { 
          searchQuery: query,
          recentSearches: updatedSearches 
      });
    };

    const handleDeleteSearch = (query) => {
        setRecentSearches(recentSearches.filter(item => item !== query));
    };

    const handleClearAll = () => {
        setRecentSearches([]);
    };

    return (
      <Container>
        <ChevronAndSearchContainer>
            <ChevronIconButton>
                <Chevron height={17} width={17}/>
            </ChevronIconButton>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
        </ChevronAndSearchContainer>

        <RecentSearchesContainer>
            <RecentSearchHeader>
                <RecentSearchTitle>최근 검색어</RecentSearchTitle>
                <ClearAllButton onPress={handleClearAll}>
                    <ClearAllText>전체 삭제</ClearAllText>
                </ClearAllButton>
            </RecentSearchHeader>
            
            {recentSearches.length > 0 ? (
                <ScrollContainer
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    {recentSearches.map((item, index) => (
                        <SearchItemButton key={index} onPress={() => handleRecentSearchClick(item)}>
                            <SearchItemText>{item}</SearchItemText>
                            <DeleteIconButton onPress={(e) => {
                                e.stopPropagation();
                                handleDeleteSearch(item);
                            }}>
                                <Delete height={10} width={10}/>
                            </DeleteIconButton>
                        </SearchItemButton>
                    ))}
                </ScrollContainer>
            ) : (
                <NoRecentSearchesText>검색 기록이 없습니다.</NoRecentSearchesText>
            )}
        </RecentSearchesContainer>
      </Container>
    );
};

export default SearchMedicineScreen;