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
import { getMedicineAudioUrl } from '../../api/medicine';

import Sound from 'react-native-sound';

// Sound 초기화
Sound.setCategory('Playback');

const { heartOff: HeartOffIcon, heartOn: HeartOnIcon } = RoutineIcons;

const MedicineOverview = ({
  medicine,
  onPressEnlarge,
}) => {
  const {fontSizeMode} = useFontSize();
  const hasImage = !!medicine.item_image;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
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

  const handleAudioPress = async (medicineId) => {
    // 이미 재생 중이면 중지
    if (isPlaying && currentSound) {
      currentSound.stop();
      currentSound.release();
      setCurrentSound(null);
      setIsPlaying(false);
      return;
    }

    try {
      console.log('음성 파일 요청 시작:', medicineId);
      const response = await getMedicineAudioUrl(medicineId);
      const audioUrl = response.data.body;

      if (audioUrl) {
        console.log('받아온 음성 URL:', audioUrl);
        
        // URL이 유효한지 확인
        fetch(audioUrl, { method: 'HEAD' })
          .then(res => {
            console.log('URL 상태:', res.status);
            if (res.status !== 200) {
              Alert.alert('오류', `URL 접근 오류: ${res.status}`);
            }
          })
          .catch(err => console.error('URL 확인 오류:', err));
        
        const sound = new Sound(audioUrl, '', (error) => {
          if (error) {
            console.error('오디오 로딩 실패:', error);
            Alert.alert('오류', '오디오 파일을 로드하는 데 실패했습니다.');
            setIsPlaying(false);
            return;
          }

          console.log('오디오 로딩 성공, 길이(초):', sound.getDuration());
          
          // 볼륨 설정
          sound.setVolume(1.0);
          
          // 재생 시작
          setIsPlaying(true);
          setCurrentSound(sound);
          
          sound.play((success) => {
            if (success) {
              console.log('오디오 재생 성공');
            } else {
              console.error('오디오 재생 실패');
              Alert.alert('오류', '오디오 재생에 실패했습니다.');
            }
            // 재생 끝나면 상태 업데이트
            setIsPlaying(false);
            setCurrentSound(null);
            // 재생 끝나면 해제
            sound.release();
          });
        });
      } else {
        console.warn('음성 파일이 존재하지 않습니다.');
        Alert.alert('안내', '이 약에 대한 음성 정보가 없습니다.');
      }
    } catch (error) {
      console.error('음성 파일 요청 중 오류 발생:', error);
      Alert.alert('오류', '음성 파일을 가져오는 데 실패했습니다.');
    }
  };

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.stop();
        currentSound.release();
      }
    };
  }, [currentSound]);

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
            <TouchableOpacity onPress={() => handleAudioPress(medicine.item_id)}>
              <ChatIcons.mike
                width={24}
                height={24}
                style={{ 
                  color: isPlaying 
                    ? themes.light.textColor.buttonText  // 재생 중일 때 색상
                    : themes.light.textColor.buttonText60 // 재생 중 아닐 때 색상
                }}
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
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.buttonText70};
`;

const MedicineInfoName = styled.Text`
  flex: 1;
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]}px;
  color: ${themes.light.textColor.buttonText};
`;

export { MedicineOverview };