import React from 'react';
import styled from 'styled-components/native';
import { Modal, View } from 'react-native';
import { themes } from '../styles';
import { Button } from '../components';
import DatePicker from 'react-native-ui-datepicker'; // 새로운 라이브러리 import
import FontSizes from '../../assets/fonts/fontSizes';

const DateTimePickerModal = ({
  visible,
  onClose,
  onConfirm,
  mode,
  date,
  onChange,
  title,
}) => {

  const [selectedDate, setSelectedDate] = React.useState(date || new Date());

  // 날짜 변경 핸들러
  const handleDateChange = (dateVal) => {
    console.log("Selected date in DatePicker:", dateVal);
    setSelectedDate(dateVal);
    
    if (onChange) {
      // dateVal이 객체이고 date 속성이 있는지 확인
      let dateObject;
      
      if (dateVal && typeof dateVal === 'object' && dateVal.date) {
        // date 속성이 있는 경우 (로그 출력 형식과 일치)
        dateObject = new Date(dateVal.date);
      } else if (typeof dateVal === 'string') {
        // 문자열인 경우
        dateObject = new Date(dateVal);
      } else {
        // 그 외의 경우 (Date 객체이거나 다른 형식)
        dateObject = dateVal;
      }
      onChange(dateObject);
    }
  };

  // 확인 버튼 핸들러
  const handleConfirm = () => {
    // 선택된 날짜로 최종 업데이트
    if (onChange) {
      let dateObject;
      
      if (selectedDate && typeof selectedDate === 'object' && selectedDate.date) {
        // date 속성이 있는 경우
        dateObject = new Date(selectedDate.date);
      } else if (typeof selectedDate === 'string') {
        // 문자열인 경우
        dateObject = new Date(selectedDate);
      } else {
        // 그 외의 경우 (Date 객체이거나 다른 형식)
        dateObject = selectedDate;
      }
      onChange(dateObject);
    }
    onConfirm();
  };

  // YYYY-MM-DD 형식으로 변환하는 함수
  const formatDateToYYYYMMDD = (date) => {
    let dateObject;
  
    if (date && typeof date === 'object' && date.date) {
      dateObject = new Date(date.date);
    } else if (typeof date === 'string') {
      dateObject = new Date(date);
    } else {
      dateObject = date;
    }
  
    if (isNaN(dateObject)) return "Invalid Date";
  
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  };
  

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <ModalContainer onStartShouldSetResponder={() => true} onResponderRelease={onClose}>
        <ModalContent onStartShouldSetResponder={() => true}>
          <TopBar />
          <ModalTitle>{title}</ModalTitle>
          <View style={{ margin: 20, width: '100%' }}>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              mode={mode === 'date' ? 'single' : 'time'}
              locale="ko"
              selectedItemColor={themes.light.boxColor.buttonPrimary}
              calendarTextStyle={{
                fontFamily: 'Pretendard-Medium',
                color: themes.light.textColor.textPrimary,
              }}
              headerTextStyle={{
                fontFamily: 'Pretendard-SemiBold',
                color: themes.light.textColor.textPrimary,
              }}
            />
          </View>
          
          {/* 선택된 날짜를 YYYY-MM-DD 형식으로 표시 */}
          <DateDisplay>
            <DateText>선택된 날짜: {formatDateToYYYYMMDD(selectedDate)}</DateText>
          </DateDisplay>
          
          <Button
            title="확인"
            onPress={handleConfirm}
            bgColor={themes.light.boxColor.buttonPrimary}
            textColor={themes.light.textColor.buttonText}
          />
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

const ModalContainer = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.modalBG};
  justify-content: flex-end;
`;

const ModalContent = styled.View`
  width: 100%;
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

// 선택된 날짜를 표시하기 위한 스타일 컴포넌트 추가
const DateDisplay = styled.View`
  margin: 15px 0;
  padding: 10px 20px;
  background-color: ${themes.light.boxColor.inputSecondary};
  border-radius: 10px;
  width: 90%;
  align-items: center;
`;

const DateText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.textPrimary};
`;

export { DateTimePickerModal };