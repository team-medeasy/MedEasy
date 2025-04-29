import React from 'react';
import styled from 'styled-components/native';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import { themes } from '../../styles';
import { ChatIcons, RoutineIcons } from '../../../assets/icons';
import { Tag } from '..';
import FontSizes from '../../../assets/fonts/fontSizes';
import { PlaceholderImage } from '../SearchResult/PlaceholderImage';
import { updateInterestedMedicine } from '../../api/interestedMedicine';
import { getMedicineAudioUrl } from '../../api/medicine';

import Sound from 'react-native-sound';

const { heartOff: HeartOffIcon, heartOn: HeartOnIcon } = RoutineIcons;

const MedicineOverview = ({
  medicine,
  isFavorite,
  setIsFavorite,
  onPressEnlarge,
}) => {
  const hasImage = !!medicine.item_image;

  const handleAudioPress = async (medicineId) => {
    try {
      console.log('음성 파일 요청 시작:', medicineId);
      const response = await getMedicineAudioUrl(medicineId);
      const audioUrl = response.data.body;

      if (audioUrl) {
        console.log('받아온 음성 URL:', audioUrl);
        // const sound = new Sound(audioUrl, undefined, (error) => {
        //   if (error) {
        //     console.error('오디오 로딩 실패:', error);
        //     return;
        //   }
        //   sound.play((success) => {
        //     if (success) {
        //       console.log('오디오 재생 성공');
        //     } else {
        //       console.error('오디오 재생 실패');
        //     }
        //     // 재생 끝나면 해제
        //     sound.release();
        //   });
        // });
      } else {
        console.warn('음성 파일이 존재하지 않습니다.');
      }
    } catch (error) {
      console.error('음성 파일 요청 중 오류 발생:', error);
      Alert.alert('오류', '음성 파일을 가져오는 데 실패했습니다.');
    }
  };

  const handleFavoritePress = async () => {
    try {
      console.log('보낼 medicine_id:', medicine.item_id);
      await updateInterestedMedicine(medicine.item_id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('관심 의약품 등록 실패:', error);
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
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <Tag sizeType="large" colorType="detailPrimary" maxWidth="85">
              {medicine.etc_otc_name || '정보 없음'}
            </Tag>
            <Tag sizeType="large" colorType="detailSecondary" maxWidth="185">
              {medicine.class_name || '정보 없음'}
            </Tag>
          </View>
          <TouchableOpacity onPress={() => handleAudioPress(medicine.item_id)}>
            <ChatIcons.mike
              width={24}
              height={24}
              style={{ color: themes.light.textColor.buttonText }}
            />
          </TouchableOpacity>
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
