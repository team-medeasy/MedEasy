import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, Platform} from 'react-native';
import styled from 'styled-components/native';
import {themes} from './../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {SearchBar} from './../../components';
import {OtherIcons, HeaderIcons} from '../../../assets/icons';
import {getSearchPopular} from '../../api/search';

// AsyncStorage 키 상수 정의
const RECENT_SEARCHES_STORAGE_KEY = '@mediapp:recent_searches';

const SearchMedicineScreen = ({navigation, route}) => {
  const {fontSizeMode} = useFontSize();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [currentDate, setCurrentDate] = useState('');

  // 현재 날짜 설정
  useEffect(() => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setCurrentDate(formattedDate);
  }, []);

  const [popularSearches, setPopularSearches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSearchPopular();
        const popularData = response.data.body.slice(0, 5);
        console.log('🔥 인기 검색어:', popularData);

        const transformedData = popularData.map(item => ({
          rank: item.rank,
          term: item.keyword,
          rankChange:
            item.rank_change > 0
              ? 'up'
              : item.rank_change < 0
              ? 'down'
              : 'stay',
        }));

        setPopularSearches(transformedData); // 상태 업데이트
      } catch (error) {
        console.error('❌ 인기 검색어 가져오기 실패:', error);
      }
    };

    fetchData();
  }, []);

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
      const storedSearches = await AsyncStorage.getItem(
        RECENT_SEARCHES_STORAGE_KEY,
      );
      if (storedSearches !== null) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error('최근 검색어 로드 중 오류 발생:', error);
    }
  };

  // AsyncStorage에 최근 검색어 저장하는 함수
  const saveRecentSearches = async searches => {
    try {
      await AsyncStorage.setItem(
        RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify(searches),
      );
    } catch (error) {
      console.error('최근 검색어 저장 중 오류 발생:', error);
    }
  };

  const handleSearch = query => {
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

  const handleRecentSearchClick = query => {
    setSearchQuery(query); // 검색창에 검색어 표시
    handleSearch(query);
  };

  const handlePopularSearchClick = term => {
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
        <ChevronAndSearchContainer>
          <ChevronIconButton
            style={{padding: 12}}
            onPress={() => navigation.goBack()}>
            <HeaderIcons.chevron
              height={17}
              width={17}
              style={{color: themes.light.textColor.textPrimary}}
            />
          </ChevronIconButton>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={() => handleSearch(searchQuery)}
            placeholder={'약 이름, 증상을 입력하세요'}
          />
        </ChevronAndSearchContainer>
      </HeaderContainer>

      <SearchesContainer>
        <View>
          <SearchSectionHeader>
            <SearchTitle fontSizeMode={fontSizeMode}>최근 검색어</SearchTitle>
            <TouchableOpacity style={{padding: 12}} onPress={handleClearAll}>
              <ClearAllText fontSizeMode={fontSizeMode}>전체 삭제</ClearAllText>
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
                  <RecentSearchItemText fontSizeMode={fontSizeMode}>{item}</RecentSearchItemText>
                  <DeleteIconButton
                    style={{padding: 8}}
                    onPress={e => {
                      e.stopPropagation();
                      handleDeleteSearch(item);
                    }}>
                    <OtherIcons.delete
                      height={10}
                      width={10}
                      style={{color: themes.light.textColor.Primary50}}
                    />
                  </DeleteIconButton>
                </RecentSearchItemButton>
              ))}
            </RecentSearchListContainer>
          ) : (
            <NoRecentSearchesText fontSizeMode={fontSizeMode}>검색 기록이 없습니다.</NoRecentSearchesText>
          )}
        </View>

        <View>
          <SearchSectionHeader>
            <SearchTitle fontSizeMode={fontSizeMode}>인기 검색어</SearchTitle>
          </SearchSectionHeader>
          <PopularSearchListContainer>
            {popularSearches.map(item => (
              <PopularSearchItemButton
                key={item.rank}
                onPress={() => handlePopularSearchClick(item.term)}>
                <RankingText fontSizeMode={fontSizeMode}>{item.rank}</RankingText>
                <PopularSearchText fontSizeMode={fontSizeMode}>{item.term}</PopularSearchText>
                <IconContainer>
                  {getRankChangeIcon(item.rankChange)}
                </IconContainer>
              </PopularSearchItemButton>
            ))}
          </PopularSearchListContainer>
        </View>

        <View
          style={{
            alignSelf: 'flex-end',
            marginTop: 10,
          }}>
          <UpdateDateText fontSizeMode={fontSizeMode}>업데이트 {currentDate}</UpdateDateText>
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
`;

const ChevronIconButton = styled(TouchableOpacity)``;

const SearchesContainer = styled.View`
  margin-top: 16px;
`;

const SearchSectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-left: 25px;
  padding-right: 12px;
`;

const SearchTitle = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Semibold';
  color: ${themes.light.textColor.textPrimary};
`;

const ClearAllText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary30};
`;

const NoRecentSearchesText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Semibold';
  color: ${themes.light.textColor.Primary30};
  text-align: center;
  margin-top: 50px;
  margin-bottom: 50px;
`;

const RecentSearchListContainer = styled.ScrollView`
  padding-left: 20px;
  padding-top: 8px;
  padding-bottom: 40px;
`;

const PopularSearchListContainer = styled.View`
  margin-top: 12px;
`;

const RecentSearchItemButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  border: 1px;
  border-color: ${themes.light.borderColor.borderPrimary};
  padding: 4px 6px 4px 12px;
  border-radius: 20px;
  margin-right: 10px;
`;

const RecentSearchItemText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.textPrimary};
`;

const DeleteIconButton = styled(TouchableOpacity)``;

const PopularSearchItemButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 9px 25px 9px 25px;
`;

const RankingText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  font-family: 'Pretendard-Bold';
  font-weight: bold;
  color: ${themes.light.pointColor.Primary};
  margin-right: 20px;
`;

const PopularSearchText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
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
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  text-align: center;
  color: ${themes.light.textColor.Primary30};
`;

const UpdateDateText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode]}px;
  font-family: 'Pretendard-Medium';
  margin-right: 20px;
  color: ${themes.light.textColor.Primary30};
`;

export default SearchMedicineScreen;
