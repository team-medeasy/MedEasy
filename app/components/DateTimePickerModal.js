import React from 'react';
import styled from 'styled-components/native';
import { Modal, View } from 'react-native';
import { themes } from '../styles';
import { Button } from '../components';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontSizes from '../../assets/fonts/fontSizes';
import { useFontSize } from '../../assets/fonts/FontSizeContext';

const DateTimePickerModal = ({
  visible,
  onClose,
  onConfirm,
  mode,
  date,
  onChange,
  title,
}) => {

  const { fontSizeMode } = useFontSize();

  // 선택 확인 버튼 핸들러
  const handleConfirm = () => {
    onConfirm();
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
          <ModalTitle fontSizeMode={fontSizeMode}>{title}</ModalTitle>
          <View style={{ margin: 30 }}>
            <DateTimePicker
              value={date}
              mode={mode}
              display="spinner"
              onChange={onChange}
              locale="ko"
            />
          </View>
          <Button title="확인" onPress={handleConfirm} />
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
  font-size: ${({ fontSizeMode }) => FontSizes.title[fontSizeMode]}px;
  color: ${themes.light.textColor.textPrimary};
`;

export { DateTimePickerModal };