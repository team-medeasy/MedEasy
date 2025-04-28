import React from 'react';
import styled from 'styled-components/native';
import {ImageBackground, TouchableOpacity, View} from 'react-native';
import {themes} from '../../styles';
import {RoutineIcons} from '../../../assets/icons';
import {Tag} from '..';
import FontSizes from '../../../assets/fonts/fontSizes';
import {PlaceholderImage} from '../SearchResult/PlaceholderImage';
import {updateInterestedMedicine} from '../../api/interestedMedicine';

const {heartOff: HeartOffIcon, heartOn: HeartOnIcon} = RoutineIcons;

const MedicineOverview = ({
  medicine,
  isFavorite,
  setIsFavorite,
  onPressEnlarge,
}) => {
  const hasImage = !!medicine.item_image;

  const handleFavoritePress = async () => {
    try {
      console.log('보낼 medicine_id:', medicine.id);
      await updateInterestedMedicine(medicine.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('관심 의약품 등록 실패:', error);
    }
  };

  return (
    <MedicineInfoContainer source={{uri: medicine.item_image}} blurRadius={15}>
      <Overlay />

      <ImageContainer>
        {hasImage ? (
          <MedicineImage source={{uri: medicine.item_image}} />
        ) : (
          <PlaceholderImage />
        )}
        <TouchableOpacity
          onPress={() => onPressEnlarge(medicine.item_seq)}
          style={{
            position: 'absolute',
            bottom: 14,
            right: 14,
          }}>
          <Tag bgColor={themes.light.boxColor.tagResultSecondary}>
            크게 보기
          </Tag>
        </TouchableOpacity>
      </ImageContainer>

      <View
        style={{
          alignItems: 'flex-start',
          flex: 1,
          marginTop: 19,
          marginHorizontal: 7,
          gap: 10,
        }}>
        <MedicineInfoSub>{medicine.entp_name || '정보 없음'}</MedicineInfoSub>
        <MedicineInfoName>{medicine.item_name || '정보 없음'}</MedicineInfoName>
        <MedicineInfoSub>{medicine.chart || '정보 없음'}</MedicineInfoSub>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
          <View style={{flexDirection: 'row', gap: 11}}>
            <Tag sizeType="large" colorType="detailPrimary" maxWidth="85">
              {medicine.etc_otc_name || '정보 없음'}
            </Tag>
            <Tag sizeType="large" colorType="detailSecondary" maxWidth="185">
              {medicine.class_name || '정보 없음'}
            </Tag>
          </View>

          <TouchableOpacity onPress={handleFavoritePress}>
            {isFavorite ? (
              <HeartOnIcon
                width={24}
                height={24}
                style={{color: themes.light.textColor.buttonText}}
              />
            ) : (
              <HeartOffIcon
                width={24}
                height={24}
                style={{color: themes.light.textColor.buttonText}}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </MedicineInfoContainer>
  );
};

const MedicineInfoContainer = styled(ImageBackground)`
  align-items: flex-start;
  padding: 38px 25px 25px 25px;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
`;

const ImageContainer = styled.View`
  width: 100%;
  height: 188px;
  position: relative;
  border-radius: 10px;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const MedicineImage = styled.Image.attrs({
  resizeMode: 'contain',
})`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

const MedicineInfoSub = styled.Text`
  flex: 1;
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.buttonText70};
`;

const MedicineInfoName = styled.Text`
  flex: 1;
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.title.default};
  color: ${themes.light.textColor.buttonText};
`;

export { MedicineOverview };
