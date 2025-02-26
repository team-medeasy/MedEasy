import React, {useState, useEffect} from 'react';
import {
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  View,
  Text,
} from 'react-native';
import styled from 'styled-components/native';
import {themes, pointColor} from './../../styles';
import {Footer, Tag, Button} from './../../components';
import {HeaderIcons, OtherIcons} from '../../../assets/icons';

const {chevron: ChevronIcon} = HeaderIcons;
const {chevronDown: ChevronDownIcon} = OtherIcons;

const SearchMedicineResultsScreen = ({route, navigation}) => {
  const {searchQuery} = route.params; // MedicineSearchScreen에서 전달된 검색어
  const [searchResults, setSearchResults] = useState([]);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    color: null,
    shape: null,
    size: null,
    split: null
  });

  useEffect(() => {
    // 임시 데이터
    const dummyData = [
      {
        id: '1',
        item_name: '지엘타이밍정(카페인무수물)',
        item_image:
          'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1NAT_bwbZd9',
        entp_name: '지엘파마(주)',
        etc_otc_name: '일반의약품',
        class_name: '각성제',
      },
      {
        id: '2',
        item_name: '베스타제당의정',
        item_image:
          'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1MoApPycZgS',
        entp_name: '동야제약(주)',
        etc_otc_name: '일반의약품',
        class_name: '건위소화제',
      },
      {
        id: '3',
        item_name: '아네모정',
        item_image:
          'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/152035092098000085',
        entp_name: '삼진제약(주)',
        etc_otc_name: '일반의약품',
        class_name: '제산제',
      },
      {
        id: '4',
        item_name: '에바치온캡슐',
        item_image:
          'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/151577167067000087',
        entp_name: '조아제약(주)',
        etc_otc_name: '일반의약품',
        class_name: '해독제',
      },
      {
        id: '5',
        item_name: '삐콤정',
        item_image:
          'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/153495248483300010',
        entp_name: '(주)유한양행',
        etc_otc_name: '일반의약품',
        class_name: '혼합비타민제',
      },
      {
        id: '6',
        item_name: '게루삼정',
        item_image:
          'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/154307400984500104',
        entp_name: '삼남제약(주)',
        etc_otc_name: '일반의약품',
        class_name: '제산제',
      },
      {
        id: '7',
        item_name: '페니라민정(클로르페니라민)',
        item_image:
          'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1Orz9gcUHnw',
        entp_name: '지엘파마(주)',
        etc_otc_name: '일반의약품',
        class_name: '항히스타민제',
      },
    ];
    setSearchResults(dummyData);
  }, [searchQuery]);

  // 필터 옵션들
  const filterOptions = {
    color: ['선택 없음', '하양', '파랑', '빨강', '초록', '노랑', '분홍'],
    shape: ['선택 없음', '원형', '타원형', '장방형', '삼각형', '사각형'],
    size: ['선택 없음', '소형', '중형', '대형'],
    split: ['선택 없음', '있음', '없음']
  };

  const openFilterModal = () => {
    // 현재 선택된 필터들로 임시 상태 초기화
    setTempFilters({
      color: selectedColor,
      shape: selectedShape,
      size: selectedSize,
      split: selectedSplit
    });
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    // 임시 상태에서 실제 필터 상태로 적용
    setSelectedColor(tempFilters.color);
    setSelectedShape(tempFilters.shape);
    setSelectedSize(tempFilters.size);
    setSelectedSplit(tempFilters.split);
    setFilterModalVisible(false);
  };

  const handleFilterChange = (type, value) => {
    setTempFilters(prev => ({
      ...prev,
      [type]: value === '선택 없음' ? null : value
    }));
  };

  const renderFilterSection = (title, type, options) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 16, marginBottom: 10 }}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 15,
              borderRadius: 20,
              backgroundColor: tempFilters[type] === (option === '선택 없음' ? null : option) 
                ? '#000' 
                : '#fff',
              borderWidth: 1,
              borderColor: '#e0e0e0',
            }}
            onPress={() => handleFilterChange(type, option)}>
            <Text
              style={{
                color: tempFilters[type] === (option === '선택 없음' ? null : option) 
                  ? 'white' 
                  : 'black',
                fontFamily: 'Pretendard-SemiBold',
              }}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // 통합 필터 모달
  const renderIntegratedFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'flex-end', 
        backgroundColor: 'rgba(0, 0, 0, 0.5)' 
      }}>
        <View style={{ 
          backgroundColor: 'white', 
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20, 
          padding: 20,
          maxHeight: '80%'
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 20 
          }}>
            <Text style={{ fontSize: 18, fontFamily: 'Pretendard-Bold' }}>특징 검색</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Text style={{ fontSize: 16, fontFamily: 'Pretendard-SemiBold', color: '#888' }}>취소</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ maxHeight: '70%' }}>
            {renderFilterSection('색상', 'color', filterOptions.color)}
            {renderFilterSection('모양', 'shape', filterOptions.shape)}
            {renderFilterSection('크기', 'size', filterOptions.size)}
            {renderFilterSection('분할선', 'split', filterOptions.split)}
          </ScrollView>
          <Button title='적용하기' onPress={applyFilters} />
        </View>
      </View>
    </Modal>
  );

  const handleSearchBarPress = () => {
    navigation.navigate('SearchMedicine');
  };

  // 임시로 id 값 넘김
  const handleSearchResultPress = medicineId => {
    navigation.navigate('MedicineDetail', {id: medicineId});
  };

  return (
    <Container>
      <HeaderContainer>
        <ChevronAndSearchContainer>
          <ChevronIconButton onPress={() => navigation.goBack()}>
            <ChevronIcon
              height={17}
              width={17}
              style={{color: themes.light.textColor.textPrimary}}
            />
          </ChevronIconButton>
          <SearchBarTouchable onPress={handleSearchBarPress}>
            <SearchQueryText>{searchQuery}</SearchQueryText>
            <SearchIconContainer>
              <OtherIcons.search
                width={17.5}
                height={17.5}
                style={{color: themes.light.textColor.Primary20}}
              />
            </SearchIconContainer>
          </SearchBarTouchable>
        </ChevronAndSearchContainer>

        {searchResults.length > 0 && (
        <FeatureSearchContainer>
          <FeatureSearchText>특징 검색</FeatureSearchText>
          <ScrollableFilterContainer
            horizontal={true}
            showsHorizontalScrollIndicator={false}>
            <FilterButton onPress={openFilterModal}>
              <FilterButtonText selected={selectedColor}>
                {selectedColor || '색상'}
              </FilterButtonText>
              <ChevronDownIcon
                style={{ color: themes.light.textColor.Primary30 }}
              />
            </FilterButton>
            <FilterButton onPress={openFilterModal}>
              <FilterButtonText selected={selectedShape}>
                {selectedShape || '모양'}
              </FilterButtonText>
              <ChevronDownIcon
                style={{ color: themes.light.textColor.Primary30 }}
              />
            </FilterButton>
            <FilterButton onPress={openFilterModal}>
              <FilterButtonText selected={selectedSize}>
                {selectedSize || '크기'}
              </FilterButtonText>
              <ChevronDownIcon
                style={{ color: themes.light.textColor.Primary30 }}
              />
            </FilterButton>
            <FilterButton onPress={openFilterModal}>
              <FilterButtonText selected={selectedSplit}>
                {selectedSplit || '분할선'}
              </FilterButtonText>
              <ChevronDownIcon
                style={{ color: themes.light.textColor.Primary30 }}
              />
            </FilterButton>
          </ScrollableFilterContainer>
        </FeatureSearchContainer>
      )}

      {/* 통합 필터 모달 렌더링 */}
      {renderIntegratedFilterModal()}
      </HeaderContainer>

      <SearchResultContainer>
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <SearchResultItem
                onPress={() => handleSearchResultPress(item.id)}>
                <ImageContainer>
                  <MedicineImage
                    source={{uri: item.item_image}}
                    style={{resizeMode: 'stretch'}}
                  />
                </ImageContainer>

                <InfoContainer>
                  <ManufacturerText>{item.entp_name}</ManufacturerText>
                  <MedicineNameText>{item.item_name}</MedicineNameText>
                  <TypeContainer>
                    <Tag sizeType="small" colorType="resultPrimary">
                      {item.etc_otc_name}
                    </Tag>
                    <Tag sizeType="small" colorType="resultSecondary">
                      {item.class_name}
                    </Tag>
                  </TypeContainer>
                </InfoContainer>
              </SearchResultItem>
            )}
            ListFooterComponent={() => <Footer />}
          />
        ) : (
          <NoResultsContainer>
            <NoResultsText>검색 결과가 없습니다.</NoResultsText>
            <NoResultsSubText>
              검색어를 다시 한 번{'\n'}확인해 주세요.
            </NoResultsSubText>
          </NoResultsContainer>
        )}
      </SearchResultContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const HeaderContainer = styled.View`
  padding-top: 70px;
  padding-bottom: 10px;
  background-color: ${themes.light.bgColor.headerBG};
`;

const ChevronAndSearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-right: 15px;
  padding-left: 12px;
`;

const SearchBarTouchable = styled(TouchableOpacity)`
  height: 44px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  background-color: ${({theme}) => themes.light.boxColor.inputSecondary};
  flex: 1;
  padding: 13px 20px 13px 15px;
`;

const SearchQueryText = styled.Text`
  font-size: 15px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

const SearchIconContainer = styled.View`
  justify-content: center;
  align-items: center;
`;

const ChevronIconButton = styled(TouchableOpacity)`
  margin-right: 12px;
`;

const SearchResultContainer = styled.View`
  flex: 1;
  margin-top: 10px;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const SearchResultItem = styled(TouchableOpacity)`
  height: 74.67px;
  flex-direction: row;
  align-items: center;
  margin: 0 15px 25px 15px;
`;

const ImageContainer = styled.View`
  width: 140px;
  height: 74.67px;
  margin-right: 15px;
  border-radius: 10px;
`;

const MedicineImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

const InfoContainer = styled.View`
  height: 100%;
  gap: 7px;
  justify-content: center;
`;

const ManufacturerText = styled.Text`
  font-size: 13px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.Primary50};
`;

const MedicineNameText = styled.Text`
  font-size: 17px;
  font-family: 'Pretendard-Bold';
  color: ${themes.light.textColor.textPrimary};
