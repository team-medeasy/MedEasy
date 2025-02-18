import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const SearchResultContainer = styled.View`
  flex: 1;
  margin-top: 20px;
  margin-left: 15px;
  margin-right: 15px;
`;

const SearchResultItem = styled.View`
  width: 100%;
  height: 90px;
  flex-direction: row;
  padding-top: 10px;
  padding-bottom: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

const ImageContainer = styled.View`
  width: 140px;
  height: 75px;
  margin-right: 15px;
  border-radius: 10px;
`;

const MedicineImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

const InfoContainer = styled.View`
  flex: 1;
  height: 100%;
  justify-content: center;
`;

const ManufacturerText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: #0006;
  margin-bottom: 6px;
`;

const MedicineNameText = styled.Text`
  font-weight: bold;
  font-size: 16px;
  color: #000;
  margin-bottom: 6px;
`;

const TypeContainer = styled.View`
  flex-direction: row;
`;

const TypeText = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: #777;
  background-color: ${(props) => props.bgColor || "lightgoldenrodyellow"};
  color: ${(props) => props.color || "yellowgreen"};
  margin-right: 10px;
  border-radius: 5px;
  padding: 6px;
`;

const BackAndSearchContainer = styled.View`
  height: 60px;
  flex-direction: row;
  align-items: center;
  margin-left: 20px;
  margin-right: 20px;
`;

const SearchInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border-radius: 8px;
  background-color: #0001;
  flex: 1;
`;

const SearchInput = styled.TextInput`
  height: 100%;
  flex: 1;
  padding: 10px;
  font-size: 14px;
`;

const SearchButton = styled(TouchableOpacity)`
  padding: 10px;
`;

const NoResultsContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const NoResultsImage = styled.Image`
  margin-bottom: 30px;
`;

const NoResultsText = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin-bottom: 15px;
`;

const NoResultsSubText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #0005;
  text-align: center;
`;

const FeatureSearchContainer = styled.View`
  margin-left: 20px;
  margin-top: 20px;
  flex-direction: row;
  align-items: center; 
`;

const FeatureSearchText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-right: 15px;
`;

const ScrollableFilterContainer = styled.ScrollView`
  flex-direction: row;
`;

const FilterButton = styled(TouchableOpacity)`
  border-color: #0001;
  flex-direction: row;
  border-width: 1.5px;
  padding: 7px 11px;
  border-radius: 40px;
  margin-right: 10px;
`;

const FilterButtonText = styled.Text`
  font-weight: 600;
  margin-right: 5px;
  color: ${props => props.selected ? '#1C51FF' : '#000'};
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
  background-color: rgba(0,0,0,0.5);
`;

const ModalContent = styled.View`
  background-color: white;
  padding: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
`;

const FilterOptionButton = styled(TouchableOpacity)`
  padding: 10px;
  background-color: ${props => props.selected ? '#000' : '#fff'};
  border-radius: 40px;
  margin-bottom: 10px;
`;

const FilterOptionText = styled.Text`
  color: ${props => props.selected ? 'white' : 'black'};
  text-align: center;
