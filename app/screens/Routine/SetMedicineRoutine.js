import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Alert, View, ScrollView } from 'react-native';
import { themes } from './../../styles';
import { HeaderIcons } from '../../../assets/icons';
import {
  ModalHeader,
  Button,
  MedicineOverview,
  InputWithDelete,
  ScheduleSelector,
} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import { createRoutine, deleteRoutineGroup, getRoutineByDate } from '../../api/routine';
import { getUserMedicinesCurrent, getUserMedicinesPast } from '../../api/user';
import { getMedicineById } from '../../api/medicine';

const SetMedicineRoutine = ({ route, navigation }) => {
  const { medicineId } = route.params;
  const [relatedRoutineIds, setRelatedRoutineIds] = useState([]);
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

  useEffect(() => {
    const fetchRoutineData = async () => {
      try {
        const startDate = '2025-03-01';
        const endDate = '2025-12-31';
        const response = await getRoutineByDate(startDate, endDate);

        console.log('루틴 데이터 불러오기 성공:', response.data);

        const data = response.data.body;

        const medicineIdMap = {};

        data.forEach(({ user_schedule_dtos }) => {
          user_schedule_dtos.forEach(({ routine_dtos }) => {
            routine_dtos.forEach(({ medicine_id, routine_id }) => {
              if (!medicineIdMap[medicine_id]) {
                medicineIdMap[medicine_id] = [];
              }
              medicineIdMap[medicine_id].push(routine_id);
            });
          });
        });

        console.log('routine_id 목록:', medicineIdMap);

        const relatedRoutineIds = medicineIdMap[medicineId] || [];
        setRelatedRoutineIds(relatedRoutineIds);

        console.log(`'${medicineId}'에 해당하는 routine_id 목록:`, relatedRoutineIds);

      } catch (error) {
        console.error('루틴 데이터 불러오기 실패:', error);
      }
    };

    fetchRoutineData();
  }, [medicineId]);

  const handleDeleteRoutineGroup = async () => {
    try {
      if (!relatedRoutineIds || relatedRoutineIds.length === 0) {
        console.log('삭제할 루틴이 없습니다.');
        Alert.alert('안내', '삭제할 루틴이 없습니다.');
        return;
      }
  
      const firstId = relatedRoutineIds[0]; // 첫 번째 ID만 사용
      console.log(firstId);
      await deleteRoutineGroup(firstId);
  
      console.log('✅ 루틴 삭제 완료:', firstId + '을 포함한 루틴 그룹');
      Alert.alert('삭제 완료', '선택한 약의 전체 루틴이 삭제되었습니다.');
      navigation.goBack();
    } catch (error) {
      console.error('❌ 루틴 삭제 실패:', error);
      Alert.alert('삭제 실패', '루틴 삭제 중 오류가 발생했습니다.');
    }
  };  

  useEffect(() => {
    if (medicineId) {
      fetchMedicineData();
    }
  }, [medicineId]);

  const fetchMedicineData = async () => {
    try {
      // 1. 현재 복용 중인 약 데이터 가져오기
      const currentResponse = await getUserMedicinesCurrent();
      const currentRoutines = currentResponse.data?.body || [];
      console.log('현재 복용 중인 약: ', currentRoutines);
      
      // 2. 이전에 복용한 약 데이터 가져오기
      const pastResponse = await getUserMedicinesPast();
      const pastRoutines = pastResponse.data?.body || [];
      console.log('과거 복용 약: ', pastRoutines);
      
      // 3. 현재 복용 중인 약에서 medicineId와 일치하는 정보 찾기
      const currentMatch = currentRoutines.find(item => String(item.medicine_id) === String(medicineId));
      if (currentMatch) {
        console.log('현재 복용 중인 약에서 일치하는 정보:', currentMatch);
        
        // dose 값 설정
        setDosage(String(currentMatch.dose));
        
        // 복용 주기(day_of_weeks) 설정
        if (currentMatch.day_of_weeks && Array.isArray(currentMatch.day_of_weeks)) {
          // day_of_weeks를 이용해 선택된 요일 설정 (숫자->요일 변환)
          const selectedDaysList = currentMatch.day_of_weeks.map(dayNum => days[dayNum - 1]);
          setSelectedDays(selectedDaysList);
          
          // 요일 패턴에 따라 적절한 옵션 선택
          if (selectedDaysList.length === 7) {
            setSelectedOption('매일');
          } else if (selectedDaysList.length === 4 && 
                   selectedDaysList.includes('월') && 
                   selectedDaysList.includes('수') && 
                   selectedDaysList.includes('금') && 
                   selectedDaysList.includes('일')) {
            setSelectedOption('주기 설정');
          } else {
            setSelectedOption('특정 요일');
          }
        }
      }
      
      // 4. 이전에 복용한 약에서 medicineId와 일치하는 정보 찾기
      const pastMatches = pastRoutines.filter(item => String(item.medicine_id) === String(medicineId));
      if (pastMatches.length > 0 && !currentMatch) {
        console.log('과거 복용 약에서 일치하는 정보:', pastMatches);
        // 현재 복용 정보가 없는 경우에만 과거 정보 사용
        const recentPastMatch = pastMatches[0]; // 가장 최근 정보
        
        setDosage(String(recentPastMatch.dose));
        
        // 복용 주기 설정
        if (recentPastMatch.day_of_weeks && Array.isArray(recentPastMatch.day_of_weeks)) {
          const selectedDaysList = recentPastMatch.day_of_weeks.map(dayNum => days[dayNum - 1]);
          setSelectedDays(selectedDaysList);
          
          if (selectedDaysList.length === 7) {
            setSelectedOption('매일');
          } else if (selectedDaysList.length === 4 && 
                   selectedDaysList.includes('월') && 
                   selectedDaysList.includes('수') && 
                   selectedDaysList.includes('금') && 
                   selectedDaysList.includes('일')) {
            setSelectedOption('주기 설정');
          } else {
            setSelectedOption('특정 요일');
          }
        }
      }
      
    } catch (error) {
      console.error('약 데이터 불러오기 실패:', error);
    }
  };

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

  const convertDaysToNumbers = selectedDays.map(day => days.indexOf(day) + 1);
  const convertTimingsToIds = selectedTimings.map(timing => {
    // 시간대 이름을 이모지 키로 변환
    const timingToEmojiMap = {
      '아침': '🐥️ 아침',
      '점심': '🥪️ 점심',
      '저녁': '🌙️ 저녁',
      '자기 전': '🛏️️ 자기 전'
    };
    
    const emojiKey = timingToEmojiMap[timing];
    return scheduleMapping[emojiKey] || (timings.indexOf(timing) + 1);
  });
  // 수정 버튼 클릭 시 실행할 함수
  const handleModifyRoutine = async () => {
    await handleDeleteRoutineGroup();

    // 필수 입력값 검증
    if (!medicineName || selectedDays.length === 0 || selectedTimings.length === 0 || !dosage || !totalCount) {
      // 여기에 적절한 오류 메시지 표시 로직 추가
      console.error('모든 필드를 채워주세요');
      return;
    }

    try {
      // API 요청에 맞게 데이터 형식 변환
      const routineData = {
        medicine_id: medicineId,
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

  const handlePressEnlarge = () => {
    navigation.navigate('MedicineImageDetail', { item: medicine, isModal: true });
  };

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
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
      <ModalHeader
        showDelete="true"
        DeleteColor={themes.light.pointColor.Secondary}
        onDeletePress={() => handleModifyRoutine()}
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
            <ScheduleSelector
              selectedTimings={selectedTimings}
              setSelectedTimings={setSelectedTimings}
              onScheduleMappingChange={setScheduleMapping}
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
            onPress={handleDeleteRoutineGroup}
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
        <Button title="수정하기" onPress={handleModifyRoutine} />
      </View>
    </Container>
  );
};

// 섹션 헤더 컴포넌트
const SectionHeader = ({ title, buttonText, onButtonPress }) => {
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
          <HeaderIcons.chevron width={15} height={15} style={{ color: themes.light.textColor.Primary20, transform: [{ rotate: '180deg' }] }} />
        </HeaderButton>
      )}
    </View>
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