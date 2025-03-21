import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { Tag, Button, MedicineAppearance } from './../index';
import FontSizes from '../../../assets/fonts/fontSizes';
import { themes } from '../../styles';

export const CameraSearchResultItem = ({ item, onPress }) => {
  return (
    <ItemContainer>
      <ImageContainer>
        <TopHalfContainer>
          <LeftHalfImage source={{ uri: item.item_image }} resizeMode="cover" />
        </TopHalfContainer>
        <BottomHalfContainer>
          <RightHalfImage source={{ uri: item.item_image }} resizeMode="cover" />
        </BottomHalfContainer>
      </ImageContainer>

      <InfoContainer>
        <View style={{ flexDirection: 'row', gap: 11, marginBottom: 9 }}>
          <Tag 
            sizeType="small" 
            colorType="resultPrimary"
            overflowMode='ellipsis'
            maxWidth='66'
          >
            {item.etc_otc_name || '정보 없음'}
          </Tag>
          <Tag 
            sizeType="small" 
            colorType="resultSecondary"
            overflowMode='ellipsis'
            maxWidth='150'
          >
            {item.class_name || '정보 없음'}
          </Tag>
        </View>

        <View style={{ gap: 13 }}>
          <View style={{ gap: 5 }}>
            <MedicineName numberOfLines={1} ellipsizeMode="tail">
              {item.item_name || '정보 없음'}
            </MedicineName>
            <Description numberOfLines={2} ellipsizeMode="tail">
              {item.chart || '정보 없음'}
            </Description>
          </View>

          <MedicineAppearance item={item} />

          <Button
            title="이 약이 맞아요"
            fontSize="15"
            height="40"
            onPress={() => onPress(item)}
          />
        </View>
      </InfoContainer>
    </ItemContainer>
  );
};

const ItemContainer = styled.View`
  flex-direction: row;
  margin-bottom: 40px;
  gap: 20px;
`;

const ImageContainer = styled.View`
  width: 117px;
  height: 250px;
  flex-direction: column;
`;

const HalfImageContainer = styled.View`
  width: 117px;
  height: 125px;
  flex-shrink: 0;
  overflow: hidden;
`;

const LeftHalfImage = styled.Image`
  width: 234px;
  height: 125px;
  position: absolute;
  left: 0;
  border-radius: 10px 10px 0px 0px;
`;

const RightHalfImage = styled.Image`
  width: 234px;
  height: 125px;
  position: absolute;
  left: -117px;
  border-radius: 0px 0px 10px 10px;
`;

const TopHalfContainer = styled(HalfImageContainer)`
  border-radius: 10px 10px 0 0;
`;

const BottomHalfContainer = styled(HalfImageContainer)`
  border-radius: 0 0 10px 10px;
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