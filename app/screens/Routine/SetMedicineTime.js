import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Platform } from 'react-native';
import { themes } from './../../styles';
import { OtherIcons } from '../../../assets/icons';
import { ModalHeader, ProgressBar, ScheduleSelector } from '../../components';
import { Button } from '../../components/Button';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';

const SetMedicineTime = ({ route, navigation }) => {
  const { medicine_id, nickname, interval_days, routine_start_date } = route.params;
  console.log("routine_start_date:", routine_start_date);
  const progress = '66.66%';
  const { fontSizeMode } = useFontSize();

  const [selectedTimings, setSelectedTimings] = useState([]);
  const [scheduleMapping, setScheduleMapping] = useState({});

  const handleNext = () => {
    const timingToEmojiMap = {
      '아침': '🐥️ 아침',
      '점심': '🥪️ 점심',
      '저녁': '🌙️ 저녁',
      '자기 전': '🛏️️ 자기 전'
    };

    const user_schedule_ids = selectedTimings
      .map(timing => scheduleMapping[timingToEmojiMap[timing]])
      .filter(id => id !== undefined);

    console.log('선택된 시간대 ID:', user_schedule_ids);

    navigation.navigate('SetMedicineDose', {
      medicine_id,
      nickname,
      routine_start_date,
      user_schedule_ids,
      interval_days: parseInt(interval_days)
    });
  };

  const handleSetTimings = () => {
    navigation.navigate('SetRoutineTime');
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ModalHeader showDelete="true" onDeletePress={() => { }}>
        루틴 추가
      </ModalHeader>
      <ProgressBar progress={progress} />
      <ScrollView>
        <View>
          <TextContainer>
            <LargeText fontSizeMode={fontSizeMode}>
              이 약은 하루중 언제 복용하나요?
            </LargeText>
            <SmallText fontSizeMode={fontSizeMode}>
              복약 시간을 놓치지 않도록 도와드릴게요!
            </SmallText>
          </TextContainer>

          <SelectTime>
            <ScheduleSelector
              selectedTimings={selectedTimings}
              setSelectedTimings={setSelectedTimings}
              onScheduleMappingChange={setScheduleMapping}
            />
          </SelectTime>

          <TimeSettingButton onPress={handleSetTimings}>
            <ButtonText fontSizeMode={fontSizeMode}>시간대 설정하기</ButtonText>
            <OtherIcons.chevronDown
              width={10}
              height={10}
              style={{
                color: themes.light.textColor.Primary20,
                transform: [{ rotate: '-90deg' }],
              }}
            />
          </TimeSettingButton>
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 30,
          alignItems: 'center',
        }}>
        <Button
          title="다음"
          onPress={handleNext}
          disabled={selectedTimings.length === 0}
          bgColor={selectedTimings.length > 0
            ? themes.light.boxColor.buttonPrimary
            : themes.light.boxColor.inputSecondary}
          textColor={selectedTimings.length > 0
            ? themes.light.textColor.buttonText
            : themes.light.textColor.Primary30}
        />
      </View>
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
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
`;

const SmallText = styled.Text`
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

const SelectTime = styled.View`
  padding: 0 20px;
  gap: 10px;
`;

const TimeSettingButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 20px;
  gap: 10px;
`;

const ButtonText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({ fontSizeMode }) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.Primary30};
`;

export default SetMedicineTime;