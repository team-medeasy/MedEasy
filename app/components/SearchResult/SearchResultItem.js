import React from 'react';
import styled from 'styled-components/native';
import {Tag} from './../index';
import {themes} from './../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {LogoIcons} from '../../../assets/icons';
import {PlaceholderImage} from './PlaceholderImage';

export const SearchResultItem = ({item, onPress}) => {
  const hasImage = !!item.item_image;

  return (
    <ItemContainer onPress={() => onPress(item)}>
      <ImageContainer>
        {hasImage ? (
          <MedicineImage source={{uri: item.item_image}} />
        ) : (
          <PlaceholderImage />
        )}
      </ImageContainer>
      <InfoContainer>
        <ManufacturerText>{item.entp_name || '정보 없음'}</ManufacturerText>
        <MedicineNameText
          numberOfLines={1} // 한 줄로 제한
          ellipsizeMode="tail">
          {item.item_name || '정보 없음'}
        </MedicineNameText>
        <TypeContainer>
          <Tag
            sizeType="small"
            colorType="resultPrimary"
            overflowMode="ellipsis"
            maxWidth="66">
            {item.etc_otc_name || '정보 없음'}
          </Tag>
          <Tag
            sizeType="small"
            colorType="resultSecondary"
            overflowMode="ellipsis"
            maxWidth="128"
            maxLength="14">
            {item.class_name || '정보 없음'}
          </Tag>
        </TypeContainer>
      </InfoContainer>
    </ItemContainer>
  );
};

const ItemContainer = styled.TouchableOpacity`
  height: 74.67px;
  flex-direction: row;
  align-items: center;
  margin: 12px 15px 12px 15px;
`;

const ImageContainer = styled.View`
  width: 140px;
  height: 74.67px;
  margin-right: 15px;
  border-radius: 10px;
`;

const MedicineImage = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

const InfoContainer = styled.View`
  flex: 1;
  height: 100%;
  gap: 7px;
  justify-content: center;
`;

const ManufacturerText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.Primary50};
`;

const MedicineNameText = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'Pretendard-Bold';
  color: ${themes.light.textColor.textPrimary};
`;

const TypeContainer = styled.View`
  flex-direction: row;
  gap: 11px;
`;
