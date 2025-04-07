import React, {useState, useEffect, useRef} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {ScrollView, Dimensions, FlatList, Platform} from 'react-native';
import styled from 'styled-components/native';
import {HeaderIcons, OtherIcons, RoutineIcons} from '../../../assets/icons';
import {themes} from '../../styles';
import dayjs from 'dayjs';
import TodayHeader from '../../components/TodayHeader';
import LinearGradient from 'react-native-linear-gradient';
import {getRoutineByDate, checkRoutine} from '../../api/routine';
// data.js에서 데이터 import
import {
  timeMapping,
  initialHospitalRoutines,
  weekDays,
} from '../../../assets/data/data';
import FontSizes from '../../../assets/fonts/fontSizes';
import {getUserSchedule} from '../../api/user';
import RoutineCard from '../../components/RoutineCard';

const {width} = Dimensions.get('window');
const PAGE_SIZE = 7; // 한 페이지에 7일씩 표시

const Routine = () => {
  const today = dayjs();
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  // 날짜별 routine_medicine_id를 저장
  const [routineMedicineMap, setRoutineMedicineMap] = useState({});


  // 현재 주차를 중심으로 이전 4주, 이후 4주까지 총 9주 데이터 생성
  const generateWeeks = centerDate => {
    const weeks = [];

    // 이전 4주
    for (let i = -4; i <= 4; i++) {
      const startOfWeek = centerDate.startOf('week').add(i * 7, 'day');
      const weekData = [];

      for (let j = 0; j < 7; j++) {
        const currentDate = startOfWeek.add(j, 'day');
        weekData.push({
          day: weekDays[currentDate.day()],
          date: currentDate.date(),
          month: currentDate.month() + 1,
          year: currentDate.year(),
          fullDate: currentDate,
          isToday:
            currentDate.format('YYYY-MM-DD') === today.format('YYYY-MM-DD'),
        });
      }

      weeks.push(weekData);
    }

    return weeks;
  };

  const [weeks, setWeeks] = useState(() => generateWeeks(today));
  const [currentPage, setCurrentPage] = useState(4); // 현재 주차 인덱스 (중앙 = 4)

  const [selectedDate, setSelectedDate] = useState({
    day: weekDays[today.day()],
    date: today.date(),
    month: today.month() + 1,
    year: today.year(),
    fullDate: today,
  });

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate({
        day: weekDays[today.day()],
        date: today.date(),
        month: today.month() + 1,
        year: today.year(),
        fullDate: today,
      });

      // 오늘 날짜가 있는 페이지로 스크롤
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: 4,
          animated: true,
        });
      }
    }, []),
  );

  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = async (medicineId, time) => {
    // 현재 선택된 날짜 문자열
    const dateKey = selectedDate.fullDate.format('YYYY-MM-DD');
    const checkKey = `${dateKey}-${time}-${medicineId}`;
    
    // routine_medicine_id 가져오기
    const routineMedicineId = routineMedicineMap[dateKey]?.[time]?.[medicineId];
    
    if (routineMedicineId) {
      setCheckedItems(prev => {
        // 새로운 체크 상태 계산
        const newCheckState = !prev[checkKey];
        const newState = {
          ...prev,
          [checkKey]: newCheckState,
        };
        
        // 토글된 상태값을 API에 전달
        checkRoutine({ 
          routine_medicine_id: routineMedicineId, 
          is_taken: newCheckState 
        });
        
        console.log(`📝복용 여부 업데이트: ${routineMedicineId} 의 상태: ${newCheckState}`);
        
        return newState;
      });
    } else {
      console.error(`routine_medicine_id not found for date: ${dateKey}, time: ${time}, medicine: ${medicineId}`);
    }
  };

  const toggleHospitalCheck = hospitalId => {
    setCheckedItems(prev => ({
      ...prev,
      [`hospital-${hospitalId}`]: !prev[`hospital-${hospitalId}`],
    }));
  };

  const toggleTimeCheck = time => {
    const dateKey = selectedDate.fullDate.format('YYYY-MM-DD');
    
    // 특정 시간대의 모든 약물이 체크되었는지 확인
    const medicinesForTime = medicineRoutines.filter(
      medicine =>
        medicine.types.includes(time) &&
        medicine.day_of_weeks.includes(selectedDate.fullDate.day() === 0 ? 7 : 
        selectedDate.fullDate.day()),
    );
  
    const allChecked =
      medicinesForTime.length > 0 &&
      medicinesForTime.every(
        medicine => checkedItems[`${dateKey}-${time}-${medicine.medicine_id}`],
      );
  
    // 해당 시간대의 모든 약물 체크 상태를 변경
    const updatedChecks = {...checkedItems};
    medicinesForTime.forEach(medicine => {
      const checkKey = `${dateKey}-${time}-${medicine.medicine_id}`;
      updatedChecks[checkKey] = !allChecked;
      
      const routineMedicineId = routineMedicineMap[dateKey]?.[time]?.[medicine.medicine_id];
      if (routineMedicineId) {
        {/* 한번에 모든 약물 복용 체크 변경하기 로직 추가 */}
        // 예시: updateMedicineStatus(routineMedicineId, !allChecked);
        // console.log(`Update routine_medicine_id: ${routineMedicineId} to status: ${!allChecked}`);
      }
    });
  
    setCheckedItems(updatedChecks);
  };

  // 컴포넌트 마운트 시 사용자 일정 가져오기
  useEffect(() => {
    const fetchUserSchedule = async () => {
      try {
        const getData = await getUserSchedule();
        const scheduleData = getData.data;
        console.log('사용자 루틴 데이터:', scheduleData);
      } catch (error) {
        console.error('사용자 일정 가져오기 실패:', error);
      }
    };

    fetchUserSchedule();
  }, []);

  const [medicineRoutines, setMedicineRoutines] = useState([]);
  //임시 데이터 사용
  const [hospitalRoutines, setHospitalRoutines] = useState(
    initialHospitalRoutines,
  );

  // API에서 루틴 데이터 가져오기
  useEffect(() => {
    const fetchRoutineData = async () => {
      try {
        // 현재 선택된 날짜의 시작일과 종료일 계산 (일주일 범위로 설정)
        const startDate = selectedDate.fullDate
          .startOf('week')
          .format('YYYY-MM-DD');
        const endDate = selectedDate.fullDate
          .endOf('week')
          .format('YYYY-MM-DD');
        console.log('API 요청 파라미터:', {
          start_date: startDate,
          end_date: endDate,
        });
  
        const response = await getRoutineByDate(startDate, endDate);
        console.log('루틴 데이터 응답:', response.data.body);
        const routineData = response.data.body;
  
        // API 응답에서 initialMedicineRoutines 형식으로 데이터 가공
        const processedMedicineRoutines = processRoutineData(routineData);
        setMedicineRoutines(processedMedicineRoutines);
        
        // 날짜별, 시간대별 routine_medicine_id 매핑
        const routineIdMap = {};
        const initialCheckedState = {};
        
        routineData.forEach(dayData => {
          const dateKey = dayData.take_date;
          routineIdMap[dateKey] = {};
          
          dayData.user_schedule_dtos.forEach(schedule => {
            const timeType = getTimeTypeFromScheduleName(schedule.name) || 
                           getTimeTypeFromTime(schedule.take_time);
            
            if (!routineIdMap[dateKey][timeType]) {
              routineIdMap[dateKey][timeType] = {};
            }
            
            if (schedule.routine_medicine_dtos && schedule.routine_medicine_dtos.length > 0) {
              schedule.routine_medicine_dtos.forEach(medicine => {
                // 날짜, 시간대, medicine_id에 대한 routine_medicine_id 매핑
                routineIdMap[dateKey][timeType][medicine.medicine_id] = medicine.routine_medicine_id;
                
                // 복용 상태 초기화 (날짜, 시간대, medicine_id 조합으로 키 생성)
                const checkKey = `${dateKey}-${timeType}-${medicine.medicine_id}`;
                initialCheckedState[checkKey] = medicine.is_taken;
              });
            }
          });
        });
        
        // 매핑 정보와 체크 상태 저장
        setRoutineMedicineMap(routineIdMap);
        setCheckedItems(initialCheckedState);
      } catch (error) {
        console.error('루틴 데이터 가져오기 실패:', error);
      }
    };
  
    fetchRoutineData();
  }, [selectedDate.fullDate]);

  const getTimeTypeFromScheduleName = scheduleName => {
    const lowerName = scheduleName.toLowerCase();
  
    if (lowerName.includes('아침')) return 'MORNING';
    if (lowerName.includes('점심')) return 'LUNCH';
    if (lowerName.includes('저녁')) return 'DINNER';
    if (lowerName.includes('취침') || lowerName.includes('자기 전')) return 'BEDTIME';
  
    return null;
  };  

  // 루틴 데이터를 원하는 형식으로 가공하는 함수
  const processRoutineData = routineData => {
    // 약물 ID 기준으로 데이터를 그룹화할 객체
    const medicineMap = {};

    // 요일 매핑 (API 날짜 -> 요일 숫자로 변환)
    // getDayOfWeek 함수 수정 - 시간대 이슈 방지
    const getDayOfWeek = dateString => {
      // 날짜 문자열에 시간을 명시적으로 추가하여 시간대 이슈 방지
      const date = new Date(`${dateString}T12:00:00`);
      console.log('날짜:', dateString, '요일:', date.getDay());
      // 요일을 0(일)~6(토)에서 1(월)~7(일)로 변환
      return date.getDay() === 0 ? 7 : date.getDay();
    };

    // 스케줄 이름에 따른 시간대 매핑
    const getTimeTypeFromScheduleName = scheduleName => {
      const lowerName = scheduleName.toLowerCase();

      if (lowerName.includes('아침')) return 'MORNING';
      if (lowerName.includes('점심')) return 'LUNCH';
      if (lowerName.includes('저녁')) return 'DINNER';
      if (lowerName.includes('취침') || lowerName.includes('자기 전'))
        return 'BEDTIME';

      // 이름으로 판단할 수 없는 경우 시간으로 판단
      return null;
    };

    // 시간대 매핑 (시간 -> MORNING, LUNCH, DINNER, BEDTIME)
    const getTimeTypeFromTime = timeString => {
      const hour = parseInt(timeString.split(':')[0]);

      if (hour >= 5 && hour < 10) return 'MORNING';
      if (hour >= 10 && hour < 14) return 'LUNCH';
      if (hour >= 14 && hour < 20) return 'DINNER';
      return 'BEDTIME';
    };

    // 각 날짜별로 데이터 처리
    routineData.forEach(dayData => {
      const dayOfWeek = getDayOfWeek(dayData.take_date);

      // 각 스케줄 처리
      dayData.user_schedule_dtos.forEach(schedule => {
        // 스케줄 이름으로 시간대 결정, 없으면 시간으로 판단
        const timeType =
          getTimeTypeFromScheduleName(schedule.name) ||
          getTimeTypeFromTime(schedule.take_time);

        // 해당 스케줄의 약물 정보 처리
        if (
          schedule.routine_medicine_dtos &&
          schedule.routine_medicine_dtos.length > 0
        ) {
          schedule.routine_medicine_dtos.forEach(medicine => {
            const medicineId = parseInt(medicine.medicine_id);

            // 약물이 맵에 없으면 초기화
            if (!medicineMap[medicineId]) {
              medicineMap[medicineId] = {
                medicine_id: medicineId,
                nickname: medicine.nickname || `약물 ${medicineId}`,
                dose: medicine.dose,
                total_quantity: 0, // API에서 이 정보를 제공하지 않으므로 기본값 설정
                day_of_weeks: [],
                types: [],
              };
            }

            // 해당 요일 추가 (중복 없이)
            if (!medicineMap[medicineId].day_of_weeks.includes(dayOfWeek)) {
              medicineMap[medicineId].day_of_weeks.push(dayOfWeek);
            }

            // 해당 시간대 추가 (중복 없이)
            if (!medicineMap[medicineId].types.includes(timeType)) {
              medicineMap[medicineId].types.push(timeType);
            }
          });
        }
      });
    });

    // 객체를 배열로 변환하고 요일과 시간대 정렬
    const processedRoutines = Object.values(medicineMap).map(medicine => {
      // 요일 정렬 (1,2,3,...)
      medicine.day_of_weeks.sort((a, b) => a - b);

      // 시간대 정렬 (MORNING, LUNCH, DINNER, BEDTIME 순)
      const timeOrder = {MORNING: 0, LUNCH: 1, DINNER: 2, BEDTIME: 3};
      medicine.types.sort((a, b) => timeOrder[a] - timeOrder[b]);

      return medicine;
    });

    return processedRoutines;
  };

  // 모든 루틴 (약 복용 + 병원 방문)을 시간순으로 정렬
  const getAllRoutinesByTime = () => {
    // 오늘 날짜에 해당하는 약 복용 아이템 생성
    const todayMedicineItems = [];
    const dateKey = selectedDate.fullDate.format('YYYY-MM-DD');
  
    Object.entries(timeMapping).forEach(([timeKey, timeInfo]) => {
      const medicinesForTime = medicineRoutines.filter(medicine => {
        const dayMatch = medicine.day_of_weeks.includes(
          selectedDate.fullDate.day() === 0 ? 7 : selectedDate.fullDate.day(),
        );
        return medicine.types.includes(timeKey) && dayMatch;
      });
  
      if (medicinesForTime.length > 0) {
        todayMedicineItems.push({
          id: `medicine-${timeKey}`,
          label: timeInfo.label,
          time: timeInfo.time,
          sortValue: timeInfo.sortValue,
          type: 'medicine',
          timeKey,
          medicines: medicinesForTime,
        });
      }
    });
  
    // 오늘 날짜에 해당하는 병원 방문 아이템 생성
    const todayHospitalItems = hospitalRoutines
      .filter(hospital =>
        hospital.day_of_weeks.includes(selectedDate.fullDate.day() + 1),
      )
      .map(hospital => ({
        id: `hospital-${hospital.hospital_id}`,
        label: hospital.name,
        time: hospital.specific_time,
        sortValue: hospital.sortValue,
        type: 'hospital',
        hospital,
      }));
  
    // 모든 아이템 합치고 시간순 정렬
    return [...todayMedicineItems, ...todayHospitalItems].sort(
      (a, b) => a.sortValue - b.sortValue,
    );
  };

  const allRoutines = getAllRoutinesByTime();

  // 페이지 변경 처리
  const onPageChange = index => {
    setCurrentPage(index);
  };

  // 페이지 변경 감지
  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // 에러 방지를 위한 스크롤 인덱스 처리 함수
  const handleScrollToIndexFailed = info => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({index: info.index, animated: true});
      }
    });
  };

  // 각 주차를 렌더링하는 함수
  const renderWeek = ({item, index}) => (
    <WeekContainer>
      {item.map((dayInfo, dayIndex) => (
        <DayBox
          key={dayIndex}
          isToday={dayInfo.isToday}
          isSelected={
            selectedDate.date === dayInfo.date &&
            selectedDate.month === dayInfo.month &&
            selectedDate.year === dayInfo.year
          }
          onPress={() => setSelectedDate(dayInfo)}>
          <DayText>{dayInfo.day}</DayText>
          <DateText isToday={dayInfo.isToday}>{dayInfo.date}</DateText>
        </DayBox>
      ))}
    </WeekContainer>
  );

  return (
    <Container>
      <Header>
        <HeaderText>루틴</HeaderText>
        <ReturnButton
          onPress={() => {
            // 오늘 날짜로 선택 날짜 변경
            setSelectedDate({
              day: weekDays[today.day()],
              date: today.date(),
              month: today.month() + 1,
              year: today.year(),
              fullDate: today,
            });

            // 오늘 날짜가 있는 페이지(4번 인덱스)로 스크롤
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({
                index: 4,
                animated: true,
              });
            }
          }}>
          <OtherIcons.return
            width={11}
            height={11}
            style={{color: themes.light.pointColor.Primary10}}
          />
          <ButtonText>돌아가기</ButtonText>
        </ReturnButton>
      </Header>

      {/* 페이징 가능한 DayContainer */}
      <DayContainerWrapper>
        <FlatList
          ref={flatListRef}
          data={weeks}
          renderItem={renderWeek}
          keyExtractor={(_, index) => `week-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          // 새로 추가할 prop
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          // initialScrollIndex 제거
        />
      </DayContainerWrapper>
      <RoundedBox>
        <LinearGradient
          colors={['rgba(245, 245, 245, 1)', 'rgba(245, 245, 245, 0)']}
          locations={[0.75, 1]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}>
          <TodayContainer>
            <TodayHeader today={today} selectedDate={selectedDate} />
            <MedicineListButton
              onPress={() => navigation.navigate('MedicineList')}>
              <MedicineListText>전체 목록</MedicineListText>
              <HeaderIcons.chevron
                width={11}
                height={11}
                style={{
                  transform: [{rotate: '180deg'}],
                  color: themes.light.textColor.Primary50,
                }}
              />
            </MedicineListButton>
          </TodayContainer>
        </LinearGradient>

        <ScrollView contentContainerStyle={{paddingVertical: 70}}>
          <ScheduleContainer>
            {/* 타임라인 컨테이너 추가 */}
            <TimelineContainer>
              {/* 타임라인 세로줄 */}
              <TimelineLine />

              {/* 모든 루틴을 시간순으로 렌더링 */}
              {allRoutines.map((routine, index) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  index={index}
                  allLength={allRoutines.length}
                  checkedItems={checkedItems}
                  toggleTimeCheck={toggleTimeCheck}
                  toggleHospitalCheck={toggleHospitalCheck}
                  toggleCheck={toggleCheck}
                  selectedDateString={selectedDate.fullDate.format('YYYY-MM-DD')}
                />
              ))}
            </TimelineContainer>
          </ScheduleContainer>
        </ScrollView>
      </RoundedBox>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.pointColor.Primary};
`;

const Header = styled.View`
  background-color: ${themes.light.pointColor.Primary};
  flex-direction: row;
  padding: 0px 20px;

  ${Platform.OS === 'ios' && `padding-top: 70px;`}
  ${Platform.OS === 'android' && `padding-top: 30px;`}
  justify-content: space-between;
`;

const HeaderText = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
  padding-left: 10px;
`;

const ReturnButton = styled.TouchableOpacity`
  flex-direction: row;
  padding: 4px 10px;
  justify-content: center;
  align-items: center;
  gap: 7px;
  border: 1px solid ${themes.light.pointColor.Primary20};
  border-radius: 20px;
`;

const ButtonText = styled.Text`
  font-size: ${FontSizes.caption.default};
  font-family: 'Pretendart-Medium';
  color: ${themes.light.pointColor.Primary10};
`;

const MedicineListButton = styled(ReturnButton)`
  border: 1.5px solid ${themes.light.borderColor.borderPrimary};
  border-radius: 40px;
  padding: 6px 10px;
  gap: 7px;
`;

const MedicineListText = styled(ButtonText)`
  color: ${themes.light.textColor.Primary50};
  font-family: 'Pretendart-Medium';
  font-size: ${FontSizes.caption.default};
`;

// 페이징을 위한 컨테이너
const DayContainerWrapper = styled.View`
  background-color: ${themes.light.pointColor.Primary};
`;

// 주차 단위 컨테이너
const WeekContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: ${width}px;
  padding: 20px 20px;
`;

const DayBox = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  display: flex;
  padding: 10px 4px;
  border-radius: 7px;
  background-color: ${({isToday, isSelected}) =>
    isSelected ? themes.light.pointColor.PrimaryDark : 'transparent'};
`;

const DayText = styled.Text`
  font-size: ${FontSizes.caption.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.buttonText};
`;

const DateText = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.buttonText};
`;

const ScheduleContainer = styled.View`
  background-color: ${themes.light.bgColor.bgSecondary};
  padding-bottom: 150px;
`;

const RoundedBox = styled.View`
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  background-color: ${themes.light.bgColor.bgSecondary};
  overflow: hidden;
  height: 100%;
`;

const TodayContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
`;
// 타임라인 관련 스타일 추가
const TimelineContainer = styled.View`
  //padding-top: 10px;
  padding-left: 30px;
  position: relative;
`;

const TimelineLine = styled.View`
  position: absolute;
  left: 21px;
  top: 30px;
  bottom: 30px;
  width: 6px;
  background-color: ${themes.light.pointColor.Primary};
`;

export default Routine;
