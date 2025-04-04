import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {themes, pointColor} from './../../styles';

import {SearchBar} from './../../components/SearchBar';
import {OtherIcons, LogoIcons} from '../../../assets/icons';
import FontSizes from '../../../assets/fonts/fontSizes';

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const HeaderContainer = styled.View`
  padding-top: 70px;
  padding-bottom: 7px;
  background-color: ${themes.light.bgColor.headerBG};
`;

const LogoAndSearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-right: 15px;
  padding-left: 12px;
`;

const LogoIconContainer = styled.View`
  margin-right: 12px;
`;

const SearchesContainer = styled.View`
  margin-top: 25px;
`;

const RecentSearchesContainer = styled.View``;

const PopularSearchContainer = styled.View``;

const SearchSectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-left: 25px;
  padding-right: 25px;
`;

const SearchTitle = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Semibold';
  color: ${themes.light.textColor.textPrimary};
`;

const ClearAllButton = styled(TouchableOpacity)``;

const ClearAllText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary30};
`;

const NoRecentSearchesText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Semibold';
  color: ${themes.light.textColor.Primary30};
  text-align: center;
  margin-top: 50px;
  margin-bottom: 50px;
`;

const RecentSearchListContainer = styled.ScrollView`
  padding-left: 20px;
  padding-top: 20px;
  padding-bottom: 40px;
`;

const PopularSearchListContainer = styled.View`
  margin-top: 20px;
  gap: 18px;
`;

const RecentSearchItemButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  border: 1px;
  border-color: ${themes.light.borderColor.borderPrimary};
  padding: 8px 15px 7px 14px;
  border-radius: 20px;
  margin-right: 10px;
`;

const RecentSearchItemText = styled.Text`
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.textPrimary};
`;

const DeleteIconButton = styled(TouchableOpacity)`
  margin-left: 10px;
`;

const PopularSearchItemButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 0 25px 0 25px;
`;

const RankingText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Bold';
  font-weight: bold;
  color: ${pointColor.pointPrimary};
  margin-right: 20px;
`;

const PopularSearchText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.textPrimary};
  flex: 1;
`;

const IconContainer = styled.View`
  width: 9.14px;
  height: 17px;
  justify-content: center;
  align-items: center;
`;

const RankingStayText = styled.Text`
  font-size: ${FontSizes.body.default};
  text-align: center;
  color: ${themes.light.textColor.Primary30};
`;

const UpdateDateContainer = styled.View`
  font-family: 'Pretendard-Medium';
  align-self: flex-end;
  margin-top: 10px;
`;

const UpdateDateText = styled.Text`
  font-size: 11px;
  font-family: 'Pretendard-Medium';
  margin-right: 20px;
  color: ${themes.light.textColor.Primary30};
`;

const Search = ({navigation, route}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  // 인기 검색어 (임시)데이터
  const popularSearches = [
    {rank: 1, term: '소화제', rankChange: 'up'},
    {rank: 2, term: '베스타제당의정', rankChange: 'stay'},
    {rank: 3, term: '해열제', rankChange: 'down'},
    {rank: 4, term: '타이레놀', rankChange: 'up'},
    {rank: 5, term: '제산제', rankChange: 'stay'},
  ];

  const handleSearch = query => {
    if (query.trim() !== '') {
      const updatedSearches = [
        query,
        ...recentSearches.filter(item => item !== query),
      ];
      setRecentSearches(updatedSearches);
      setSearchQuery(''); // 검색 후 입력 필드 초기화

      navigation.navigate('SearchMedicineResults', {
        searchQuery: query,
        recentSearches: updatedSearches,
      });
    }
  };

  const handleRecentSearchClick = query => {
    handleSearch(query);
  };

  const handlePopularSearchClick = term => {
    handleSearch(term);
  };

  const handleDeleteSearch = query => {
    setRecentSearches(recentSearches.filter(item => item !== query));
  };

  const handleClearAll = () => {
    setRecentSearches([]);
  };

  const getRankChangeIcon = rankChange => {
    switch (rankChange) {
      case 'up':
        return (
          <OtherIcons.rankingUp
            width={9.14}
            height={17}
            style={{color: themes.light.pointColor.Secondary}}
          />
        );
      case 'down':
        return (
          <OtherIcons.rankingDown
            width={9.14}
            height={17}
            style={{color: themes.light.pointColor.Primary}}
          />
        );
      case 'stay':
        return <RankingStayText>-</RankingStayText>;
      default:
        return null;
    }
  };

  return (
    <Container>
      <HeaderContainer>
        <LogoAndSearchContainer>
          <LogoIconContainer>
            <LogoIcons.logo
              height={17}
              width={17}
              style={{color: themes.light.textColor.textPrimary}}
            />
          </LogoIconContainer>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={() => handleSearch(searchQuery)}
          />
        </LogoAndSearchContainer>
      </HeaderContainer>
      <SearchesContainer>
        <RecentSearchesContainer>
          <SearchSectionHeader>
            <SearchTitle>최근 검색어</SearchTitle>
            <ClearAllButton onPress={handleClearAll}>
              <ClearAllText>전체 삭제</ClearAllText>
            </ClearAllButton>
          </SearchSectionHeader>
          {recentSearches.length > 0 ? (
            <RecentSearchListContainer
              horizontal
              showsHorizontalScrollIndicator={false}>
              {recentSearches.map((item, index) => (
                <RecentSearchItemButton
                  key={index}
                  onPress={() => handleRecentSearchClick(item)}>
                  <RecentSearchItemText>{item}</RecentSearchItemText>
                  <DeleteIconButton
                    onPress={e => {
                      e.stopPropagation();
                      handleDeleteSearch(item);
                    }}>
                    <OtherIcons.delete
                      height={10}
                      width={10}
                      style={{color: themes.light.textColor.textPrimary}}
                    />
                  </DeleteIconButton>
                </RecentSearchItemButton>
              ))}
            </RecentSearchListContainer>
          ) : (
            <NoRecentSearchesText>검색 기록이 없습니다.</NoRecentSearchesText>
          )}
        </RecentSearchesContainer>
        <PopularSearchContainer>
          <SearchSectionHeader>
            <SearchTitle>인기 검색어</SearchTitle>
          </SearchSectionHeader>
          <PopularSearchListContainer>
            {popularSearches.map(item => (
              <PopularSearchItemButton
                key={item.rank}
                onPress={() => handlePopularSearchClick(item.term)}>
                <RankingText>{item.rank}</RankingText>
                <PopularSearchText>{item.term}</PopularSearchText>
                <IconContainer>
                  {getRankChangeIcon(item.rankChange)}
                </IconContainer>
              </PopularSearchItemButton>
            ))}
          </PopularSearchListContainer>
          <UpdateDateContainer>
            <UpdateDateText>업데이트 2025-02-13</UpdateDateText>
          </UpdateDateContainer>
        </PopularSearchContainer>
      </SearchesContainer>
    </Container>
  );
};

export default Search;
