import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { Tag } from './../index';
import FontSizes from '../../../assets/fonts/fontSizes';
import { themes } from '../../styles';

export const PrescriptionSearchResultItem = ({ item, onPress }) => {
  // 이미지가 없는 경우를 위한 기본 이미지 처리 로직 추가
  const handleImageError = (error) => {
    console.error('이미지 로드 오류:', error);
  };

  return (
    <ItemContainer onPress={() => onPress(item)}>
      <View style={{ flexDirection: 'row', gap: 15 }}>
        {item.item_image ? (
          <MedicineImage 
            source={{ uri: item.item_image }} 
            resizeMode="cover" 
            onError={handleImageError}
          />
        ) : (
          <PlaceholderImage>
            <Text style={{ color: '#aaa', fontSize: 12 }}>이미지 없음</Text>
          </PlaceholderImage>
        )}

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
                overflowMode='scroll'
                maxWidth='66'
              >
                {item.etc_otc_name || '정보 없음'}
              </Tag>
              <Tag 
                sizeType="small" 
                colorType="resultSecondary"
                overflowMode='scroll'
                maxWidth='130'
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
          paddingHorizontal: 24,
          paddingVertical: 20,
          gap: 16,
          borderRadius: 10,
        }}
      >
        <Routine 
          label={'한 번에 얼마나 투여하나요?'} 
          value={item.dose ? `${item.dose}정` : '3정'} 
        />
        <Routine 
          label={'언제 투여하나요?'} 
          value={getScheduleTime(item) || '아침, 저녁'} 
        />
        <Routine 
          label={'며칠간 투여하나요?'} 
          value={item.total_days ? `${item.total_days}일간` : '2일간'} 
        />
      </View>
    </ItemContainer>
  );
};

// 복용 시간 표시를 위한 유틸리티 함수
const getScheduleTime = (item) => {
  if (!item.user_schedules || item.user_schedules.length === 0) {
    return '아침, 저녁';
  }
  
  // recommended가 true인 스케줄만 필터링
  const recommendedSchedules = item.user_schedules
    .filter(s => s.recommended === true)
    .map(s => s.name || '');
  
  return recommendedSchedules.join(', ');
};

const Routine = ({ label, value }) => {
  return (
    <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
      <Text
        style={{
          color: themes.light.textColor.Primary50,
          fontFamily: 'Pretendard-SemiBold',
          fontSize: FontSizes.body.default,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: themes.light.textColor.textPrimary,
          fontFamily: 'Pretendard-Bold',
          fontSize: FontSizes.body.default,
          flex: 1,
          textAlign: 'right'
        }}
      >
        {value}
      </Text>
    </View>
  );
};

const ItemContainer = styled(TouchableOpacity)`
  margin-bottom: 28px;
  gap: 15px;
`;

const MedicineImage = styled.Image`
  width: 140px;
  height: 74px;
  border-radius: 10px;
`;

const PlaceholderImage = styled.View`
  width: 140px;
  height: 74px;
  border-radius: 10px;
  background-color: #f0f0f0;
  justify-content: center;
  align-items: center;
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