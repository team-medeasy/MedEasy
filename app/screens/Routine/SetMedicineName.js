import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {View, ScrollView} from 'react-native';
import {ProgressBar} from '../../components';
import {themes} from './../../styles';
import {OtherIcons} from '../../../assets/icons';
import {ModalHeader, Button} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';

const SetMedicineName = ({route, navigation}) => {
  const {item} = route.params;
  const [medicine, setMedicine] = useState(null);
  const [medicineName, setMedicineName] = useState('');

  const progress = '20%';

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
        item_id: item.id, // id를 item_id로 매핑
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
            <LargeText>약 이름을 바꿀 수 있어요</LargeText>
            <SmallText>메디지가 기억하기 쉬운 이름으로 불러드릴게요!</SmallText>
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

// 입력 필드 컴포넌트
const InputWithDelete = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}) => {
  return (
    <InputContainer>
      <StyledInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        returnKeyType="done"
      />
      {value.length > 0 && (
        <DeleteButton onPress={() => onChangeText('')}>
          <OtherIcons.deleteCircle
            width={15}
            height={15}
            style={{color: themes.light.textColor.Primary20}}
          />
        </DeleteButton>
      )}
    </InputContainer>
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
  font-size: ${FontSizes.title.default};
  font-family: ${'KimjungchulGothic-Bold'};
  color: ${themes.light.textColor.textPrimary};
`;
const SmallText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: ${'Pretendard-Midium'};
  color: ${themes.light.textColor.Primary50};
`;

const Section = styled.View`
  padding: 0 20px;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${themes.light.boxColor.inputPrimary};
  border-radius: 10px;
  padding: 0 15px;
`;

const StyledInput = styled.TextInput`
  flex: 1;
  padding: 18px 0;
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.textPrimary};
`;

const DeleteButton = styled.TouchableOpacity`
  padding: 5px;
`;

export default SetMedicineName;
