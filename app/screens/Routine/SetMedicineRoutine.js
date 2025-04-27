import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Alert, View, ScrollView, Platform } from 'react-native';
import { themes } from './../../styles';
import { HeaderIcons } from '../../../assets/icons';
import {
  ModalHeader,
  Button,
  DualTextButton,
  MedicineOverview,
  InputWithDelete,
} from '../../components';
import { ScheduleSelector } from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import { 
  createRoutine, 
  deleteRoutineGroup, 
  updateRoutine,
  getRoutineGroupByMedicineId,
} from '../../api/routine';
import { getMedicineById } from '../../api/medicine';

const SetMedicineRoutine = ({ route, navigation }) => {
  // 네비게이션 파라미터 확인 및 로깅
  console.log('🔍 route.params:', JSON.stringify(route.params));
  
  const { medicineId } = route.params;
  const [relatedRoutineIds, setRelatedRoutineIds] = useState([]);
  const [routineId, setRoutineId] = useState(null);
  const [routineGroupId, setRoutineGroupId] = useState(null);
  const [medicine, setMedicine] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimings, setSelectedTimings] = useState([]);
  const [dosage, setDosage] = useState('');
  const [totalCount, setTotalCount] = useState('');
  const [intervalDays, setIntervalDays] = useState('1');
  const [scheduleMapping, setScheduleMapping] = useState({});
  const [userScheduleIds, setUserScheduleIds] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const timings = ['아침', '점심', '저녁', '자기 전'];

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🔍 초기 데이터 로딩 시작');
      console.log('🔍 medicineId:', medicineId);
      
      setIsLoading(true);
      
      try {
        // 해당 약의 관련 루틴 ID 가져오기
        await fetchRelatedRoutineIds();
        
        // 약 정보 로딩
        await fetchMedicineData();
      } catch (error) {
        console.error('❌ 초기 데이터 로딩 실패:', error);
        Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
        console.log('🟢 초기 데이터 로딩 완료');
      }
    };
    
    loadInitialData();
  }, []);

  // 관련 루틴 ID 가져오기
  const fetchRelatedRoutineIds = async () => {
    try {
      console.log('🔍 약 관련 루틴 그룹 데이터 가져오기 시작');
      const response = await getRoutineGroupByMedicineId(medicineId);
      
      console.log('🟢 약 관련 루틴 그룹 데이터 불러오기 성공');
      console.log('🔍 API 응답 구조:', JSON.stringify(response, null, 2));
      
      const routineData = response.data?.body || response.data || response;
      
      if (routineData) {
        // 루틴 그룹 ID 저장
        if (routineData.routine_group_id) {
          setRoutineGroupId(routineData.routine_group_id);
          console.log('🟢 루틴 그룹 ID 설정:', routineData.routine_group_id);
        }
        
        // 루틴 IDs 저장 
        if (routineData.routine_ids && Array.isArray(routineData.routine_ids) && routineData.routine_ids.length > 0) {
          setRelatedRoutineIds(routineData.routine_ids);
          console.log('🟢 관련 루틴 IDs:', routineData.routine_ids);
          
          // 마지막 루틴 ID를 선택 (수정을 위해)
          const lastRoutineId = routineData.routine_ids[routineData.routine_ids.length - 1];
          setRoutineId(lastRoutineId);
          console.log('🟢 선택된 루틴 ID 설정 (마지막 ID):', lastRoutineId);
          setIsEditing(true);
        }
        
        // 별명 설정
        if (routineData.nickname) {
          console.log('🟢 별명 설정:', routineData.nickname);
          setMedicineName(routineData.nickname);
        }
        
        // 복용량 설정
        if (routineData.dose !== undefined && routineData.dose !== null) {
          console.log('🟢 복용량 설정:', routineData.dose);
          setDosage(String(routineData.dose));
        }
        
        // 총 개수 설정 (API 필드명 확인: total_quantity 또는 remaining_quantity)
        if (routineData.total_quantity !== undefined && routineData.total_quantity !== null) {
          console.log('🟢 총 개수 설정:', routineData.total_quantity);
          setTotalCount(String(routineData.total_quantity));
        } else if (routineData.remaining_quantity !== undefined && routineData.remaining_quantity !== null) {
          console.log('🟢 남은 개수 설정:', routineData.remaining_quantity);
          setTotalCount(String(routineData.remaining_quantity));
        }
        
        // 날짜 간격 설정
        if (routineData.interval_days !== undefined && routineData.interval_days !== null) {
          console.log('🟢 interval_days 설정:', routineData.interval_days);
          setIntervalDays(String(routineData.interval_days));
          
          // interval_days에 따라 기본 복용 주기 설정
          if (routineData.interval_days === 1) {
            // 매일로 설정
            console.log('🟢 복용 주기 "매일"로 설정');
            setSelectedOption('매일');
            setSelectedDays(days);
          } else {
            // 1일 이상 간격은 주기 설정으로 처리
            console.log('🟢 복용 주기 "주기 설정"으로 설정, 간격:', routineData.interval_days);
            setSelectedOption('주기 설정');
            // 주기 설정에 맞는 기본 요일 설정
            const defaultDays = ['월', '수', '금', '일']; 
            setSelectedDays(defaultDays);
          }
        }
        
        // 스케줄 정보 설정
        if (routineData.schedule_responses && Array.isArray(routineData.schedule_responses)) {
          console.log('🔍 스케줄 정보:', routineData.schedule_responses);
          
          // API 응답 구조에서 선택 여부를 확인할 필드명 결정
          // selected, is_selected, 또는 다른 이름일 수 있음
          let selectionField = null;
          
          // 첫 번째 스케줄 항목에서 선택 여부 필드 확인
          if (routineData.schedule_responses.length > 0) {
            const firstSchedule = routineData.schedule_responses[0];
            if ('selected' in firstSchedule) selectionField = 'selected';
            else if ('is_selected' in firstSchedule) selectionField = 'is_selected';
            
            console.log('🔍 선택 여부 필드명 결정:', selectionField || '필드를 찾을 수 없음');
          }
          
          // 선택된 스케줄 IDs 추출
          const selectedIds = routineData.schedule_responses
            .filter(schedule => {
              // 선택 필드가 있으면 그 값 사용, 없으면 모든 항목을 선택된 것으로 간주
              if (!selectionField) return true;
              return schedule[selectionField] === true;
            })
            .map(schedule => schedule.user_schedule_id);
          
          console.log('🟢 선택된 스케줄 IDs:', selectedIds);
          setUserScheduleIds(selectedIds);
          
          // 스케줄 매핑 설정 (이모지 키와 ID 매핑)
          const mapping = {};
          const selectedScheduleNames = [];
          
          routineData.schedule_responses.forEach(schedule => {
            // 이모지 키로 매핑 (시간대 이름 추출)
            let timingName = '';
            
            if (schedule.name) {
              if (schedule.name.includes('아침')) {
                timingName = '아침';
                mapping['🐥️ 아침'] = schedule.user_schedule_id;
              } else if (schedule.name.includes('점심')) {
                timingName = '점심';
                mapping['🥪️ 점심'] = schedule.user_schedule_id;
              } else if (schedule.name.includes('저녁')) {
                timingName = '저녁';
                mapping['🌙️ 저녁'] = schedule.user_schedule_id;
              } else if (schedule.name.includes('자기')) {
                timingName = '자기 전';
                mapping['🛏️️ 자기 전'] = schedule.user_schedule_id;
              }
            }
            
            console.log(`🔍 스케줄 항목 처리: ID=${schedule.user_schedule_id}, 이름=${schedule.name}, 추출된 시간대=${timingName}`);
            
            // 선택 여부 확인
            const isSelected = selectionField ? 
              schedule[selectionField] === true : 
              true;
            
            // 선택된 스케줄인 경우 배열에 추가
            if (isSelected && timingName) {
              console.log(`🟢 선택된 시간대로 추가: ${timingName}`);
              selectedScheduleNames.push(timingName);
            }
          });
          
          console.log('🟢 스케줄 매핑 설정:', mapping);
          setScheduleMapping(mapping);
          
          console.log('🟢 선택된 시간대 이름:', selectedScheduleNames);
          
          // 중요: 여기서 setSelectedTimings 직접 호출
          if (selectedScheduleNames.length > 0) {
            console.log('🟢 선택된 시간대 상태 설정:', selectedScheduleNames);
            setSelectedTimings(selectedScheduleNames);
          }
        }
      }
    } catch (error) {
      console.error('❌ 관련 루틴 그룹 데이터 가져오기 실패:', error);
      console.error('❌ 에러 상세 정보:', error.response ? error.response.data : error.message);
    }
  };

  // medicineId로 약 정보 가져오기
  const fetchMedicineData = async () => {
    try {
      console.log('🔍 약 정보 요청 중, medicineId:', medicineId);
      const response = await getMedicineById(medicineId);
      
      // API 응답 구조에 따라 적절히 데이터 추출
      const medicineData = response.data?.body || response.data || response;

      if (medicineData) {
        console.log('🟢 약 데이터 로드 성공');
        setMedicine(medicineData);
        
        // 약 이름으로 기본 별명 설정 (수정 모드가 아니고 별명이 아직 설정되지 않았을 때만)
        if (!isEditing && !medicineName) {
          console.log('🟢 기본 약 이름으로 별명 설정:', medicineData.item_name || medicineData.medicine_name);
          setMedicineName(medicineData.item_name || medicineData.medicine_name || '');
        }
      } else {
        console.error('❌ 약 정보를 찾을 수 없습니다.');
        Alert.alert('오류', '약 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('❌ 약 정보 가져오기 실패:', error);
      Alert.alert('오류', '약 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 옵션 선택 핸들러
  const handleSelect = (option) => {
    console.log('🔍 옵션 선택:', option);
    setSelectedOption((prev) => (prev === option ? null : option));

    // 선택된 옵션에 따라 day_of_weeks 설정
    if (option === '매일') {
      // 매일: 월화수목금토일
      console.log('🟢 "매일" 옵션 - 모든 요일 선택');
      setSelectedDays(days);
      setIntervalDays('1');
    } else if (option === '특정 요일') {
      // 특정 요일 선택 모드일 때는 기존 선택된 요일 유지
      if (selectedOption !== '특정 요일') {
        console.log('🟢 "특정 요일" 옵션 - 요일 초기화');
        setSelectedDays([]);
      }
      setIntervalDays('1');
    } else if (option === '주기 설정') {
      // 2일 간격: 월수금일 예시
      console.log('🟢 "주기 설정" 옵션 - 기본 요일 설정');
      setSelectedDays(['월', '수', '금', '일']);
      setIntervalDays('2');
    } else {
      setSelectedDays([]);
      setIntervalDays('1');
    }
  };

  // 요일 토글 핸들러
  const toggleDay = day => {
    console.log('🔍 요일 토글:', day);
    setSelectedDays(prev => {
      const newDays = prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day];
      console.log('🟢 선택된 요일 업데이트:', newDays);  
      return newDays;
    });
  };

  // 요일을 숫자로 변환 (API 요청용)
  const convertDaysToNumbers = () => {
    const dayNumbers = selectedDays.map(day => days.indexOf(day) + 1);
    console.log('🔍 선택 요일 -> 숫자 변환:', dayNumbers);
    return dayNumbers;
  };

  // 시간대를 ID로 변환 (API 요청용)
  const convertTimingsToIds = () => {
    // 시간대 이름을 이모지 키로 변환
    const timingToEmojiMap = {
      '아침': '🐥️ 아침',
      '점심': '🥪️ 점심',
      '저녁': '🌙️ 저녁',
      '자기 전': '🛏️️ 자기 전'
    };
    
    const ids = selectedTimings
      .map(timing => {
        const emojiKey = timingToEmojiMap[timing];
        const id = scheduleMapping[emojiKey];
        console.log(`🔍 시간대 변환: ${timing} -> ${emojiKey} -> ID ${id}`);
        return id;
      })
      .filter(id => id !== undefined && id !== null);
    
    console.log('🔍 변환된 스케줄 IDs:', ids);
    return ids;
  };

  // 루틴 수정/등록 핸들러
  const handleModifyRoutine = async () => {
    console.log('🔍 루틴 저장/수정 요청');
    console.log('🔍 현재 상태:', {
      medicineName,
      selectedDays,
      selectedTimings,
      dosage,
      totalCount,
      intervalDays,
      isEditing,
      routineId
    });
    
    // 필수 입력값 검증
    if (!medicineName || selectedDays.length === 0 || selectedTimings.length === 0 || !dosage || !totalCount) {
      console.error('❌ 필수 입력값 누락');
      Alert.alert('입력 오류', '모든 필드를 채워주세요.');
      return;
    }

    try {
      // API 요청에 맞게 데이터 형식 변환
      const dayNumbers = convertDaysToNumbers();
      const scheduleIds = convertTimingsToIds();
      
      // 루틴 데이터 준비 (API 명세에 맞게 필드 이름 설정)
      const routineData = {
        medicine_id: medicineId,
        nickname: medicineName,
        dose: parseInt(dosage, 10),
        total_quantity: parseInt(totalCount, 10),
        interval_days: parseInt(intervalDays, 10),
        user_schedule_ids: scheduleIds
      };

      // 신규 생성 시 day_of_weeks 추가 (수정 시에는 불필요)
      if (!isEditing) {
        routineData.day_of_weeks = dayNumbers;
      } else if (routineId) {
        // 수정 시 routineId 추가
        routineData.routine_id = routineId;
      }

      console.log('🔍 API 요청 데이터:', routineData);

      // 기존 루틴이 있으면 업데이트, 없으면 신규 생성
      let response;
      if (isEditing && routineId) {
        response = await updateRoutine(routineData);
        console.log('🟢 루틴 업데이트 성공:', response);
        Alert.alert('성공', '루틴이 성공적으로 수정되었습니다.');
      } else {
        response = await createRoutine(routineData);
        console.log('🟢 루틴 저장 성공:', response);
        Alert.alert('성공', '루틴이 성공적으로 등록되었습니다.');
      }

      // 성공 시 이전 화면으로 이동
      navigation.goBack();
    } catch (error) {
      console.error('❌ 루틴 저장 실패:', error);
      console.error('❌ 에러 상세 정보:', error.response ? error.response.data : error.message);
      Alert.alert('오류', '루틴 저장 중 오류가 발생했습니다.');
    }
  };

  // 루틴 삭제 핸들러
  const handleDeleteRoutineGroup = async () => {
    // 삭제할 루틴 ID 결정 (routineId 또는 relatedRoutineIds 중 첫 번째)
    const idToDelete = routineId || (relatedRoutineIds.length > 0 ? relatedRoutineIds[0] : null);
    
    if (!idToDelete) {
      console.log('❌ 삭제할 루틴이 없습니다.');
      Alert.alert('안내', '삭제할 루틴이 없습니다.');
      return;
    }

    Alert.alert(
      '루틴 삭제',
      '정말로 이 루틴을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔍 루틴 삭제 요청, ID:', idToDelete);
              await deleteRoutineGroup(idToDelete);
              console.log('🟢 루틴 삭제 완료');
              Alert.alert('삭제 완료', '선택한 약의 전체 루틴이 삭제되었습니다.');
              navigation.goBack();
            } catch (error) {
              console.error('❌ 루틴 삭제 실패:', error);
              console.error('❌ 에러 상세 정보:', error.response ? error.response.data : error.message);
              Alert.alert('삭제 실패', '루틴 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // 이미지 확대 핸들러
  const handlePressEnlarge = () => {
    navigation.navigate('MedicineImageDetail', { item: medicine, isModal: true });
  };

  // 시간 설정 핸들러
  const handleSetTimings = () => {
    navigation.navigate('SetRoutineTime');
  };

  // 매핑 정보 변경 핸들러
  const handleScheduleMappingChange = (mapping) => {
    console.log('🔍 스케줄 매핑 변경됨:', mapping);
    setScheduleMapping(mapping);
  };

  // 로딩 중 표시
  if (isLoading || !medicine) {
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
        {isEditing ? '루틴 수정' : '루틴 등록'}
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
              <DualTextButton
                title={'매일'}
                onPress={() => handleSelect('매일')}
                bgColor={selectedOption === '매일' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedOption === '매일' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
              />
              <DualTextButton
                title={'특정 요일마다 (예: 월, 수, 금)'}
                onPress={() => handleSelect('특정 요일')}
                bgColor={selectedOption === '특정 요일' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedOption === '특정 요일' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
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

              <DualTextButton
                title={'주기 설정 (예: 2일 간격으로)'}
                onPress={() => handleSelect('주기 설정')}
                bgColor={selectedOption === '주기 설정' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedOption === '주기 설정' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
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
                onScheduleMappingChange={handleScheduleMappingChange}
                initialData={selectedTimings}
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

          {/* 루틴 삭제 버튼 (수정 모드일 때만 표시) */}
          {isEditing && (
            <Button
              title="루틴 삭제하기"
              onPress={handleDeleteRoutineGroup}
              bgColor={themes.light.pointColor.Secondary}
            />
          )}
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
        <Button 
          title={isEditing ? "수정하기" : "등록하기"} 
          onPress={handleModifyRoutine} 
        />
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