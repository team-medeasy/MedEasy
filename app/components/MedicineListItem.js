import React from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import { Tag } from './Tag';
import FontSizes from '../../assets/fonts/fontSizes';
import { themes } from '../styles';

export const MedicineListItem = ({ item }) => {
  return (
    <ItemContainer>
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
                        overflowMode='scroll'
                        maxWidth='66'
                    >
                        {item.etc_otc_name || '정보 없음'}
                    </Tag>
                    <Tag 
                        sizeType="small" 
                        colorType="resultSecondary"
                        overflowMode='scroll'
                        maxWidth='110'
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
      }}>
        <Routine 
          label={'복용 시작일'} 
          value={'2025년 3월 29일'}/>
        <Routine 
          label={'복용량        '} 
          value={'하루 3번, 2정씩'}/>
        <Routine 
          label={'복용 주기    '} 
          value={'월, 수, 금'}/>
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
        }}>
          {label}
        </Text>
        <Text
          style={{
            color: themes.light.pointColor.Primary,
            fontFamily: 'Pretendard-Bold',
            fontSize: FontSizes.caption.default,
            flex: 1,
        }}>
          {value}
        </Text>
    </View>
  );
}
 
const ItemContainer = styled.View`
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