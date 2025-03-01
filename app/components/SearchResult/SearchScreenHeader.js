import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';
import {themes} from './../../styles';
import {HeaderIcons, OtherIcons} from '../../../assets/icons';
import FilterButton from './FilterButton';

const {chevron: ChevronIcon} = HeaderIcons;

const SearchScreenHeader = ({
  searchQuery,
  onBackPress,
  onSearchPress,
  selectedColors,
  selectedShapes,
  onFilterPress,
  selectedDosageForms,
  selectedSplits,
  onClearFilter,
  colorCodes,
  getFilterButtonText,
  renderFilterButtonIcon,
}) => {
  return (
    <HeaderContainer>
      <ChevronAndSearchContainer>
        <ChevronIconButton onPress={onBackPress}>
          <ChevronIcon
            height={17}
            width={17}
            style={{color: themes.light.textColor.textPrimary}}
          />
        </ChevronIconButton>
        <SearchBarTouchable onPress={onSearchPress}>
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

      {searchQuery && (
        <FeatureSearchContainer>
          <FeatureSearchText>특징 검색</FeatureSearchText>
          <ScrollableFilterContainer
            horizontal={true}
            showsHorizontalScrollIndicator={false}>
            {['color', 'shape', 'dosageForm', 'split'].map(type => (
              <FilterButton
                key={type}
                type={type}
                selectedItems={
                  type === 'color'
                    ? selectedColors
                    : type === 'shape'
                    ? selectedShapes
                    : type === 'dosageForm'
                    ? selectedDosageForms
                    : selectedSplits
                }
                onFilterPress={() => onFilterPress(type)}
                onClearFilter={onClearFilter}
                getFilterButtonText={getFilterButtonText}
                renderFilterButtonIcon={renderFilterButtonIcon}
                colorCodes={colorCodes}
              />
            ))}
          </ScrollableFilterContainer>
        </FeatureSearchContainer>
      )}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.View`
  padding-top: 70px;
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

const FeatureSearchContainer = styled.View`
  margin-top: 15px;
  padding-left: 20px;
  flex-direction: row;
  align-items: center;
  padding-bottom: 7px;
`;

const FeatureSearchText = styled.Text`
  font-size: 15px;
  font-family: 'Pretendard-SemiBold';
  margin-right: 11px;
`;

const ScrollableFilterContainer = styled.ScrollView`
  flex-direction: row;
`;

export default SearchScreenHeader;
