import React, { useState } from 'react';
import styled from 'styled-components/native';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { Header, SearchResultItem } from '../../components';
import RoutineCard from '../../components/RoutineCard';
import Slider from '@react-native-community/slider';

const FontSize = () => {
  const [checkedItems, setCheckedItems] = useState({});
  const [fontSizeValue, setFontSizeValue] = useState(0); // 0: default, 1: medium, 2: large

  const getFontSizeMode = (value) => {
    if (value < 0.5) return 'default';
    if (value < 1.5) return 'medium';
    return 'large';
  };

  const fontSizeMode = getFontSizeMode(fontSizeValue);

  const exampleItem = {
    item_image: '',
    entp_name: '팀메디지',
    item_name: '메디지정',
    etc_otc_name: '일반의약품',
    class_name: '테스트',
  };

  const exampleRoutine = {
    type: 'medicine',
    label: '아침',
    time: '오전 8:00',
    timeKey: 'morning',
    medicines: [
      { medicine_id: 1, nickname: '샘플 텍스트', dose: 1 },
      { medicine_id: 2, nickname: '샘플 텍스트', dose: 2 },
      { medicine_id: 3, nickname: '샘플 텍스트', dose: 3 },
    ],
  };

  const toggleCheck = (medicineId, timeKey) => {
    setCheckedItems((prev) => {
      const key = `0000-00-00-${timeKey}-${medicineId}`;
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  const toggleTimeCheck = (timeKey, routine) => {
    setCheckedItems((prev) => {
      const newChecked = { ...prev };
      const selectedDate = '0000-00-00';
      const keys = routine.medicines.map(
        ({ medicine_id }) => `${selectedDate}-${timeKey}-${medicine_id}`
      );
      const allChecked = keys.every((key) => prev[key]);
      keys.forEach((key) => {
        newChecked[key] = allChecked ? false : true;
      });
      return newChecked;
    });
  };

  const handleFontSizeChange = (value) => {
    setFontSizeValue(value);
  };

  return (
    <Container>
      <Header>글자 크기 설정</Header>
      <Wrapper>
        <ContentWrapper>
          <SearchResultItem item={exampleItem} fontSizeMode={fontSizeMode} />

          <RoutineCard
            routine={exampleRoutine}
            index={0}
            allLength={1}
            checkedItems={checkedItems}
            toggleTimeCheck={(timeKey) => toggleTimeCheck(timeKey, exampleRoutine)}
            toggleHospitalCheck={() => {}}
            toggleCheck={toggleCheck}
            isInModal={true}
            selectedDateString="0000-00-00"
            backgroundColor={themes.light.boxColor.buttonSecondary}
            fontSizeMode={fontSizeMode}
          />
        </ContentWrapper>

        <FontSizeSelector>
          <Slider
            value={fontSizeValue}
            onValueChange={handleFontSizeChange}
            minimumValue={0}
            maximumValue={2}
            step={1}
            minimumTrackTintColor={themes.light.pointColor.Primary}
            maximumTrackTintColor={themes.light.textColor.Primary10}
            thumbTintColor={themes.light.pointColor.Primary}
          />

          <SliderLabelsContainer>
            <SliderLabelText fontSizeMode={fontSizeMode}>기본</SliderLabelText>
            <SliderLabelText fontSizeMode={fontSizeMode}>보통</SliderLabelText>
            <SliderLabelText fontSizeMode={fontSizeMode}>크게</SliderLabelText>
          </SliderLabelsContainer>
        </FontSizeSelector>
      </Wrapper>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgSecondary};
`;

const ContentWrapper = styled.View`
  gap: 20px;
`;

const Wrapper = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 90px 24px;
`;

const FontSizeSelector = styled.View`
  gap: 24px;
`;

const SliderLabelsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const SliderLabelText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.textPrimary};
  text-align: center;
`;

export default FontSize;