`;

const SearchMedicineResultsScreen = ({ route, navigation }) => {
    const { searchQuery } = route.params;  // MedicineSearchScreen에서 전달된 검색어
    const [searchResults, setSearchResults] = useState([]);
    const [newSearchQuery, setNewSearchQuery] = useState(searchQuery);  // 검색어 변경을 위한 상태

    // 검색 필터링
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedShape, setSelectedShape] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedSplit, setSelectedSplit] = useState(null);

    const [colorModalVisible, setColorModalVisible] = useState(false);
    const [shapeModalVisible, setShapeModalVisible] = useState(false);
    const [sizeModalVisible, setSizeModalVisible] = useState(false);
    const [splitModalVisible, setSplitModalVisible] = useState(false);

    const colorOptions = ['선택 없음', '하양', '파랑', '빨강', '초록', '노랑', '분홍'];
    const shapeOptions = ['선택 없음', '원형', '타원형', '장방형', '삼각형', '사각형'];
    const sizeOptions = ['선택 없음', '소형', '중형', '대형'];
    const splitOptions = ['선택 없음', '있음', '없음'];

    useEffect(() => {
        // 임시 데이터
        const dummyData = [
          {
            id: '1',
            name: '지엘타이밍정(카페인무수물)',
            image: require("./../../../assets/images/med1.png"),
            manufacturer: '지엘파마(주)',
            medicineType: '일반의약품',
            functionalType: '각성제'
          },
          {
            id: '2',
            name: '베스타제당의정',
            image: require("./../../../assets/images/med2.png"),
            manufacturer: '동야제약(주)',
            medicineType: '일반의약품',
            functionalType: '건위소화제'
          },
          {
            id: '3',
            name: '아네모정',
            image: require("./../../../assets/images/med3.png"),
            manufacturer: '삼진제약(주)',
            medicineType: '일반의약품',
            functionalType: '제산제'
          },
          {
            id: '4',
            name: '에바치온캡슐',
            image: require("./../../../assets/images/med4.png"),
            manufacturer: '조아제약(주)',
            medicineType: '일반의약품',
            functionalType: '해독제'
          },
          {
            id: '5',
            name: '삐콤정',
            image: require("./../../../assets/images/med5.png"),
            manufacturer: '(주)유한양행',
            medicineType: '일반의약품',
            functionalType: '혼합비타민제'
          },
          {
            id: '6',
            name: '게루삼정',
            image: require("./../../../assets/images/med6.png"),
            manufacturer: '삼남제약(주)',
            medicineType: '일반의약품',
            functionalType: '제산제'
          },
          {
            id: '7',
            name: '페니라민정(클로르페니라민)',
            image: require("./../../../assets/images/med7.png"),
            manufacturer: '지엘파마(주)',
            medicineType: '일반의약품',
            functionalType: '항히스타민제'
          },
        ];
        setSearchResults(dummyData);
    }, [searchQuery]);

    const handleSearch = () => {
        if (newSearchQuery.trim() !== '') {
            // 검색어가 있을 때, MedicineSearchDetail로 검색어 전달
            navigation.push('SearchMedicineResults', { searchQuery: newSearchQuery });
        }
    };

    const renderFilterModal = (title, options, selected, setSelected, modalVisible, setModalVisible) => (
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
      >
          <ModalContainer>
              <ModalContent>
                  <ModalTitle>{title}</ModalTitle>
                  <ScrollView>
                      {options.map((option, index) => (
                          <FilterOptionButton
                              key={index}
                              selected={selected === option}
                              onPress={() => {
                                  setSelected(option === '선택 없음' ? null : option);
                                  setModalVisible(false);
                              }}
                          >
                              <FilterOptionText selected={selected === option}>
                                  {option}
                              </FilterOptionText>
                          </FilterOptionButton>
                      ))}
                  </ScrollView>
              </ModalContent>
          </ModalContainer>
      </Modal>
  );

    return (
      <Container>
        <BackAndSearchContainer>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={20} color="#000" style={{ marginRight: 10 }}/>
            </TouchableOpacity>
            <SearchInputContainer>
              <SearchInput
                  placeholder="약 이름, 증상을 입력하세요"
                  value={newSearchQuery}
                  onChangeText={setNewSearchQuery}
              />
              <SearchButton onPress={handleSearch}>
                  <Ionicons name="search" size={20} color="#0005" />
              </SearchButton>
            </SearchInputContainer>
        </BackAndSearchContainer>
        {searchResults.length > 0 && (
          <FeatureSearchContainer>
              <FeatureSearchText>특징 검색</FeatureSearchText>
              <ScrollableFilterContainer 
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
              >
                <FilterButton onPress={() => setColorModalVisible(true)}>
                    <FilterButtonText selected={selectedColor}>
                        {selectedColor || '색상'}
                    </FilterButtonText>
                    <Ionicons name="chevron-down" size={15} color="#0005"/>
                </FilterButton>
                <FilterButton onPress={() => setShapeModalVisible(true)}>
                    <FilterButtonText selected={selectedShape}>
                        {selectedShape || '모양'}
                    </FilterButtonText>
                    <Ionicons name="chevron-down" size={15} color="#0005"/>
                </FilterButton>
                <FilterButton onPress={() => setSizeModalVisible(true)}>
                    <FilterButtonText selected={selectedSize}>
                        {selectedSize || '크기'}
                    </FilterButtonText>
                    <Ionicons name="chevron-down" size={15} color="#0005"/>
                </FilterButton>
                <FilterButton onPress={() => setSplitModalVisible(true)}>
                    <FilterButtonText selected={selectedSplit}>
                        {selectedSplit || '분할선'}
                    </FilterButtonText>
                    <Ionicons name="chevron-down" size={15} color="#0005"/>
                </FilterButton>
              </ScrollableFilterContainer>
          </FeatureSearchContainer>
        )}
        <SearchResultContainer>
            {searchResults.length > 0 ? (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SearchResultItem>
                            <ImageContainer>
                                <MedicineImage source={item.image} style={{ resizeMode: 'stretch' }}/>
                            </ImageContainer>
                            
                            <InfoContainer>
                                <ManufacturerText>{item.manufacturer}</ManufacturerText>
                                <MedicineNameText>{item.name}</MedicineNameText>
                                <TypeContainer>
                                    <TypeText color="rgb(28, 81, 255)" bgColor="rgba(28, 81, 255, 0.1)">{item.medicineType}</TypeText>
                                    <TypeText color="rgb(0, 0, 0)" bgColor="rgba(0, 0, 0, 0.1)">{item.functionalType}</TypeText>
                                </TypeContainer>
                            </InfoContainer>
                        </SearchResultItem>
                    )}
                />
            ) : (
              <NoResultsContainer>
              {/* <NoResultsImage source={require("./../assets/images/logo/logo_noResult.png")} /> */}
              <NoResultsText>검색 결과가 없습니다.</NoResultsText>
              <NoResultsSubText>검색어를 다시 한 번{'\n'}확인해 주세요.</NoResultsSubText>
            </NoResultsContainer>
            )}
        </SearchResultContainer>
        {/* Modals for each filter */}
        {renderFilterModal('색상', colorOptions, selectedColor, setSelectedColor, colorModalVisible, setColorModalVisible)}
        {renderFilterModal('모양', shapeOptions, selectedShape, setSelectedShape, shapeModalVisible, setShapeModalVisible)}
        {renderFilterModal('크기', sizeOptions, selectedSize, setSelectedSize, sizeModalVisible, setSizeModalVisible)}
        {renderFilterModal('분할선', splitOptions, selectedSplit, setSelectedSplit, splitModalVisible, setSplitModalVisible)}
      </Container>
    );
};

export default SearchMedicineResultsScreen;