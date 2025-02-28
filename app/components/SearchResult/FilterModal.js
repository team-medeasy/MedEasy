import React from 'react';
import {Modal, View} from 'react-native';
import styled from 'styled-components/native';
import {Button} from './../../components';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';

const FilterModal = ({
  visible,
  onClose,
  filterType,
  filterOptions,
  tempFilters,
  handleFilterChange,
  applyFilters,
  colorCodes,
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

          <FilterOptionsContainer>
            {filterOptions[filterType].map((option, index) => (
              <FilterOptionButton
                key={index}
                selected={tempFilters[filterType].includes(option)}
                onPress={() => handleFilterChange(filterType, option)}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {filterType === 'color' && (
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: colorCodes[option],
                        borderWidth: 1.5,
                        borderColor: themes.light.borderColor.borderCircle,
                        marginRight: 7,
                      }}
                    />
                  )}
                  {filterType === 'shape' && (
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        borderWidth: 1.5,
                        borderColor: themes.light.textColor.Primary50,
                        marginRight: 7,
                      }}
                    />
                  )}
                  <FilterOptionText
                    selected={tempFilters[filterType].includes(option)}>
                    {option}
                  </FilterOptionText>
                </View>
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
`;

const FilterOptionButton = styled.TouchableOpacity`
  background-color: ${({selected}) =>
    selected
      ? themes.light.pointColor.Primary
      : themes.light.boxColor.inputPrimary};
  padding: 8px 16px;
  border-radius: 5px;
  flex-direction: row;
  align-items: center;
`;

const FilterOptionText = styled.Text`
  color: ${({selected}) =>
    selected
      ? themes.light.textColor.buttonText
      : themes.light.textColor.Primary50};
  font-family: 'Pretendard-SemiBold';
`;

export default FilterModal;
