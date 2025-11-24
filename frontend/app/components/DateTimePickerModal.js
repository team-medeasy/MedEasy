import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { themes } from '../styles';
import { Button } from '../components';
import CustomModal from './CustomModal';
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
    <CustomModal
      visible={visible}
      onClose={onClose}>
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
    </CustomModal>
  );
};

const ModalTitle = styled.Text`
  font-family: 'KimjungchulGothic-Bold';
  font-size: ${({ fontSizeMode }) => FontSizes.title[fontSizeMode]};
  color: ${themes.light.textColor.textPrimary};
  margin-top: 15px;
`;

export { DateTimePickerModal };