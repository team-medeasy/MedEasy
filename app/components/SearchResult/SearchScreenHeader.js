import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';
import {themes} from './../../styles';
import {HeaderIcons, OtherIcons} from '../../../assets/icons';
import FontSizes from '../../../assets/fonts/fontSizes';

const {chevron: ChevronIcon} = HeaderIcons;
const {chevronDown: ChevronDownIcon, delete: Delete} = OtherIcons;

const SearchScreenHeader = ({
  searchQuery,
  onBackPress,
  onSearchPress,
  onFilterPress,
  selectedColors,
  selectedShapes,
  selectedSizes,
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
            <FilterButton
              onPress={onFilterPress}
              selected={selectedColors.length > 0}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {renderFilterButtonIcon('color', selectedColors, colorCodes)}
                <FilterButtonText selected={selectedColors.length > 0}>
                  {getFilterButtonText('color', selectedColors)}
                </FilterButtonText>
              </View>
              {selectedColors.length > 0 ? (
                <TouchableOpacity onPress={() => onClearFilter('color')}>
                  <Delete
                    width={10}
                    height={10}
                    style={{color: themes.light.textColor.Primary30}}
                  />
                </TouchableOpacity>
              ) : (
                <ChevronDownIcon
                  style={{color: themes.light.textColor.Primary30}}
                />
              )}
            </FilterButton>

            <FilterButton
              onPress={onFilterPress}
              selected={selectedShapes.length > 0}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {renderFilterButtonIcon('shape', selectedShapes, colorCodes)}
                <FilterButtonText selected={selectedShapes.length > 0}>
                  {getFilterButtonText('shape', selectedShapes)}
                </FilterButtonText>
              </View>
              {selectedShapes.length > 0 ? (
                <TouchableOpacity onPress={() => onClearFilter('shape')}>
                  <Delete
                    width={10}
                    height={10}
                    style={{color: themes.light.textColor.Primary30}}
                  />
                </TouchableOpacity>
              ) : (
                <ChevronDownIcon
                  style={{color: themes.light.textColor.Primary30}}
                />
              )}
            </FilterButton>

            <FilterButton
              onPress={onFilterPress}
              selected={selectedSizes.length > 0}>
              <FilterButtonText selected={selectedSizes.length > 0}>
                {getFilterButtonText('size', selectedSizes)}
              </FilterButtonText>
              {selectedSizes.length > 0 ? (
                <TouchableOpacity onPress={() => onClearFilter('size')}>
                  <Delete
                    width={10}
                    height={10}
                    style={{color: themes.light.textColor.Primary30}}
                  />
                </TouchableOpacity>
              ) : (
                <ChevronDownIcon
                  style={{color: themes.light.textColor.Primary30}}
                />
              )}
            </FilterButton>

            <FilterButton
              onPress={onFilterPress}
              selected={selectedSplits.length > 0}>
              <FilterButtonText selected={selectedSplits.length > 0}>
                {getFilterButtonText('split', selectedSplits)}
              </FilterButtonText>
              {selectedSplits.length > 0 ? (
                <TouchableOpacity onPress={() => onClearFilter('split')}>
                  <Delete
                    width={10}
                    height={10}
                    style={{color: themes.light.textColor.Primary30}}
                  />
                </TouchableOpacity>
              ) : (
                <ChevronDownIcon
                  style={{color: themes.light.textColor.Primary30}}
                />
              )}
            </FilterButton>
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
  border-color: ${props =>
    props.selected
      ? themes.light.pointColor.primary30
      : themes.light.boxColor.inputSecondary};
  flex-direction: row;
  border-width: 1.5px;
  padding: 6px 9px 6px 11px;
  border-radius: 40px;
  margin-right: 10px;
  align-items: center;
  background-color: ${props =>
    props.selected ? themes.light.pointColor.Primary10 : 'transparent'};
`;

const FilterButtonText = styled.Text`
  font-size: ${FontSizes.body.default};
  margin-right: 6px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

export default SearchScreenHeader;
