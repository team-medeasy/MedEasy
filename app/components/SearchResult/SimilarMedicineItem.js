import React from 'react';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { Tag } from '../../components';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { PlaceholderImage } from './PlaceholderImage';
import { getMedicineById } from '../../api/medicine';

export const SimilarMedicineItem = ({ item, navigation, isModal }) => {
  const {fontSizeMode} = useFontSize();
  
  const hasImage = !!item.item_image;

  const handlePressMedicine = async () => {
    try {
      const response = await getMedicineById(item.item_id);
      const medicineData = response.data.body;

      navigation.push('MedicineDetail', {
        item: medicineData,
        isModal: isModal,
      });
    } catch (error) {
      console.error('약 정보 불러오기 실패:', error);
    }
  };

  return (
    <TouchableOpacity
      style={{ marginRight: 15, width: 138.75 }}
      onPress={handlePressMedicine}
    >
      <View
        style={{
          width: 138.75,
          height: 74,
          borderRadius: 10,
        }}
      >
        {hasImage ? (
          <Image
            source={{ uri: item.item_image }}
            style={{
              width: 138.75,
              height: 74,
              borderRadius: 10,
              resizeMode: 'contain',
            }}
          />
        ) : (
          <PlaceholderImage />
        )}
      </View>
  
      <View style={{ marginTop: 15, gap: 8 }}>
        <Text
          style={{
            fontFamily: 'Pretendard-SemiBold',
            fontSize: FontSizes.caption[fontSizeMode],
            color: themes.light.textColor.Primary50,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.entp_name}
        </Text>
        <Text
          style={{
            fontFamily: 'Pretendard-Bold',
            fontSize: FontSizes.body[fontSizeMode],
            color: themes.light.textColor.textPrimary,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.item_name}
        </Text>
        <Tag
          sizeType="small"
          colorType="resultPrimary"
          overflowMode="ellipsis"
          maxLength="14"
        >
          {item.class_name || '약품 구분'}
        </Tag>
      </View>
    </TouchableOpacity>
  );  
};