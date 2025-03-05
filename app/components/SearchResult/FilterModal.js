import React from 'react';
import {Modal, View} from 'react-native';
import styled from 'styled-components/native';
import {Button, ColorShapeView, colorCodes} from './../../components';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {PillsIcon} from '../../../assets/icons';

const pillIcons = {
  정제: PillsIcon.tablet,
  경질캡슐: PillsIcon.hard_capsule,
  연질캡슐: PillsIcon.soft_capsule,
  '그 외': PillsIcon.etc,
};

const FilterModal = ({
  visible,
  onClose,
  filterType,
  filterOptions,
  tempFilters,
  handleFilterChange,
  applyFilters,
}) => {
  if (!filterType) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <ModalContainer>
        <ModalContent>
          <TopBar />
          <Title>
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
                  // 제형 선택 시
                  <>
                    {pillIcons[option] &&
                      React.createElement(pillIcons[option], {
                        width: 77,
                        height: 50,
                      })}

                    <FilterOptionText
                      selected={tempFilters[filterType].includes(option)}>
                      {option}
                    </FilterOptionText>
                  </>
                ) : (
                  // 색상, 모양, 분할선 선택 시
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {filterType === 'color' && (
                      <ColorShapeView
                        type={filterType}
                        value={option}
                      />
                    )}
                    {filterType === 'shape' && (
                      <ColorShapeView
                        type={filterType}
                        value={option}
                      />
                    )}
                    <FilterOptionText
                      selected={tempFilters[filterType].includes(option)}>
                      {option}
                    </FilterOptionText>
                  </View>
                )}
              </FilterOptionButton>
            ))}
          </FilterOptionsContainer>

          <Button title="적용하기" onPress={applyFilters} />
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

const ModalContainer = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.modalBG};
`;

const TopBar = styled.View`
  width: 40px;
  height: 5px;
  border-radius: 4px;
  background-color: ${themes.light.boxColor.modalBar};
  margin-bottom: 25px;
`;

const ModalContent = styled.View`
  width: 100%;
  margin-top: auto;
  background-color: ${themes.light.bgColor.bgPrimary};
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  padding-bottom: 40px;
`;

const Title = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
  margin-bottom: 30px;
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
`;

export default FilterModal;
