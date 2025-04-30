import React from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import { Tag } from './Tag';
import FontSizes from '../../assets/fonts/fontSizes';
import { themes } from '../styles';

export const MedicineListItem = ({ item, onPress }) => {

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

  return (
    <ItemContainer onPress={onPress}>
      <View style={{ flexDirection: 'row', gap: 15 }}>
        <MedicineImage
          source={{ uri: item.medicine_image }}
          resizeMode="cover"
        />

        <InfoContainer>
          <View style={{ gap: 7 }}>
            <Description numberOfLines={2} ellipsizeMode="tail">
              {item.entp_name || '정보 없음'}
            </Description>
            <MedicineName numberOfLines={1} ellipsizeMode="tail">
              {item.medicine_name || item.nickname || '정보 없음'}
            </MedicineName>

            <View style={{ flexDirection: 'row', gap: 11 }}>
              <Tag
                sizeType="small"
                colorType="resultPrimary"
                overflowMode="ellipsis"
                maxWidth="66"
              >
                {item.etc_otc_name || '정보 없음'}
              </Tag>
              <Tag
                sizeType="small"
                colorType="resultSecondary"
                overflowMode="ellipsis"
                maxWidth="110"
                maxLength={10}
              >
                {item.class_name || '정보 없음'}
              </Tag>
            </View>
          </View>
        </InfoContainer>
      </View>

      <View
        style={{
          backgroundColor: themes.light.boxColor.inputPrimary,
          padding: 10,
          gap: 8,
          borderRadius: 10,
        }}
      >
        <Routine
          label={isPast ? '복용 기간    ' : '복용 시작일'}
          value={
            isPast && item.routine_start_date && item.routine_end_date
              ? `${formatDate(item.routine_start_date)} ~ ${formatDate(item.routine_end_date)}`
              : item.routine_start_date
                ? formatDate(item.routine_start_date)
                : '정보 없음'
          }
        />
        <Routine
          label={'복용량        '}
          value={
            item.schedule_size && item.dose
              ? `하루 ${item.schedule_size}번, ${item.dose}정씩`
              : '정보 없음'
          }
        />
        <Routine
          label={'복용 주기    '}
          value={item.interval_days != null
            ? (item.interval_days === 1
              ? '매일'
              : `${item.interval_days}일에 한 번`)
            : '정보 없음'}
        />
      </View>
    </ItemContainer>
  );
};


const Routine = ({ label, value }) => {
  return (
    <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
      <Text
        style={{
          color: themes.light.textColor.Primary50,
          fontFamily: 'Pretendard-Medium',
          fontSize: FontSizes.caption.default,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: themes.light.pointColor.Primary,
          fontFamily: 'Pretendard-Bold',
          fontSize: FontSizes.caption.default,
          flex: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
};

const ItemContainer = styled.TouchableOpacity`
  margin-bottom: 28px;
  gap: 15px;
`;

const MedicineImage = styled.Image`
  width: 140px;
  height: 74px;
  border-radius: 10px;
`;

const InfoContainer = styled.View`
  flex: 1;
`;

const MedicineName = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'Pretendard-bold';
  color: ${themes.light.textColor.textPrimary};
`;

const Description = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-medium';
  color: ${themes.light.textColor.Primary50};
`;