import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Platform } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader, Button, ProgressBar, InputWithDelete, DualTextButton } from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const SetMedicineDay = ({ route, navigation }) => {
  const { medicine_id, nickname } = route.params;
  const progress = '33.33%';
  const {fontSizeMode} = useFontSize();

  const [selectedOption, setSelectedOption] = useState(null);
  const [intervalDays, setIntervalDays] = useState('');

  const handleSelect = (option) => {
    setSelectedOption((prev) => (prev === option ? null : option));
    if (option !== '주기 설정') setIntervalDays('');
  };

  const handleNext = () => {
    let interval_days = null;

    if (selectedOption === '매일') {
      interval_days = 1;
    } else if (selectedOption === '주기 설정') {
      interval_days = parseInt(intervalDays, 10);
    }

    navigation.navigate('SetMedicineStartDay', {
      medicine_id,
      nickname,
      interval_days: parseInt(interval_days),
    });
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
              며칠 주기로 복용하는 약인가요?
            </LargeText>
            <SmallText fontSizeMode={fontSizeMode}>
              일정에 맞춰 복약 알림을 보내드릴게요!
            </SmallText>
          </TextContainer>
          <SelectDay>
            <DualTextButton
              title={'매일'}
              onPress={() => handleSelect('매일')}
              bgColor={selectedOption === '매일' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
              textColor={selectedOption === '매일' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
            />
            <DualTextButton
              title={'주기 설정 (예: 2일 간격으로)'}
              onPress={() => handleSelect('주기 설정')}
              bgColor={selectedOption === '주기 설정' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
              textColor={selectedOption === '주기 설정' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
            />
            {selectedOption === '주기 설정' && (
              <InputWithDelete
                  value={intervalDays}
                  onChangeText={(text) => {
                      // 숫자만 입력되도록 처리
                      if (/^\d*$/.test(text)) {
                          setIntervalDays(text);
                      }
                  }}
                  placeholder="예: 2"
                  keyboardType="numeric"
              />
            )}
          </SelectDay>
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
          disabled={
            !selectedOption ||
            (selectedOption === '주기 설정' && (!intervalDays || isNaN(intervalDays)))
          }
          bgColor={selectedOption &&
            (selectedOption !== '주기 설정' || (intervalDays && !isNaN(intervalDays)))
            ? themes.light.boxColor.buttonPrimary
            : themes.light.boxColor.inputSecondary}
          textColor={selectedOption &&
            (selectedOption !== '주기 설정' || (intervalDays && !isNaN(intervalDays)))
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
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
`;

const SmallText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

const SelectDay = styled.TouchableOpacity`
  padding: 0 20px;
  gap: 10px;
`;

export default SetMedicineDay;