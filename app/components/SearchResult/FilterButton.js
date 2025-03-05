import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';
import {themes} from './../../styles';
import {OtherIcons} from '../../../assets/icons';
import FontSizes from '../../../assets/fonts/fontSizes';

const {chevronDown: ChevronDownIcon, delete: Delete} = OtherIcons;

const FilterButton = ({
  type,
  selectedItems,
  onFilterPress,
  onClearFilter,
  getFilterButtonText,
  renderFilterButtonIcon,
}) => {
  return (
    <FilterBtn onPress={onFilterPress} selected={selectedItems.length > 0}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {renderFilterButtonIcon(type, selectedItems)}
        <FilterButtonText selected={selectedItems.length > 0}>
          {getFilterButtonText(type, selectedItems)}
        </FilterButtonText>
      </View>
      {selectedItems.length > 0 ? (
        <TouchableOpacity onPress={() => onClearFilter(type)}>
          <Delete
            width={10}
            height={10}
            style={{color: themes.light.textColor.Primary30}}
          />
        </TouchableOpacity>
      ) : (
        <ChevronDownIcon style={{color: themes.light.textColor.Primary30}} />
      )}
    </FilterBtn>
  );
};

const FilterBtn = styled(TouchableOpacity)`
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

export default FilterButton;
