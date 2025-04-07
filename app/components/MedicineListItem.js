import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import { Tag } from './Tag';
import FontSizes from '../../assets/fonts/fontSizes';
import { themes } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { getRoutineByDate } from '../api/routine';

export const MedicineListItem = ({ item }) => {
  const navigation = useNavigation();
  const [doses, setDoses] = useState({
    timesPerDay: 0,
    dosePerTime: null,
    startDate: null,
  });

  const handlePress = () => {
    navigation.navigate('MedicineDetail', { item });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchRoutine = async () => {
      try {
        const response = await getRoutineByDate('2025-03-01', '2025-12-31');
        const routines = response.data.body || [];

        const scheduleSet = new Set();
        let doseValue = null;
        let firstDate = null;

        routines.forEach((day) => {
          let foundInDay = false;

          day.user_schedule_dtos.forEach((schedule) => {
            schedule.routine_medicine_dtos.forEach((med) => {
              if (med.medicine_id === item.id) {
                scheduleSet.add(schedule.user_schedule_id);
                doseValue = med.dose;

                if (!foundInDay) {
                  if (!firstDate || new Date(day.take_date) < new Date(firstDate)) {
                    firstDate = day.take_date;
                    foundInDay = true;
                  }
                }
              }
            });
          });
        });

        if (isMounted) {
          setDoses({
            timesPerDay: scheduleSet.size,
            dosePerTime: doseValue,
            startDate: firstDate,
          });
        }
      } catch (error) {
        console.error('루틴 데이터 불러오기 실패:', error);
      }
    };

    fetchRoutine();

    return () => {
      isMounted = false;
    };
  }, [item.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <ItemContainer onPress={handlePress}>
      <View style={{ flexDirection: 'row', gap: 15 }}>
        <MedicineImage source={{ uri: item.item_image }} resizeMode="cover" />

        <InfoContainer>
          <View style={{ gap: 7 }}>
            <Description numberOfLines={2} ellipsizeMode="tail">
              {item.entp_name || '정보 없음'}
            </Description>
            <MedicineName numberOfLines={1} ellipsizeMode="tail">
              {item.item_name || '정보 없음'}
            </MedicineName>

            <View style={{ flexDirection: 'row', gap: 11 }}>
              <Tag
                sizeType="small"
                colorType="resultPrimary"
                overflowMode="scroll"
                maxWidth="66"
              >
                {item.etc_otc_name || '정보 없음'}
              </Tag>
              <Tag
                sizeType="small"
                colorType="resultSecondary"
                overflowMode="scroll"
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
          label={'복용 시작일'}
          value={doses.startDate ? formatDate(doses.startDate) : '정보 없음'}
        />
        <Routine
          label={'복용량        '}
          value={
            doses.timesPerDay && doses.dosePerTime
              ? `하루 ${doses.timesPerDay}번, ${doses.dosePerTime}정씩`
              : '정보 없음'
          }
        />
        <Routine label={'복용 주기    '} value={'월, 수, 금'} />
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
