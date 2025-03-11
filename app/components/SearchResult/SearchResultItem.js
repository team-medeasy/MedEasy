import React from 'react';
import styled from 'styled-components/native';
import {Tag} from './../index';
import {themes} from './../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';

const SearchResultItem = ({item, onPress}) => {
  return (
    <ItemContainer onPress={() => onPress(item.item_seq)}>
      <ImageContainer>
        <MedicineImage source={{uri: item.item_image}} resizeMode="stretch" />
      </ImageContainer>
      <InfoContainer>
        <ManufacturerText>{item.entp_name}</ManufacturerText>
        <MedicineNameText
          numberOfLines={1} // 한 줄로 제한
          ellipsizeMode="tail" 
        >
          {item.item_name}
        </MedicineNameText>
        <TypeContainer>
          <Tag sizeType="small" colorType="resultPrimary">
            {item.etc_otc_name}
          </Tag>
          <Tag sizeType="small" colorType="resultSecondary">
            {item.class_name}
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
  margin: 0 15px 25px 15px;
`;

const ImageContainer = styled.View`
  width: 140px;
  height: 74.67px;
  margin-right: 15px;
  border-radius: 10px;
`;

const MedicineImage = styled.Image`
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

export default SearchResultItem;
