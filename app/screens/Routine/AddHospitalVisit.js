import React, { useState } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader, DateTimePickerModal } from '../../components';
import { RoutineIcons } from '../../../assets/icons';
import { Button } from '../../components/Button';
import FontSizes from '../../../assets/fonts/fontSizes';

const { hospital: HospitalIcon } = RoutineIcons;

const AddHospitalVisit = () => {
  const currentDate = new Date();
  const [hospitalName, setHospitalName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' 또는 'time'
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    return `${ampm} ${formattedHours}시 ${formattedMinutes}분`;
  };

  const [time, setTime] = useState(formatTime(currentDate));
  const [date, setDate] = useState(formatDate(currentDate));

  const handleAdd = () => {
    console.log('병원 일정명:', hospitalName);
    console.log('시간:', time);
    console.log('날짜:', date);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setSelectedDate(currentDate);
  };

  const getModalTitleText = () => {
    return pickerMode === 'date' ? '방문할 날짜를 선택해주세요.' : '방문할 시간을 선택해주세요.';
  };

  const handleConfirm = () => {
    if (pickerMode === 'date') {
      setDate(formatDate(selectedDate));
    } else {
      setTime(formatTime(selectedDate));
    }
    setShowModal(false);
  };

  const openDatePicker = () => {
    setPickerMode('date');
    setShowModal(true);
  };

  const openTimePicker = () => {
    setPickerMode('time');
    setShowModal(true);
  };

  return (
    <Container>
      <ModalHeader
        showDelete={true}
        onDeletePress={() => {}}
      >병원 일정 추가</ModalHeader>
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
          <SchedulePicker onPress={openDatePicker}>
            <PickerPlaceHolder>
              {date}
            </PickerPlaceHolder>
          </SchedulePicker>
        </SchedulePickerContainer>
        <SchedulePickerContainer>
          <PickerTitle>시각</PickerTitle>
          <SchedulePicker onPress={openTimePicker}>
            <PickerPlaceHolder>
              {time}
            </PickerPlaceHolder>
          </SchedulePicker>
        </SchedulePickerContainer>
      </MainContainer>

      <DateTimePickerModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        mode={pickerMode}
        date={selectedDate}
        onChange={onDateChange}
        title={getModalTitleText()}
      />

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
  font-size: ${FontSizes.title.default};
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-ExtraBold';
`;

const SchedulePickerContainer = styled.View``;

const PickerTitle = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'Pretendard-Bold';
  margin-bottom: 15px;
  color: ${themes.light.textColor.textPrimary};
`;

const PickerPlaceHolder = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
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