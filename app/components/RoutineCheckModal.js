// components/RoutineCheckModal.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import CustomModal from './CustomModal';
import {Button} from './Button';
import RoutineCard from './RoutineCard';
import FontSizes from '../../assets/fonts/fontSizes';
import { themes } from '../styles';

const RoutineCheckModal = ({ visible, onClose, routineData }) => {
  // 데이터가 없으면 아무것도 렌더링하지 않음
  if (!routineData) {
    console.log('[RoutineCheckModal] routineData가 없어 렌더링하지 않음');
    return null;
  }
  
  console.log('[RoutineCheckModal] 렌더링 시작:', routineData);
  
  // 모든 약이 복용 완료된 상태를 표시하기 위해 체크 상태 설정
  const createCheckedItems = () => {
    const items = {};
    if (routineData.medicines) {
      routineData.medicines.forEach(medicine => {
        items[`${new Date().toISOString().split('T')[0]}-${routineData.timeKey}-${medicine.medicine_id}`] = true;
      });
    }
    return items;
  };
  
  return (
    <CustomModal visible={visible} onClose={onClose}>
      <Title>{routineData.label}약 기록 완료!</Title>
      <Text>
        {routineData.time}의 {routineData.label}약을 모두 먹었어요!
      </Text>
      <View style={{width: '100%', paddingHorizontal: 16}}>
        <RoutineCard
          routine={routineData}
          checkedItems={createCheckedItems()}
          toggleCheck={() => {}}
          toggleTimeCheck={() => {}}
          toggleHospitalCheck={() => {}}
          isInModal={true}
          selectedDateString={new Date().toISOString().split('T')[0]}
          index={0}
          allLength={1}
        />
      </View>
      <Button title="확인" onPress={onClose} />
      <TouchableOpacity>
        <EditText>기록을 수정하고 싶어요.</EditText>
      </TouchableOpacity>
    </CustomModal>
  );
};

const Title = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
  padding-top: 30px;
`;

const Text = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
  padding: 8px 0 24px 0;
`;

const EditText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
  padding-top: 16px;
  text-decoration-line: underline;
`;

export default RoutineCheckModal;