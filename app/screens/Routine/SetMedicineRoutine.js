import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader, Button } from '../../components';

const SetMedicineRoutine = () => {
  const [medicineName, setMedicineName] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimings, setSelectedTimings] = useState([]);
  const [dosage, setDosage] = useState('');
  const [totalCount, setTotalCount] = useState('');

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const timings = ['아침', '점심', '저녁', '자기 전'];

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTiming = (timing) => {
    setSelectedTimings((prev) =>
      prev.includes(timing) ? prev.filter((t) => t !== timing) : [...prev, timing]
    );
  };

  return (
    <Container>
      <ModalHeader>루틴 추가</ModalHeader>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          flexDirection: 'column',
          gap: 30,
        }}
      >
        <View>
          <SectionTitle>별명</SectionTitle>
          <StyledInput
            placeholder="약 별명을 입력하세요"
            value={medicineName}
            onChangeText={setMedicineName}
          />
        </View>

        {/* 요일 선택 */}
        <View>
          <SectionTitle>복용 요일</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {days.map((day) => (
              <ToggleButton key={day} selected={selectedDays.includes(day)} onPress={() => toggleDay(day)}>
                <ToggleButtonText selected={selectedDays.includes(day)}>{day}</ToggleButtonText>
              </ToggleButton>
            ))}
          </View>
        </View>

        {/* 시간대 선택 */}
        <View>
          <SectionTitle>복용 시간대</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {timings.map((timing) => (
              <ToggleButton key={timing} selected={selectedTimings.includes(timing)} onPress={() => toggleTiming(timing)}>
                <ToggleButtonText selected={selectedTimings.includes(timing)}>{timing}</ToggleButtonText>
              </ToggleButton>
            ))}
          </View>
        </View>

        {/* 1회 복용량 */}
        <View>
          <SectionTitle>1회 복용량</SectionTitle>
          <StyledInput
            placeholder="복용량을 입력하세요"
            value={dosage}
            onChangeText={setDosage}
            keyboardType="numeric"
          />
        </View>

        {/* 총 개수 */}
        <View>
          <SectionTitle>총 개수</SectionTitle>
          <StyledInput
            placeholder="총 개수를 입력하세요"
            value={totalCount}
            onChangeText={setTotalCount}
            keyboardType="numeric"
          />
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
        }}
      >
        <Button title="저장하기" onPress={() => {}} />
      </View>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${themes.light.textColor.primary};
  margin-bottom: 10px;
`;

const StyledInput = styled.TextInput`
  background-color: ${themes.light.bgColor.bgSecondary};
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
`;

const ToggleButton = styled.TouchableOpacity`
  background-color: ${(props) =>
    props.selected ? themes.light.accentColor.primary : themes.light.bgColor.bgSecondary};
  border-radius: 8px;
  padding: 10px;
  margin: 5px;
`;

const ToggleButtonText = styled.Text`
  color: ${(props) =>
    props.selected ? themes.light.textColor.onAccent : themes.light.textColor.secondary};
  text-align: center;
`;

export default SetMedicineRoutine;