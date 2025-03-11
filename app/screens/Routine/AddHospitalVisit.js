import React, { useState } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity, Modal, View } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader } from '../../components';
import { RoutineIcons } from '../../../assets/icons';
import { Button } from '../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontSizes from '../../../assets/fonts/fontSizes';

const { hospital: HospitalIcon } = RoutineIcons;

const AddHospitalVisit = () => {
  const [hospitalName, setHospitalName] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' 또는 'time'
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
          <SchedulePicker onPress={openDatePicker}>
            <PickerPlaceHolder>
              {date || '날짜를 선택해주세요.'}
            </PickerPlaceHolder>
          </SchedulePicker>
        </SchedulePickerContainer>
        <SchedulePickerContainer>
          <PickerTitle>시각</PickerTitle>
          <SchedulePicker onPress={openTimePicker}>
            <PickerPlaceHolder>
              {time || '시각을 선택해주세요.'}
            </PickerPlaceHolder>
          </SchedulePicker>
        </SchedulePickerContainer>
      </MainContainer>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <ModalContainer>
          <ModalContent>
            <TopBar />
            <ModalTitle>{getModalTitleText()}</ModalTitle>
            <View
              style={{
                margin: 30,
              }}>
              <DateTimePicker
                value={selectedDate}
                mode={pickerMode}
                display="spinner"
                onChange={onDateChange}
                locale="ko"
              />
            </View>
            <Button title="확인" onPress={handleConfirm} />
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

// 새로운 모달 스타일 적용
const ModalContainer = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.modalBG};
`;

const ModalContent = styled.View`
  width: 100%;
  margin-top: auto;
  background-color: ${themes.light.bgColor.bgPrimary};
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px 0px 20px;
  padding-bottom: 40px;
`;

const TopBar = styled.View`
  width: 40px;
  height: 5px;
  border-radius: 4px;
  background-color: ${themes.light.boxColor.modalBar};
  margin-bottom: 25px;
`;

const ModalTitle = styled.Text`
  font-family: 'KimjungchulGothic-Bold';
  font-size: ${FontSizes.title.default};
  color: ${themes.light.textColor.textPrimary};
`;

export default AddHospitalVisit;