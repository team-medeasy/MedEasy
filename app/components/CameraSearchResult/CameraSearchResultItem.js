import React from 'react';
import styled from 'styled-components/native';
import {View, Dimensions} from 'react-native';
import {Tag, Button, MedicineAppearance} from './../index';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {themes} from '../../styles';

export const CameraSearchResultItem = ({item, onPress}) => {
  const {fontSizeMode} = useFontSize();

  return (
    <ItemContainer>
      <FullWidthImageContainer>
        <PillImage 
          source={{uri: item.item_image}} 
          resizeMode="cover" // props로 전달
        />
      </FullWidthImageContainer>

      <InfoContainer>
        <View style={{flexDirection: 'row', gap: 8, marginBottom: 12}}>
          <Tag
            sizeType="small"
            colorType="resultPrimary"
            overflowMode="ellipsis"
            maxWidth="120"
          >
            {item.etc_otc_name || '정보 없음'}
          </Tag>
          <Tag
            sizeType="small"
            colorType="resultSecondary"
            overflowMode="ellipsis"
            maxWidth="200"
          >
            {item.class_name || '정보 없음'}
          </Tag>
        </View>

        <View style={{gap: 10}}>
          <View style={{gap: 10}}>
            <MedicineName 
              fontSizeMode={fontSizeMode}
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {item.item_name || '정보 없음'}
            </MedicineName>
            <Description 
              fontSizeMode={fontSizeMode}
              numberOfLines={2} 
              ellipsizeMode="tail"
            >
              {item.chart || '정보 없음'}
            </Description>
          </View>

          <MedicineAppearance item={item} style={{marginTop: 2}} />

          <Button
            title="이 약이 맞아요"
            fontSize="15"
            height="40"
            style={{marginTop: 12}}
            onPress={() => onPress({
              ...item,
              id: item.id,
            })}
          />
        </View>
      </InfoContainer>
    </ItemContainer>
  );
};

const ItemContainer = styled.View`
  flex-direction: column;
  margin-bottom: 32px;
`;

const FullWidthImageContainer = styled.View`
  width: 100%;
  height: 200px;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 12px;
  background-color: #f5f5f5;
`;

const PillImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const InfoContainer = styled.View`
  width: 100%;
`;

const MedicineName = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]};
  font-family: 'Pretendard-bold';
  color: ${themes.light.textColor.textPrimary};
`;

const Description = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-medium';
  color: ${themes.light.textColor.Primary50};
`;