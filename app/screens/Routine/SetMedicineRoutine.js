import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {View, ScrollView} from 'react-native';
import {themes} from './../../styles';
import {HeaderIcons, OtherIcons} from '../../../assets/icons';
import {ModalHeader, Button, MedicineOverview} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import { createRoutine } from '../../api/routine';

const SetMedicineRoutine = ({route, navigation}) => {
  const { item } = route.params;
  const [medicine, setMedicine] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimings, setSelectedTimings] = useState([]);
  const [dosage, setDosage] = useState('');
  const [totalCount, setTotalCount] = useState('');

  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const timings = ['아침', '점심', '저녁', '자기 전'];

  const convertDaysToNumbers = selectedDays.map(day => days.indexOf(day)+1);
  const convertTimingsToIds = selectedTimings.map(timing => timings.indexOf(timing) + 1);

  // 저장 버튼 클릭 시 실행할 함수
const handleSaveRoutine = async () => {
  // 필수 입력값 검증
  if (!medicineName || selectedDays.length === 0 || selectedTimings.length === 0 || !dosage || !totalCount) {
    // 여기에 적절한 오류 메시지 표시 로직 추가
    console.error('모든 필드를 채워주세요');
    return;
  }

  try {
    // API 요청에 맞게 데이터 형식 변환
    const routineData = {
      medicine_id: medicine.item_id,
      nickname: medicineName,
      dose: parseInt(dosage, 10),
      total_quantity: parseInt(totalCount, 10),
      day_of_weeks: convertDaysToNumbers,
      user_schedule_ids: convertTimingsToIds
    };

    console.log('전송 데이터:', routineData);
    
    // API 호출
    const response = await createRoutine(routineData);
    console.log('루틴 저장 성공:', response);
    
    // 성공 시 이전 화면으로 이동
    navigation.goBack();
    
    // 성공 메시지 표시 (필요시 추가)
  } catch (error) {
    console.error('루틴 저장 실패:', error);
    // 오류 처리 (사용자에게 오류 메시지 표시)
  }
};


useEffect(() => {
  if (item) {
    console.log('약 데이터:', item);
    // API 응답 데이터 필드를 기존 앱 구조에 맞게 매핑
    const mappedMedicine = {
      item_id: item.id,                // id를 item_id로 매핑
      item_name: item.item_name,       // 약 이름
      entp_name: item.entp_name,       // 제조사 이름
      class_name: item.class_name,     // 약 분류
      item_image: item.item_image,     // 약 이미지 URL
      etc_otc_name: item.etc_otc_name, // 일반/전문 구분
      dosage: item.dosage,             // 복용 지침
      indications: item.indications,   // 효능 효과
      precautions: item.precautions,   // 주의사항
    };
    
    setMedicine(mappedMedicine);
    // 약 이름으로 기본 별명 설정
    setMedicineName(item.item_name);
  } else {
    console.error('약 정보를 찾을 수 없습니다.');
  }
}, [item]);

  const handlePressEnlarge = () => {
    navigation.navigate('MedicineImageDetail', {item: medicine, isModal: true});
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
        <Button title="저장하기" onPress={handleSaveRoutine} />
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
          <HeaderIcons.chevron width={15} height={15} style={{color: themes.light.textColor.Primary20, transform: [{ rotate: '180deg' }]}}/>
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
