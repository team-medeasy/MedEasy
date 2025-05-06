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
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
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

  const {fontSizeMode} = useFontSize();
  
  const { 
    medicineId, 
    medicineName: initialMedicineName,
    dose: initialDose,
    total_quantity: initialTotalQuantity,
    day_of_weeks: initialDayOfWeeks,
    user_schedules: initialUserSchedules,
    fromPrescription = false,
    onRoutineUpdate
  } = route.params;

  const [relatedRoutineIds, setRelatedRoutineIds] = useState([]);
  const [routineId, setRoutineId] = useState(null);
  const [routineGroupId, setRoutineGroupId] = useState(null);
  const [medicine, setMedicine] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [medicineName, setMedicineName] = useState(initialMedicineName || '');
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedTimings, setSelectedTimings] = useState([]);
  const [dosage, setDosage] = useState(initialDose ? String(initialDose) : '');
  const [totalCount, setTotalCount] = useState(initialTotalQuantity ? String(initialTotalQuantity) : '');
  const [intervalDays, setIntervalDays] = useState('1');
  const [scheduleMapping, setScheduleMapping] = useState({});
  const [userScheduleIds, setUserScheduleIds] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 처방전에서 왔는지 확인하여 모드 설정
  const [isPrescriptionMode] = useState(fromPrescription);

  const timings = ['아침', '점심', '저녁', '자기 전'];

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🔍 초기 데이터 로딩 시작');
      console.log('🔍 medicineId:', medicineId);
      
      setIsLoading(true);
      
      try {
        // 처방전에서 온 경우와 일반 루틴 수정 모드 분기처리
        if (isPrescriptionMode) {
          // 처방전 데이터 사용
          await handlePrescriptionData();
        } else {
          // 일반 루틴 모드: 기존 데이터 불러오기
          await fetchRelatedRoutineIds();
        }
        
        // 약 정보 로딩 (공통)
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

  // 처방전 데이터 처리
  const handlePrescriptionData = async () => {
    console.log('🔍 처방전 데이터 처리 시작');
    
    try {
      // 초기 스케줄 데이터 사용
      if (initialUserSchedules && Array.isArray(initialUserSchedules)) {
        console.log('🟢 초기 스케줄 데이터 설정:', initialUserSchedules);
        
        // 스케줄 매핑 생성
        const mapping = {};
        const selectedScheduleNames = [];
        
        initialUserSchedules.forEach(schedule => {
          // 이모지 키로 매핑
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
          
          // 추천 스케줄인 경우 선택 목록에 추가
          if (schedule.recommended && timingName) {
            selectedScheduleNames.push(timingName);
          }
        });
        
        setScheduleMapping(mapping);
        if (selectedScheduleNames.length > 0) {
          setSelectedTimings(selectedScheduleNames);
        }
      }
    } catch (error) {
      console.error('❌ 처방전 데이터 처리 실패:', error);
    }
  };

  // 관련 루틴 ID 가져오기 (일반 루틴 모드용)
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
          } else {
            // 1일 이상 간격은 주기 설정으로 처리
            console.log('🟢 복용 주기 "주기 설정"으로 설정, 간격:', routineData.interval_days);
            setSelectedOption('주기 설정');
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

    // 선택된 옵션에 따라 interval_days 설정
    if (option === '매일') {
      // 매일: interval_days = 1
      console.log('🟢 "매일" 옵션 - interval_days를 1로 설정');
      setIntervalDays('1');
    } else if (option === '주기 설정') {
      // 주기 설정 시 기본값 2로 설정
      console.log('🟢 "주기 설정" 옵션 - interval_days를 2로 설정');
      setIntervalDays('2');
    }
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
      selectedTimings,
      dosage,
      totalCount,
      intervalDays,
      isEditing,
      routineId
    });
    
    // 필수 입력값 검증
    if (!medicineName || selectedTimings.length === 0 || !dosage || !totalCount || !intervalDays) {
      console.error('❌ 필수 입력값 누락');
      Alert.alert('입력 오류', '모든 필드를 채워주세요.');
      return;
    }

    try {
      // 스케줄 변환
      const scheduleIds = convertTimingsToIds();
      
      // 처방전 모드에서는 변경사항을 부모 화면으로 전달
      if (isPrescriptionMode && onRoutineUpdate) {
        // 시간대 추천 정보 구성 - 원본 스케줄 정보 복사 후 수정
        let updatedSchedules = [];
        
        if (initialUserSchedules && Array.isArray(initialUserSchedules)) {
          // 기존 스케줄 복사
          updatedSchedules = [...initialUserSchedules];
          
          // 선택된 스케줄 ID 목록
          const selectedIds = scheduleIds;
          
          // 각 스케줄의 recommended 상태 업데이트
          updatedSchedules = updatedSchedules.map(schedule => ({
            ...schedule,
            recommended: selectedIds.includes(schedule.user_schedule_id)
          }));
        }
        
        // 업데이트된 루틴 정보
        const updatedRoutine = {
          medicine_id: medicineId,
          medicine_name: medicine?.item_name || medicine?.medicine_name || medicineName,
          nickname: medicineName,
          dose: parseInt(dosage, 10),
          total_quantity: parseInt(totalCount, 10),
          total_days: Math.ceil(parseInt(totalCount, 10) / (parseInt(dosage, 10) * selectedTimings.length)), // 약 먹는 일수 계산
          interval_days: parseInt(intervalDays, 10),
          user_schedules: updatedSchedules
        };
        
        console.log('🟢 부모 화면으로 전달할 수정된 루틴 정보:', updatedRoutine);
        
        // 부모 컴포넌트로 수정된 루틴 정보 전달
        onRoutineUpdate(updatedRoutine);
        
        // 수정 완료 메시지 표시
        Alert.alert(
          '수정 완료', 
          '루틴 정보가 수정되었습니다. 등록을 완료하려면 확인 버튼을 눌러주세요.',
          [{ 
            text: '확인', 
            onPress: () => navigation.goBack()
          }]
        );
        
        return;
      }
      
      // 일반 루틴 모드: 실제 API 호출하여 저장
      const routineData = {
        medicine_id: medicineId,
        nickname: medicineName,
        dose: parseInt(dosage, 10),
        total_quantity: parseInt(totalCount, 10),
        interval_days: parseInt(intervalDays, 10),
        user_schedule_ids: scheduleIds
      };

      if (routineId) {
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
        {isEditing && !isPrescriptionMode ? '루틴 수정' : '루틴 등록'}
      </ModalHeader>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 150,
        }}>
        <MedicineOverview
            medicine={{
              ...medicine,
              // item_id가 없다면 medicineId를 사용
              item_id: medicine.item_id || medicineId
            }}
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
            <SectionHeader title="별명" fontSizeMode={fontSizeMode} />
            <InputWithDelete
              placeholder="약 별명을 입력하세요"
              value={medicineName}
              onChangeText={setMedicineName}
            />
          </Section>

          {/* 주기 선택 */}
          <Section>
            <SectionHeader title="복용 주기" fontSizeMode={fontSizeMode} />
            <SelectDay>
              <DualTextButton
                title={'매일'}
                onPress={() => handleSelect('매일')}
                bgColor={selectedOption === '매일' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedOption === '매일' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
              />
              <DualTextButton
                title={'주기 설정 (예: 2일 간격으로)'}
                onPress={() => handleSelect('주기 설정')}
                bgColor={selectedOption === '주기 설정' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                textColor={selectedOption === '주기 설정' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
              />
              {selectedOption === '주기 설정' && (
                <InputWithDelete
                  value={intervalDays}
                  onChangeText={(text) => {
                    // 숫자만 입력되도록 처리
                    if (/^\d*$/.test(text)) {
                      setIntervalDays(text);
                    }
                  }}
                  placeholder="예: 2"
                  keyboardType="numeric"
                />
              )}
            </SelectDay>
          </Section>

          {/* 시간대 선택 */}
          <Section>
            <SectionHeader
              title="복용 시간대"
              buttonText="시간대 설정하기"
              onButtonPress={handleSetTimings}
              fontSizeMode={fontSizeMode}
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
            <SectionHeader title="1회 복용량" fontSizeMode={fontSizeMode} />
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
            <SectionHeader title="총 개수" fontSizeMode={fontSizeMode} />
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
const SectionHeader = ({ title, buttonText, onButtonPress, fontSizeMode }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <SectionTitle fontSizeMode={fontSizeMode}>{title}</SectionTitle>
      {buttonText && (
        <HeaderButton
          onPress={onButtonPress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}>
          <HeaderButtonText fontSizeMode={fontSizeMode}>{buttonText}</HeaderButtonText>
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
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]}px;
  color: ${themes.light.textColor.textPrimary};
`;

const HeaderButton = styled.TouchableOpacity``;

const HeaderButtonText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.Primary30};
`;

const SelectDay = styled.View`
  gap: 10px;
`;

const SelectTime = styled.View`
  gap: 10px;
`;

export default SetMedicineRoutine;