import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Alert, ImageBackground, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { themes } from '../../styles';
import { ChatIcons, RoutineIcons } from '../../../assets/icons';
import { Tag } from '..';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { PlaceholderImage } from '../SearchResult/PlaceholderImage';
import { updateInterestedMedicine, getInterestedMedicineStatus } from '../../api/interestedMedicine';

const { heartOff: HeartOffIcon, heartOn: HeartOnIcon } = RoutineIcons;

const MedicineOverview = ({
  medicine,
  onPressEnlarge,
}) => {
  const {fontSizeMode} = useFontSize();
  const hasImage = !!medicine.item_image;
  const [isFavorite, setIsFavorite] = useState(false);

  // 화면에 포커스될 때마다 관심 약품 상태 확인
  useFocusEffect(
    React.useCallback(() => {
      const checkFavoriteStatus = async () => {
        try {
          const response = await getInterestedMedicineStatus(medicine.item_id);
          console.log('🤍 관심 약품 상태 응답:', response.data.body);
          setIsFavorite(response.data.body.is_interested_medicine);
        } catch (error) {
          console.error('관심 의약품 상태 확인 실패:', error);
        }
      };

      checkFavoriteStatus();
      
      // 클린업 함수는 화면이 언포커스될 때 실행됨
      return () => {
        // 필요한 클린업 작업이 있다면 여기에 작성
      };
    }, [medicine.item_id])
  );

  const handleFavoritePress = async () => {
    try {
      console.log('❤️ 관심 의약품 등록 medicine_id:', medicine.item_id);
      await updateInterestedMedicine(medicine.item_id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('💔 관심 의약품 등록 실패:', error);
    }
  };

  return (
    <MedicineInfoContainer source={{ uri: medicine.item_image }} blurRadius={15}>
      <Overlay />

      <ImageContainer>
        {hasImage ? (
          <MedicineImage source={{ uri: medicine.item_image }} />
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
        <MedicineInfoSub fontSizeMode={fontSizeMode}>
          {medicine.entp_name || '정보 없음'}
        </MedicineInfoSub>
        <MedicineInfoName fontSizeMode={fontSizeMode}>
          {medicine.item_name || '정보 없음'}
        </MedicineInfoName>
        <MedicineInfoSub fontSizeMode={fontSizeMode}>
          {medicine.chart || '정보 없음'}
        </MedicineInfoSub>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <Tag 
              sizeType="large"
              colorType="detailPrimary"
              maxWidth="105">
              {medicine.etc_otc_name || '정보 없음'}
            </Tag>
            <Tag 
              sizeType="large"
              colorType="detailSecondary"
              maxWidth="150">
              {medicine.class_name || '정보 없음'}
            </Tag>
          </View>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <TouchableOpacity onPress={handleFavoritePress}>
              {isFavorite ? (
                <HeartOnIcon
                  width={24}
                  height={24}
                  style={{ color: themes.light.textColor.buttonText }}
                />
              ) : (
                <HeartOffIcon
                  width={24}
                  height={24}
                  style={{ color: themes.light.textColor.buttonText }}
                />
              )}
            </TouchableOpacity>
          </View>
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
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.buttonText70};
`;

const MedicineInfoName = styled.Text`
  flex: 1;
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  color: ${themes.light.textColor.buttonText};
`;

export { MedicineOverview };