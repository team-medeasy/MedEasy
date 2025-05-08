import React from 'react';
import styled from 'styled-components/native';
import {Button, ColorShapeView} from './../../components';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {PillsIcon} from '../../../assets/icons';
import CustomModal from '../../components/CustomModal';

const pillIcons = {
  정제: PillsIcon.tablet,
  경질캡슐: PillsIcon.hard_capsule,
  연질캡슐: PillsIcon.soft_capsule,
  '그 외': PillsIcon.etc,
};

export const FilterModal = ({
  visible,
  onClose,
  filterType,
  filterOptions,
  tempFilters,
  handleFilterChange,
  applyFilters,
  currentFilters,
}) => {
  if (!filterType) return null;
  const {fontSizeMode} = useFontSize();

  const handleApplyFilters = () => {
    const hasChanges =
      JSON.stringify(tempFilters[filterType]) !==
      JSON.stringify(currentFilters[filterType]);

    if (hasChanges) {
      applyFilters();
    } else {
      onClose();
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose} height="75%">
      <Title fontSizeMode={fontSizeMode}>
        {filterType === 'color'
          ? '색상 선택'
          : filterType === 'shape'
          ? '모양 선택'
          : filterType === 'dosageForm'
          ? '제형 선택'
          : '분할선 선택'}
      </Title>

      <FilterOptionsContainer isDosageForm={filterType === 'dosageForm'}>
        {filterOptions[filterType].map((option, index) => (
          <FilterOptionButton
            key={index}
            selected={tempFilters[filterType].includes(option)}
            isDosageForm={filterType === 'dosageForm'}
            onPress={() => handleFilterChange(filterType, option)}>
            {filterType === 'dosageForm' ? (
              <>
                {pillIcons[option] &&
                  React.createElement(pillIcons[option], {
                    width: 77,
                    height: 50,
                  })}
                <FilterOptionText fontSizeMode={fontSizeMode}
                  selected={tempFilters[filterType].includes(option)}>
                  {option}
                </FilterOptionText>
              </>
            ) : (
              <RowView>
                <ColorShapeView type={filterType} value={option} />
                <FilterOptionText fontSizeMode={fontSizeMode}
                  selected={tempFilters[filterType].includes(option)}>
                  {option}
                </FilterOptionText>
              </RowView>
            )}
          </FilterOptionButton>
        ))}
      </FilterOptionsContainer>

      <Button title="적용하기" onPress={handleApplyFilters} />
    </CustomModal>
  );
};

const Title = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]}px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
  padding: 30px 0;
`;

const FilterOptionsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  align-self: flex-start;
  width: 100%;
  align-items: ${({isDosageForm}) => (isDosageForm ? 'center' : 'flex-start')};
  justify-content: ${({isDosageForm}) =>
    isDosageForm ? 'space-between' : 'flex-start'};
`;

const FilterOptionButton = styled.TouchableOpacity`
  background-color: ${({selected}) =>
    selected
      ? themes.light.pointColor.Primary
      : themes.light.boxColor.inputPrimary};
  padding: 8px 16px;
  border-radius: 5px;
  align-items: center;
  justify-content: center;
  width: ${({isDosageForm}) => (isDosageForm ? '48%' : 'auto')};
  height: ${({isDosageForm}) => (isDosageForm ? '110px' : 'auto')};
  flex-direction: column;
`;

const FilterOptionText = styled.Text`
  color: ${({selected}) =>
    selected
      ? themes.light.textColor.buttonText
      : themes.light.textColor.Primary50};
  font-family: 'Pretendard-SemiBold';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
`;

const RowView = styled.View`
  flex-direction: row;
  align-items: center;
`;
