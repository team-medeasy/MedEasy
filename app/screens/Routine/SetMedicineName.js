import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {View, ScrollView} from 'react-native';
import {ProgressBar, InputWithDelete} from '../../components';
import {themes} from './../../styles';
import {ModalHeader, Button} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const SetMedicineName = ({route, navigation}) => {
  const {item} = route.params;
  const {fontSizeMode} = useFontSize();
  const [medicine, setMedicine] = useState(null);
  const [medicineName, setMedicineName] = useState('');

  const progress = '16.66%';

  const handleNext = () => {
    if (!medicine || !medicine.item_id) {
      console.error('약 정보가 없습니다.');
      return;
    }

    navigation.navigate('SetMedicineDay', {
      medicine_id: medicine.item_id, // 약 ID
      nickname: medicineName, // 사용자 입력 별명
    });
  };

  useEffect(() => {
    if (item) {
      console.log('약 데이터:', item);
      // API 응답 데이터 필드를 기존 앱 구조에 맞게 매핑
      const mappedMedicine = {
        item_id: item.item_id, // id
        item_name: item.item_name, // 약 이름
        entp_name: item.entp_name, // 제조사 이름
        class_name: item.class_name, // 약 분류
        item_image: item.item_image, // 약 이미지 URL
        etc_otc_name: item.etc_otc_name, // 일반/전문 구분
        dosage: item.dosage, // 복용 지침
        indications: item.indications, // 효능 효과
        precautions: item.precautions, // 주의사항
      };

      setMedicine(mappedMedicine);
      // 약 이름으로 기본 별명 설정
      setMedicineName(item.item_name);
    } else {
      console.error('약 정보를 찾을 수 없습니다.');
    }
  }, [item]);

  if (!medicine) {
    // 렌더링 전 error 방지
    return (
      <Container>
        <ModalHeader>약 정보를 불러오는 중...</ModalHeader>
      </Container>
    );
  }
  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ModalHeader showDelete="true" onDeletePress={() => {}}>
        루틴 추가
      </ModalHeader>
      <ProgressBar progress={progress} />
      <ScrollView>
        <View>
          <TextContainer>
            <LargeText fontSizeMode={fontSizeMode}>
              약 이름을 바꿀 수 있어요
            </LargeText>
            <SmallText fontSizeMode={fontSizeMode}>
              메디지가 기억하기 쉬운 이름으로 불러드릴게요!
            </SmallText>
          </TextContainer>
          {/* 별명 */}
          <Section>
            <InputWithDelete
              placeholder="약 별명을 입력하세요"
              value={medicineName}
              onChangeText={setMedicineName}
            />
          </Section>
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 30,
          alignItems: 'center',
        }}>
        <Button title="다음" onPress={handleNext} />
      </View>
    </Container>
  );
};

const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const TextContainer = styled.View`
  padding: 35px 30px;
  gap: 10px;
`;

const LargeText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  font-family: ${'KimjungchulGothic-Bold'};
  color: ${themes.light.textColor.textPrimary};
`;
const SmallText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: ${'Pretendard-Midium'};
  color: ${themes.light.textColor.Primary50};
`;

const Section = styled.View`
  padding: 0 20px;
`;

export default SetMedicineName;
