import React, {useState} from 'react';
import styled from 'styled-components/native';
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {themes} from './../../styles';
import {Header} from '../../components';
import {RoutineIcons} from '../../../assets/icons';

const {medicine: MediIcon} = RoutineIcons;

const AddMedicineRoutine = () => {
  const [medicineName, setMedicineName] = useState('');
  const [time, setTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSave = () => {
    // 저장 로직 구현
    console.log('약 이름:', medicineName);
    console.log('시간:', time);
    console.log('시작 날짜:', startDate);
    console.log('종료 날짜:', endDate);
  };

  return (
    <Container>
      <Header>복용 루틴 추가</Header>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <InputContainer>
          <MediIcon
            width={20}
            height={20}
            style={{marginRight: 10, color: themes.light.pointColor.Primary}}
          />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 10,
              fontSize: 16,
              color: themes.light.textColor.textPrimary,
            }}
            placeholder="약 이름"
            value={medicineName}
            onChangeText={setMedicineName}
          />
        </InputContainer>
        <InputContainer>
          <TextInput
            style={{
              // styles 객체를 인라인 스타일로 변경
              flex: 1,
              paddingVertical: 10,
              fontSize: 16,
              color: themes.light.textColor.textPrimary,
            }}
            placeholder="시간 (예: 오전 8시)"
            value={time}
            onChangeText={setTime}
          />
        </InputContainer>
        <InputContainer>
          <TextInput
            style={{
              // styles 객체를 인라인 스타일로 변경
              flex: 1,
              paddingVertical: 10,
              fontSize: 16,
              color: themes.light.textColor.textPrimary,
            }}
            placeholder="시작 날짜 (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
          />
        </InputContainer>
        <InputContainer>
          <TextInput
            style={{
              // styles 객체를 인라인 스타일로 변경
              flex: 1,
              paddingVertical: 10,
              fontSize: 16,
              color: themes.light.textColor.textPrimary,
            }}
            placeholder="종료 날짜 (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
          />
        </InputContainer>
        <SaveButton onPress={handleSave}>
          <SaveButtonText>저장</SaveButtonText>
        </SaveButton>
      </ScrollView>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.primary};
`;

const SaveButton = styled(TouchableOpacity)`
  background-color: ${themes.light.pointColor.Primary};
  padding: 15px;
  border-radius: 10px;
  align-items: center;
  margin-top: 20px;
`;

const SaveButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

export default AddMedicineRoutine;
