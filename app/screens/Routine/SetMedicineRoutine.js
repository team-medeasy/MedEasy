import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {View, ScrollView} from 'react-native';
import {themes} from './../../styles';
import {HeaderIcons, OtherIcons} from '../../../assets/icons';
import {ModalHeader, Button, MedicineOverview} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
const {deleteCircle: DeleteCircleIcon} = OtherIcons;
const {chevron: ChevronIcon} = HeaderIcons;

import { dummyMedicineData } from '../../../assets/data/data';

const SetMedicineRoutine = ({route, navigation}) => {
  console.log('SetMedicineRoutine에서 받은 route.params:', route.params);
  const { itemSeq, medicineData } = route.params;
  const [medicine, setMedicine] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimings, setSelectedTimings] = useState([]);
  const [dosage, setDosage] = useState('');
  const [totalCount, setTotalCount] = useState('');

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const timings = ['아침', '점심', '저녁', '자기 전'];

  useEffect(() => {
    if (medicineData) {
      // API 응답 데이터 필드를 기존 앱 구조에 맞게 매핑
      const mappedMedicine = {
        item_seq: medicineData.item_seq,
        item_name: medicineData.item_name,
        entp_name: medicineData.entp_name,
        class_name: medicineData.class_name,
        item_image: medicineData.item_image,
        // 외관 정보
        shape: medicineData.drug_shape,
        color: medicineData.color_classes,
        // 원본 데이터 전체도 보존
        originalData: medicineData
      };
      
      setMedicine(mappedMedicine);
      // 약 이름으로 기본 별명 설정
      setMedicineName(medicineData.item_name);
    } else {
      // medicineData가 없는 경우 기존 방식으로 검색
      const foundMedicine = dummyMedicineData.find(
        item => item.item_seq === itemSeq
      );
      if (foundMedicine) {
        setMedicine(foundMedicine);
      }
    }
  }, [medicineData, itemSeq]);

  // 컴포넌트 마운트 시 item_seq에 해당하는 약품 데이터 찾기
  useEffect(() => {
    const foundMedicine = dummyMedicineData.find(
      item => item.item_seq === itemSeq
    );
    if (foundMedicine) {
      setMedicine(foundMedicine);
    }
  }, [itemSeq]);

  // 임시로 item_seq값 넘김 + Modal화면 띄우기 요청
  const handlePressEnlarge = itemSeq => {
    navigation.navigate('MedicineImageDetail', {itemSeq, isModal: true});
  };

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const toggleTiming = timing => {
    setSelectedTimings(prev =>
      prev.includes(timing)
        ? prev.filter(t => t !== timing)
        : [...prev, timing],
    );
  };

  const handleSetTimings = () => {
    navigation.navigate('SetRoutineTime');
  };

  if (!medicine) { // 렌더링 전 error 방지
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

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 150,
        }}>
        <MedicineOverview
          medicine={medicine}
          isFavorite={isFavorite}
          setIsFavorite={setIsFavorite}
          onPressEnlarge={handlePressEnlarge}
        />

        <View
          style={{
            marginTop: 28,
            paddingHorizontal: 20,
            flexDirection: 'column',
            gap: 30,
          }}>
          {/* 별명 */}
          <Section>
            <SectionHeader title="별명" />
            <InputWithDelete
              placeholder="약 별명을 입력하세요"
              value={medicineName}
              onChangeText={setMedicineName}
            />
          </Section>

          {/* 요일 선택 */}
          <Section>
            <SectionHeader title="복용 요일" />
            <View style={{flexDirection: 'row', gap: '10'}}>
              {days.map(day => (
                <ToggleButton
                  key={day}
                  selected={selectedDays.includes(day)}
                  onPress={() => toggleDay(day)}>
                  <ToggleButtonText selected={selectedDays.includes(day)}>
                    {day}
                  </ToggleButtonText>
                </ToggleButton>
              ))}
            </View>
          </Section>

          {/* 시간대 선택 */}
          <Section>
            <SectionHeader
              title="복용 시간대"
              buttonText="시간대 설정하기"
              onButtonPress={handleSetTimings}
            />
            <View style={{flexDirection: 'row', gap: '10'}}>
              {timings.map(timing => (
                <ToggleButton
                  key={timing}
                  selected={selectedTimings.includes(timing)}
                  onPress={() => toggleTiming(timing)}
                  paddingHorizontal={15}>
                  <ToggleButtonText selected={selectedTimings.includes(timing)}>
                    {timing}
                  </ToggleButtonText>
                </ToggleButton>
              ))}
            </View>
          </Section>

          {/* 1회 복용량 */}
          <Section>
            <SectionHeader title="1회 복용량" />
            <InputWithDelete
              placeholder="복용량을 입력하세요"
              value={dosage}
              onChangeText={setDosage}
              keyboardType="numeric"
            />
          </Section>

          {/* 총 개수 */}
          <Section>
            <SectionHeader title="총 개수" />
            <InputWithDelete
              placeholder="총 개수를 입력하세요"
              value={totalCount}
              onChangeText={setTotalCount}
              keyboardType="numeric"
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
        <Button title="저장하기" onPress={() => {}} />
      </View>
    </Container>
  );
};

// 섹션 헤더 컴포넌트
const SectionHeader = ({title, buttonText, onButtonPress}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <SectionTitle>{title}</SectionTitle>
      {buttonText && (
        <HeaderButton 
          onPress={onButtonPress} 
          style={{
            flexDirection: 'row', 
            alignItems: 'center',
            gap: 5,
          }}>
          <HeaderButtonText>{buttonText}</HeaderButtonText>
          <ChevronIcon width={15} height={15} style={{color: themes.light.textColor.Primary20, transform: [{ rotate: '180deg' }]}}/>
        </HeaderButton>
      )}
    </View>
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
      />
      {value.length > 0 && (
        <DeleteButton onPress={() => onChangeText('')}>
          <DeleteCircleIcon
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

const Section = styled.View`
  gap: 15px;
`;

const SectionTitle = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.heading.default};
  color: ${themes.light.textColor.textPrimary};
`;

const HeaderButton = styled.TouchableOpacity``;

const HeaderButtonText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.Primary30};
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

const ToggleButton = styled.TouchableOpacity`
  background-color: ${props =>
    props.selected
      ? themes.light.pointColor.Primary
      : themes.light.boxColor.inputPrimary};
  border-radius: 5px;
  padding: ${props => `${props.paddingVertical || 8}px 
                         ${props.paddingHorizontal || 10}px`};
`;

const ToggleButtonText = styled.Text`
  color: ${props =>
    props.selected
      ? themes.light.textColor.buttonText
      : themes.light.textColor.Primary50};
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.body.default};
  text-align: center;
`;

export default SetMedicineRoutine;
