import React from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import { SearchResultItem } from './../components';
import FontSizes from '../../assets/fonts/fontSizes';
import { useFontSize } from '../../assets/fonts/FontSizeContext';
import { themes } from '../styles';

export const MedicineListItem = ({ item, onPress }) => {
  const { fontSizeMode } = useFontSize();

  // 종료일이 오늘을 지났는지 확인
  const isPastMedicine = () => {
    if (!item || !item.routine_end_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(item.routine_end_date);
    endDate.setHours(0, 0, 0, 0);

    return endDate < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const isPast = isPastMedicine();

  // SearchResultItem에 전달할 데이터 객체 생성
  const searchResultItemData = {
    item_image: item.medicine_image,
    entp_name: item.entp_name,
    item_name: item.medicine_name || item.nickname,
    etc_otc_name: item.etc_otc_name,
    class_name: item.class_name
  };

  return (
    <ItemContainer>
      <SearchResultItem 
        item={searchResultItemData} 
        onPress={() => onPress(item)} 
      />

      <RoutineInfoContainer>
        <Routine
          label={isPast ? '복용 기간    ' : '복용 시작일'}
          value={
            isPast && item.routine_start_date && item.routine_end_date
              ? `${formatDate(item.routine_start_date)} ~ ${formatDate(item.routine_end_date)}`
              : item.routine_start_date
                ? formatDate(item.routine_start_date)
                : '정보 없음'
          }
          fontSizeMode={fontSizeMode}
        />
        <Routine
          label={'복용량        '}
          value={
            item.schedule_size && item.dose
              ? `하루 ${item.schedule_size}번, ${item.dose}정씩`
              : '정보 없음'
          }
          fontSizeMode={fontSizeMode}
        />
        <Routine
          label={'복용 주기    '}
          value={item.interval_days != null
            ? (item.interval_days === 1
              ? '매일'
              : `${item.interval_days}일에 한 번`)
            : '정보 없음'}
          fontSizeMode={fontSizeMode}
        />
      </RoutineInfoContainer>
    </ItemContainer>
  );
};

const Routine = ({ label, value, fontSizeMode }) => {
  return (
    <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
      <Text
        style={{
          color: themes.light.textColor.Primary50,
          fontFamily: 'Pretendard-Medium',
          fontSize: FontSizes.caption[fontSizeMode || 'default'],
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: themes.light.pointColor.Primary,
          fontFamily: 'Pretendard-Bold',
          fontSize: FontSizes.caption[fontSizeMode || 'default'],
          flex: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
};

const ItemContainer = styled.View`
  margin-bottom: 28px;
`;

const RoutineInfoContainer = styled.View`
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 10px;
  margin-left: 15px;
  gap: 8px;
  border-radius: 10px;
  margin-top: 15px;
`;