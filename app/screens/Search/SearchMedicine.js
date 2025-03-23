import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, Platform} from 'react-native';
import styled from 'styled-components/native';
import {themes} from './../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {SearchBar} from './../../components';
import {OtherIcons, HeaderIcons} from '../../../assets/icons';

// AsyncStorage 키 상수 정의
const RECENT_SEARCHES_STORAGE_KEY = '@mediapp:recent_searches';

const SearchMedicineScreen = ({navigation, route}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [currentDate, setCurrentDate] = useState('');

  // 현재 날짜 설정
  useEffect(() => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setCurrentDate(formattedDate);
  }, []);

  // 인기 검색어 (임시)데이터
  const popularSearches = [
    {rank: 1, term: '소화제', rankChange: 'up'},
    {rank: 2, term: '베스타제당의정', rankChange: 'stay'},
    {rank: 3, term: '해열제', rankChange: 'down'},
    {rank: 4, term: '타이레놀', rankChange: 'up'},
    {rank: 5, term: '제산제', rankChange: 'stay'},
  ];

  // 컴포넌트 마운트 시 AsyncStorage에서 최근 검색어 로드
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // route.params로부터 업데이트된 검색어 목록을 받아오는 로직
  useEffect(() => {
    if (route.params?.updatedSearches) {
      setRecentSearches(route.params.updatedSearches);
    }
  }, [route.params?.updatedSearches]);

  // AsyncStorage에서 최근 검색어 로드하는 함수
  const loadRecentSearches = async () => {
    try {
      const storedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (storedSearches !== null) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error('최근 검색어 로드 중 오류 발생:', error);
    }
  };

  // AsyncStorage에 최근 검색어 저장하는 함수
  const saveRecentSearches = async (searches) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('최근 검색어 저장 중 오류 발생:', error);
    }
  };

  const handleSearch = (query) => {
    if (query.trim() !== '') {
      // 중복 검색어 제거하고 맨 앞에 새 검색어 추가
      const updatedSearches = [
        query,
        ...recentSearches.filter(item => item !== query),
      ].slice(0, 10); // 최대 10개까지만 유지
      
      // 상태 업데이트 및 AsyncStorage에 저장
      setRecentSearches(updatedSearches);
      saveRecentSearches(updatedSearches);
      
      navigation.replace('SearchMedicineResults', {
        searchQuery: query,
      });
    }
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query); // 검색창에 검색어 표시
    handleSearch(query);
  };

  const handlePopularSearchClick = (term) => {
    setSearchQuery(term); // 검색창에 검색어 표시
    handleSearch(term);
  };

  const handleDeleteSearch = query => {
    const updatedSearches = recentSearches.filter(item => item !== query);
    setRecentSearches(updatedSearches);
    saveRecentSearches(updatedSearches);
  };

  const handleClearAll = () => {
    setRecentSearches([]);
    saveRecentSearches([]);
  };

  const getRankChangeIcon = rankChange => {
    switch (rankChange) {
      case 'up':
        return <OtherIcons.rankingUp width={9.14} height={17} style={{color: themes.light.pointColor.Secondary}}/>;
      case 'down':
        return <OtherIcons.rankingDown width={9.14} height={17} style={{color: themes.light.pointColor.Primary}}/>;
      case 'stay':
        return <RankingStayText>-</RankingStayText>;
      default:
        return null;
    }
  };

  return (
    <Container>

      <HeaderContainer>
        <ChevronAndSearchContainer>
          <ChevronIconButton onPress={() => navigation.goBack()}>
            <HeaderIcons.chevron height={17} width={17} style={{color: themes.light.textColor.textPrimary}}/>
          </ChevronIconButton>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={() => handleSearch(searchQuery)}
            placeholder={"약 이름, 증상을 입력하세요"}
          />
        </ChevronAndSearchContainer>
      </HeaderContainer>

      <SearchesContainer>
        <View>
          <SearchSectionHeader>
            <SearchTitle>최근 검색어</SearchTitle>
            <TouchableOpacity onPress={handleClearAll}>
              <ClearAllText>전체 삭제</ClearAllText>
            </TouchableOpacity>
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
                    <OtherIcons.delete height={10} width={10} style={{color: themes.light.textColor.Primary50}}/>
                  </DeleteIconButton>
                </RecentSearchItemButton>
              ))}
            </RecentSearchListContainer>
          ) : (
            <NoRecentSearchesText>검색 기록이 없습니다.</NoRecentSearchesText>
          )}
        </View>

        <View>
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
        </View>

        <View style={{
          alignSelf: 'flex-end',
          marginTop: 10
        }}>
          <UpdateDateText>업데이트 {currentDate}</UpdateDateText>
        </View>
      </SearchesContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const HeaderContainer = styled.View`
  ${Platform.OS === 'ios' && `padding-top: 70px;`}
  ${Platform.OS === 'android' && `padding-top: 30px;`}
  padding-bottom: 7px;
  background-color: ${themes.light.bgColor.headerBG};
`;

const ChevronAndSearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-right: 15px;
  padding-left: 12px;
`;

const ChevronIconButton = styled(TouchableOpacity)`
  margin-right: 12px;
`;

const SearchesContainer = styled.View`
  margin-top: 25px;
`;

const SearchSectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-left: 25px;
  padding-right: 25px;
`;

const SearchTitle = styled.Text`
  font-size: 16px;
  font-family: 'Pretendard-Semibold';
  color: ${themes.light.textColor.textPrimary};
`;

const ClearAllText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary30};
`;

const NoRecentSearchesText = styled.Text`
  font-size: 14px;
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
  font-size: 14px;
  font-family: 'Pretendard-Medium';
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
  font-size: ${FontSizes.caption.large};
  font-family: 'Pretendard-Bold';
  font-weight: bold;
  color: ${themes.light.pointColor.Primary};
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
  font-size: 14px;
  text-align: center;
  color: ${themes.light.textColor.Primary30};
`;

const UpdateDateText = styled.Text`
  font-size: ${FontSizes.caption.default};
  font-family: 'Pretendard-Medium';
  margin-right: 20px;
  color: ${themes.light.textColor.Primary30};
`;

export default SearchMedicineScreen;