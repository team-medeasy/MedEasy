import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, TouchableOpacity, Modal, View } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader } from '../../components';
import { RoutineIcons } from '../../../assets/icons';
import { Button } from '../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';

const { hospital: HospitalIcon } = RoutineIcons;

const AddHospitalVisit = () => {
  const [hospitalName, setHospitalName] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleAdd = () => {
    // 추가 로직 구현
    console.log('병원 일정명:', hospitalName);
    console.log('시간:', time);
    console.log('날짜:', date);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${ampm} ${formattedHours}:${formattedMinutes}`;
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    setDate(formatDate(currentDate));
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || new Date();
    setShowTimePicker(false);
    setSelectedDate(currentTime);
    setTime(formatTime(currentTime));
  };

  return (
    <Container>
      <ModalHeader>병원 진료 추가</ModalHeader>
      <MainContainer>
        <InputContainer>
          <HospitalIcon
            width={20}
            height={20}
            style={{ marginRight: 10, color: themes.light.pointColor.Secondary }}
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
          <SchedulePicker onPress={() => setShowDatePicker(true)}>
            <PickerPlaceHolder>
              {date || '날짜를 선택해주세요.'}
            </PickerPlaceHolder>
          </SchedulePicker>
        </SchedulePickerContainer>
        <SchedulePickerContainer>
          <PickerTitle>시각</PickerTitle>
          <SchedulePicker onPress={() => setShowTimePicker(true)}>
            <PickerPlaceHolder>
              {time || '시각을 선택해주세요.'}
            </PickerPlaceHolder>
          </SchedulePicker>
        </SchedulePickerContainer>
      </MainContainer>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <ModalContainer>
          <ModalContent>
            <TopBar />
            <ModalCloseBar>
              <ModalTitle>방문할 날짜를 선택해주세요.</ModalTitle>
            </ModalCloseBar>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={onDateChange}
              locale="ko"
            />
            <ConfirmButton onPress={() => {
              setDate(formatDate(selectedDate));
              setShowDatePicker(false);
            }}>
              <ConfirmButtonText>확인</ConfirmButtonText>
            </ConfirmButton>
          </ModalContent>
        </ModalContainer>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showTimePicker}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <ModalContainer>
          <ModalContent>
            <TopBar />
            <ModalCloseBar>
              <ModalTitle>방문할 시간을 선택해주세요.</ModalTitle>
            </ModalCloseBar>
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display="spinner"
              onChange={onTimeChange}
              locale="ko"
            />
            <ConfirmButton onPress={() => {
              setTime(formatTime(selectedDate));
              setShowTimePicker(false);
            }}>
              <ConfirmButtonText>확인</ConfirmButtonText>
            </ConfirmButton>
          </ModalContent>
        </ModalContainer>
      </Modal>

      <BtnContainer>
        <Button
          title="루틴 추가하기"
          onPress={handleAdd}
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

const ModalContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
  background-color: ${themes.light.bgColor.modalBG};
`;

const ModalContent = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  border-radius: 40px;
  padding: 40px 20px;
  align-items: center;
`;

const TopBar = styled.View`
  position: absolute;
  top: 10px;
  width: 40px;
  height: 5px;
  background-color: ${themes.light.textColor.Primary30};
  border-radius: 4px;
`;

const ModalCloseBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ModalTitle = styled.Text`
  font-size: 22px;
  font-family: 'Pretendard-Bold';
  color: ${themes.light.textColor.Primary};
`;

const ConfirmButton = styled.TouchableOpacity`
  background-color: ${themes.light.boxColor.buttonPrimary};
  padding: 15px;
  border-radius: 10px;
  width: 100%;
  align-items: center;
  margin-top: 15px;
`;

const ConfirmButtonText = styled.Text`
  font-size: 18px;
  font-family: 'Pretendard-Bold';
  color: ${themes.light.textColor.buttonText};
`;

export default AddHospitalVisit;