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

const {hospital: HospitalIcon} = RoutineIcons;

const AddHospitalVisit = () => {
  const [hospitalName, setHospitalName] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  const handleSave = () => {
    // 저장 로직 구현
    console.log('병원 이름:', hospitalName);
    console.log('시간:', time);
    console.log('날짜:', date);
  };

  return (
    <Container>
      <Header>병원 진료 추가</Header>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <InputContainer>
          <HospitalIcon
            width={20}
            height={20}
            style={{marginRight: 10, color: themes.light.pointColor.Secondary}}
          />
          <TextInput
            style={styles.input}
            placeholder="병원 이름"
            value={hospitalName}
            onChangeText={setHospitalName}
          />
        </InputContainer>
        <InputContainer>
          <TextInput
            style={styles.input}
            placeholder="시간 (예: 오전 10시)"
            value={time}
            onChangeText={setTime}
          />
        </InputContainer>
        <InputContainer>
          <TextInput
            style={styles.input}
            placeholder="날짜 (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
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

const styles = {
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: themes.light.textColor.textPrimary,
  },
};

const SaveButton = styled(TouchableOpacity)`
  background-color: ${themes.light.pointColor.Secondary};
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

export default AddHospitalVisit;
