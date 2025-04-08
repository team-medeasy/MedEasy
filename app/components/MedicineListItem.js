import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import { Tag } from './Tag';
import FontSizes from '../../assets/fonts/fontSizes';
import { themes } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { getUserMedicinesCurrent } from '../api/user';

export const MedicineListItem = ({ item }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [routineInfo, setRoutineInfo] = useState(null);

  const handlePress = () => {
    navigation.navigate('MedicineDetail', { item });
  };

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const response = await getUserMedicinesCurrent();
        const routines = response.data.body || [];
        console.log('정보 조회 데이터: ', routines);
        console.log('현재 아이템 ID:', item.id);
  
        // 현재 item에 해당하는 medicine_id와 일치하는 데이터 찾기
        const matched = routines.find(
          (medicine) => medicine.medicine_id === item.id
        );
  
        console.log('일치하는 데이터:', matched);
        
        if (matched) {
          setRoutineInfo(matched);
        }
      } catch (error) {
        console.error('약 루틴 정보 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMedicines();
  }, [item.id]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };
  
  // 요일 숫자 배열을 텍스트로 변환하는 함수 (1=월, 2=화, ..., 7=일)
  const getDayOfWeekText = (dayOfWeeks) => {
    if (!dayOfWeeks || dayOfWeeks.length === 0) return '정보 없음';
    
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    return dayOfWeeks.map(day => dayNames[(day - 1) % 7]).join(', ');
  };

  return (
    <ItemContainer onPress={handlePress}>
      <View style={{ flexDirection: 'row', gap: 15 }}>
        {/* API 응답과 일치하도록 속성명 변경 */}
        <MedicineImage 
          source={{ uri: item.medicine_image || item.item_image }} 
          resizeMode="cover" 
        />

        <InfoContainer>
          <View style={{ gap: 7 }}>
            <Description numberOfLines={2} ellipsizeMode="tail">
              {item.entp_name || '정보 없음'}
            </Description>
            <MedicineName numberOfLines={1} ellipsizeMode="tail">
              {item.medicine_name || item.item_name || '정보 없음'}
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
          value={routineInfo ? formatDate(routineInfo.routine_start_date) : '정보 없음'}
        />
        <Routine
          label={'복용량        '}
          value={
            routineInfo && routineInfo.schedule_size && routineInfo.dose
              ? `하루 ${routineInfo.schedule_size}번, ${routineInfo.dose}정씩`
              : '정보 없음'
          }
        />
        <Routine 
          label={'복용 주기    '} 
          value={routineInfo && routineInfo.day_of_weeks 
            ? getDayOfWeekText(routineInfo.day_of_weeks) 
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
