import React from 'react';
import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {themes} from './../../styles';
import {HeaderIcons, OtherIcons} from '../../../assets/icons';
import {FilterButton} from './FilterButton';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const {chevron: ChevronIcon} = HeaderIcons;

export const SearchScreenHeader = ({
  searchQuery,
  onBackPress,
  onSearchPress,
  selectedColors,
  selectedShapes,
  onFilterPress,
  selectedDosageForms,
  selectedSplits,
  onClearFilter,
  getFilterButtonText,
  renderFilterButtonIcon,
}) => {
  const { fontSizeMode } = useFontSize();
  const insets = useSafeAreaInsets(); // SafeArea 인셋 가져오기
  
  return (
    <HeaderContainer style={{ paddingTop: insets.top }}>
      <ChevronAndSearchContainer>
        <ChevronIconButton style={{padding: 12}} onPress={onBackPress}>
          <ChevronIcon
            height={17}
            width={17}
            style={{color: themes.light.textColor.textPrimary}}
          />
        </ChevronIconButton>
        <SearchBarTouchable onPress={onSearchPress}>
          <SearchQueryText fontSizeMode={fontSizeMode}>{searchQuery}</SearchQueryText>
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
          <FeatureSearchText fontSizeMode={fontSizeMode}>특징 검색</FeatureSearchText>
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
              />
            ))}
          </ScrollableFilterContainer>
        </FeatureSearchContainer>
      )}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.View`
  background-color: ${themes.light.bgColor.headerBG};
`;

const ChevronAndSearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-right: 15px;
`;

const SearchBarTouchable = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  background-color: ${({theme}) => themes.light.boxColor.inputSecondary};
  flex: 1;
  padding: 11px 20px 11px 15px;
`;

const SearchQueryText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

const SearchIconContainer = styled.View`
  justify-content: center;
  align-items: center;
`;

const ChevronIconButton = styled(TouchableOpacity)``;

const FeatureSearchContainer = styled.View`
  margin-top: 15px;
  padding-left: 20px;
  flex-direction: row;
  align-items: center;
`;

const FeatureSearchText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-SemiBold';
  margin-right: 11px;
`;

const ScrollableFilterContainer = styled.ScrollView`
  flex-direction: row;
`;
