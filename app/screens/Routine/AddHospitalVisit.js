import React, {useState} from 'react';
import styled from 'styled-components/native';
import {ScrollView, TouchableOpacity} from 'react-native';
import {themes} from './../../styles';
import {Header} from '../../components';
import {RoutineIcons} from '../../../assets/icons';
import {Button} from '../../components/Button';

const {hospital: HospitalIcon} = RoutineIcons;

const AddHospitalVisit = () => {
  const [hospitalName, setHospitalName] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  const handleAdd = () => {
    // 추가 로직 구현
    console.log('병원 일정명:', hospitalName);
    console.log('시간:', time);
    console.log('날짜:', date);
  };

  return (
    <Container>
      <Header>병원 진료 추가</Header>
      <MainContainer>
        <InputContainer>
          <HospitalIcon
            width={20}
            height={20}
            style={{marginRight: 10, color: themes.light.pointColor.Secondary}}
          />
          <TextInput
            placeholder="예: 메디지병원 진료 예약"
            placeholderTextColor={themes.light.textColor.Primary20}
            value={hospitalName}
            onChangeText={setHospitalName}
          />
        </InputContainer>
        <SchedulePickerContainer>
          <PickerTitle>날짜</PickerTitle>
          <SchedulePicker>
            <PickerPlaceHolder>날짜를 선택해주세요.</PickerPlaceHolder>
          </SchedulePicker>
        </SchedulePickerContainer>
        <SchedulePickerContainer>
          <PickerTitle>시각</PickerTitle>
          <SchedulePicker>
            <PickerPlaceHolder>시각을 선택해주세요.</PickerPlaceHolder>
          </SchedulePicker>
        </SchedulePickerContainer>
      </MainContainer>
      <BtnContainer>
        <Button
          title="루틴 추가하기"
          onPress={handleAdd}
          bgColor={themes.light.boxColor.buttonPrimary}
          width="100%"
          height="60px"
          fontSize="18px"
        />
      </BtnContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const MainContainer = styled.View`
  padding: 0px 20px;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 30px 0px;
`;

const TextInput = styled.TextInput`
  flex: 1;
  font-size: 22px;
  color: ${themes.light.textColor.Primary};
  font-family: 'Pretendard-ExtraBold';
`;

const SchedulePickerContainer = styled.View``;

const PickerTitle = styled.Text`
  font-size: 18px;
  font-family: 'Pretendard-Bold';
  margin-bottom: 15px;
  color: ${themes.light.textColor.Primary};
`;

const PickerPlaceHolder = styled.Text`
  font-size: 15px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.Primary30};
`;

const SchedulePicker = styled(TouchableOpacity)`
  width: 100%;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 18px 15px;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const BtnContainer = styled.View`
  margin-top: auto;
  padding: 0px 20px;
  padding-bottom: 30px;
`;

export default AddHospitalVisit;
