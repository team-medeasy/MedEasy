import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {View, ScrollView} from 'react-native';
import {themes} from './../../styles';
import {HeaderIcons, OtherIcons} from '../../../assets/icons';
import {
  ModalHeader, 
  Button, 
  SelectTimeButton,
  MedicineOverview
} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import { createRoutine } from '../../api/routine';
import { getUserSchedule } from '../../api/user';
import { getMedicineById } from '../../api/medicine';

const SetMedicineRoutine = ({route, navigation}) => {
  const { medicineId } = route.params;
  const [medicine, setMedicine] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimings, setSelectedTimings] = useState([]);
  const [dosage, setDosage] = useState('');
  const [totalCount, setTotalCount] = useState('');
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleMapping, setScheduleMapping] = useState({});

  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const timings = ['아침', '점심', '저녁', '자기 전'];

  // medicineId로 약 정보 가져오기
  useEffect(() => {
    const fetchMedicineData = async () => {
      try {
        console.log('요청하는 medicineId:', medicineId);
        const response = await getMedicineById(medicineId);
        console.log('API 응답:', response);
        
        // API 응답 구조에 따라 적절히 데이터 추출
        const medicineData = response.data?.body || response.data || response;
        
        if (medicineData) {
          console.log('약 데이터:', medicineData);
          setMedicine(medicineData);
          // 약 이름으로 기본 별명 설정
          setMedicineName(medicineData.item_name || medicineData.name || '');
        } else {
          console.error('약 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('약 정보 가져오기 실패:', error);
      }
    };

    if (medicineId) {
      fetchMedicineData();
    }
  }, [medicineId]);


  const handleSelect = (option) => {
    setSelectedOption((prev) => (prev === option ? null : option));
    
    // 선택된 옵션에 따라 day_of_weeks 설정
    if (option === '매일') {
      // 매일: 월화수목금토일
      setSelectedDays(days);
    } else if (option === '특정 요일') {
    } else if (option === '주기 설정') {
      // 2일 간격: 월수금일 예시
      setSelectedDays(['월', '수', '금', '일']);
    } else {
      setSelectedDays([]);
    }
  };

  const convertDaysToNumbers = selectedDays.map(day => days.indexOf(day)+1);
  const convertTimingsToIds = selectedTimings.map(timing => scheduleMapping[timing] || (timings.indexOf(timing) + 1));

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
  // 컴포넌트 마운트 시 사용자 일정 가져오기
  useEffect(() => {
    const fetchUserSchedule = async () => {
      try {
        const getData = await getUserSchedule();
        const scheduleData = getData.data;
        console.log('사용자 일정 데이터:', scheduleData);

        if (scheduleData && scheduleData.body && Array.isArray(scheduleData.body)) {
          const mapping = {};
          const formattedSchedule = {};

          scheduleData.body.forEach((item) => {
            if (item.name.includes('아침')) {
              mapping['아침'] = item.user_schedule_id;
              formattedSchedule['아침 식사 후'] = formatTime(item.take_time);
            } else if (item.name.includes('점심')) {
              mapping['점심'] = item.user_schedule_id;
              formattedSchedule['점심 식사 후'] = formatTime(item.take_time);
            } else if (item.name.includes('저녁')) {
              mapping['저녁'] = item.user_schedule_id;
              formattedSchedule['저녁 식사 후'] = formatTime(item.take_time);
            } else if (item.name.includes('자기 전')) {
              mapping['자기 전'] = item.user_schedule_id;
              formattedSchedule['자기 전'] = formatTime(item.take_time);
            }
          });

          setScheduleMapping(mapping);
          setScheduleData(formattedSchedule);
          console.log('시간대 매핑:', mapping);
        }
      } catch (error) {
        console.error('사용자 일정 가져오기 실패:', error);
      }
    };

    fetchUserSchedule();
  }, []);

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

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour < 12 ? '오전' : '오후';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

    return minute === 0
      ? `${period} ${formattedHour}시`
      : `${period} ${formattedHour}시 ${minute}분`;
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
      <ModalHeader 
        showDelete="true"
        DeleteColor={themes.light.pointColor.Secondary}
        onDeletePress={() => {}}
      >
        루틴 수정
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

          {/* 주기 선택 */}
          <Section>
            <SectionHeader title="복용 주기" />
            <SelectDay>
              <Button 
                title={'매일'} 
                onPress={() => handleSelect('매일')} 
                fontFamily={'Pretendard-SemiBold'}
                bgColor={selectedOption === '매일' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedOption === '매일' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                fontSize={FontSizes.body.default} 
              />
              <Button 
                title={'특정 요일마다 (예: 월, 수, 금)'} 
                onPress={() => handleSelect('특정 요일')} 
                fontFamily={'Pretendard-SemiBold'}
                bgColor={selectedOption === '특정 요일' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedOption === '특정 요일' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                fontSize={FontSizes.body.default} 
              />
              
              {/* 특정 요일 선택 시 요일 선택 버튼 표시 */}
              {selectedOption === '특정 요일' && (
                <DaySelection>
                  {days.map((day) => (
                    <DayButton 
                      key={day} 
                      selected={selectedDays.includes(day)} 
                      onPress={() => toggleDay(day)}
                    >
                      <DayText selected={selectedDays.includes(day)}>{day}</DayText>
                    </DayButton>
                  ))}
                </DaySelection>
              )}
              
              <Button 
                title={'주기 설정 (예: 2일 간격으로)'} 
                onPress={() => handleSelect('주기 설정')} 
                fontFamily={'Pretendard-SemiBold'}
                bgColor={selectedOption === '주기 설정' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedOption === '주기 설정' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                fontSize={FontSizes.body.default} 
              />
            </SelectDay>
          </Section>

          {/* 시간대 선택 */}
          <Section>
            <SectionHeader
              title="복용 시간대"
              buttonText="시간대 설정하기"
              onButtonPress={handleSetTimings}
            />
            <SelectTime>
              <SelectTimeButton
                title={'🐥️ 아침'}
                timeText={scheduleData['아침 식사 후'] || '오전 7시'}
                onPress={() => toggleTiming('아침')}
                bgColor={selectedTimings.includes('아침') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedTimings.includes('아침') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
              />
              <SelectTimeButton
                title={'🥪️ 점심'}
                timeText={scheduleData['점심 식사 후'] || '오후 12시'}
                onPress={() => toggleTiming('점심')}
                bgColor={selectedTimings.includes('점심') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedTimings.includes('점심') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
              />
              <SelectTimeButton
                title={'🌙️ 저녁'}
                timeText={scheduleData['저녁 식사 후'] || '오후 7시'}
                onPress={() => toggleTiming('저녁')}
                bgColor={selectedTimings.includes('저녁') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedTimings.includes('저녁') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
              />
              <SelectTimeButton
                title={'🛏️️ 자기 전'}
                timeText={'오후 10시 30분'}
                onPress={() => toggleTiming('자기 전')}
                bgColor={selectedTimings.includes('자기 전') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedTimings.includes('자기 전') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
              />
            </SelectTime>
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
          <Section style={{
            marginBottom: 34
          }}>
            <SectionHeader title="총 개수" />
            <InputWithDelete
              placeholder="총 개수를 입력하세요"
              value={totalCount}
              onChangeText={setTotalCount}
              keyboardType="numeric"
            />
          </Section>

          <Button
            title="루틴 삭제하기"
            onPress={() => {}}
            bgColor={themes.light.pointColor.Secondary}
          />

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

const SelectDay = styled.View`
  gap: 10px;
`;

const DaySelection = styled.View`
  flex-direction: row;
  gap: 10px;
  justify-content: center;
`;

const DayButton = styled.TouchableOpacity`
  background-color: ${(props) => (props.selected ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary)};
  padding: 8px 10px;
  border-radius: 5px;
`;

const DayText = styled.Text`
  color: ${(props) => (props.selected ? themes.light.textColor.buttonText : themes.light.textColor.Primary30)};
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-SemiBold';
`;

const SelectTime = styled.View`
  gap: 10px;
`;

export default SetMedicineRoutine;