`;

const TypeContainer = styled.View`
  flex-direction: row;
  gap: 11px;
`;

const NoResultsContainer = styled.View`
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const NoResultsText = styled.Text`
  font-size: 18px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

const NoResultsSubText = styled.Text`
  font-size: 14px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.Primary30};
  margin-top: 18px;
  text-align: center;
`;

const FeatureSearchContainer = styled.View`
  margin-top: 15px;
  padding-left: 20px;
  flex-direction: row;
  align-items: center;
`;

const FeatureSearchText = styled.Text`
  font-size: 15px;
  font-family: 'Pretendard-SemiBold';
  margin-right: 11px;
`;

const ScrollableFilterContainer = styled.ScrollView`
  flex-direction: row;
`;

const FilterButton = styled(TouchableOpacity)`
  border-color: ${themes.light.boxColor.inputSecondary};
  flex-direction: row;
  border-width: 1.5px;
  padding: 6px 12px 6px 11px;
  border-radius: 40px;
  margin-right: 10px;
  align-items: center;
`;

const FilterButtonText = styled.Text`
  font-size: 13px;
  margin-right: 6px;
  font-family: 'Pretendard-SemiBold';
  color: ${props =>
    props.selected
      ? pointColor.pointPrimary
      : themes.light.textColor.textPrimary};
`;

export default SearchMedicineResultsScreen;