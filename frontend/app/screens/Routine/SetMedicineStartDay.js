import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Platform } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader, Button, ProgressBar, CustomCalendar } from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';

const SetMedicineStartDay = ({ route, navigation }) => {
  const { medicine_id, nickname, interval_days } = route.params;
  console.log("interval_days:", interval_days);
  const progress = '50%';
  const { fontSizeMode } = useFontSize();

  const [startDate, setStartDate] = useState(new Date());

  const handleDateChange = (date) => {
    setStartDate(date);
  };

  const handleNext = () => {
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    navigation.navigate('SetMedicineTime', {
      medicine_id,
      nickname,
      interval_days: parseInt(interval_days),
      routine_start_date: formattedDate,
    });
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ModalHeader showDelete="true" onDeletePress={() => {}}>
        루틴 추가
      </ModalHeader>
      <ProgressBar progress={progress} />
      <ScrollView>
        <View>
          <TextContainer>
            <LargeText fontSizeMode={fontSizeMode}>
              복용 시작일을 선택해주세요.
            </LargeText>
            <SmallText fontSizeMode={fontSizeMode}>
              일정에 맞춰 복약 알림을 보내드릴게요!
            </SmallText>
          </TextContainer>

          <DateSection>
            <CustomCalendar
              mode="single"
              selectedDate={startDate}
              onDateChange={handleDateChange}
            />
          </DateSection>
        </View>
      </ScrollView>

      <ButtonContainer>
        <Button
          title="다음"
          onPress={handleNext}
          bgColor={themes.light.boxColor.buttonPrimary}
          textColor={themes.light.textColor.buttonText}
        />
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const TextContainer = styled.View`
  padding: 35px 30px;
  gap: 10px;
`;

const LargeText = styled.Text`
  font-size: ${({ fontSizeMode }) => FontSizes.title[fontSizeMode]};
  font-family: ${'KimjungchulGothic-Bold'};
  color: ${themes.light.textColor.textPrimary};
`;

const SmallText = styled.Text`
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  font-family: ${'Pretendard-Medium'};
  color: ${themes.light.textColor.Primary50};
`;

const DateSection = styled.View`
  padding: 0 20px;
  align-items: center;
`;

const ButtonContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  padding-bottom: 30px;
  align-items: center;
`;

export default SetMedicineStartDay;