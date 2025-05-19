import React, {useState, useRef, useCallback} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {ScrollView, Dimensions, FlatList} from 'react-native';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderIcons, OtherIcons} from '../../../assets/icons';
import {themes} from '../../styles';
import dayjs from 'dayjs';
import TodayHeader from '../../components/TodayHeader';
import LinearGradient from 'react-native-linear-gradient';
import {getRoutineByDate, checkRoutine} from '../../api/routine';
// data.js에서 데이터 import
import {
  weekDays,
  generateWeeks,
  getTimeTypeFromScheduleName,
  convertToPrettyTime,
  convertToSortValue,
  getDayOfWeek,
} from '../../../assets/data/utils';
import FontSizes from '../../../assets/fonts/fontSizes';
import {getUserSchedule} from '../../api/user';
import RoutineTimeline from '../../components/RoutineTimeline';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const {width} = Dimensions.get('window');

const Routine = ({route}) => {
  const today = dayjs();
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const paramDate = route.params?.selectedDate; // 스크롤할 날짜 파라미터
  const {fontSizeMode} = useFontSize();

  const insets = useSafeAreaInsets(); // SafeArea 인셋 가져오기

  const [timeMapping, setTimeMapping] = useState({
    MORNING: {label: '아침', time: '', sortValue: ''},
    LUNCH: {label: '점심', time: '', sortValue: ''},
    DINNER: {label: '저녁', time: '', sortValue: ''},
    BEDTIME: {label: '자기 전', time: '', sortValue: ''},
  });
  const [medicineRoutines, setMedicineRoutines] = useState([]);
  // 날짜별 routine_medicine_id를 저장
  const [routineMedicineMap, setRoutineMedicineMap] = useState({});

  useFocusEffect(
    useCallback(() => {
      const fetchUserSchedule = async () => {
        try {
          const response = await getUserSchedule();
          const scheduleData = response.data.body;

          console.log('사용자 스케줄: ', scheduleData);

          const updatedMapping = {...timeMapping};

          scheduleData.forEach(item => {
            const key = Object.keys(updatedMapping).find(
              k => updatedMapping[k].label === item.name,
            );

            if (key) {
              updatedMapping[key] = {
                ...updatedMapping[key],
                time: convertToPrettyTime(item.take_time),
                sortValue: convertToSortValue(item.take_time),
              };
            }
          });

          setTimeMapping(updatedMapping);
        } catch (error) {
          console.error('스케줄 불러오기 오류:', error);
        }
      };

      fetchUserSchedule();

      return () => {};
    }, []),
  );

  const weeks = generateWeeks(today);

  // 파라미터 날짜가 있으면 해당 주의 인덱스 계산, 없으면 4(중앙)
  const calculateInitialPage = initDate => {
    // 시작 주와 파라미터 날짜의 주 차이 계산
    const startWeek = today.startOf('week').subtract(4 * 7, 'day');
    const dateWeek = initDate.startOf('week');
    const weekDiff = dateWeek.diff(startWeek, 'week');

    // 유효 범위(0-8) 내로 제한
    return Math.max(0, Math.min(8, weekDiff));
  };

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
      console.log('📨 날짜 파라미터: ', paramDate);
      // 파라미터로 받은 날짜가 있으면 해당 날짜로, 없으면 오늘 날짜로 설정
      const targetDate = paramDate ? dayjs(paramDate) : today;
      const pageIndex = calculateInitialPage(targetDate);

      setSelectedDate({
        day: weekDays[targetDate.day()],
        date: targetDate.date(),
        month: targetDate.month() + 1,
        year: targetDate.year(),
        fullDate: targetDate,
      });

      // 계산된 페이지 인덱스로 스크롤
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToIndex({
            index: pageIndex,
            animated: true,
          });
        }, 300); // 컴포넌트가 완전히 렌더링된 후 스크롤되도록 함
      }
    }, [route.params]),
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

        checkRoutine({
          routine_id: routineMedicineId,
          is_taken: newCheckState,
        });

        console.log(
          `📝복용 여부 업데이트: ${routineMedicineId} 의 상태: ${newCheckState}`,
        );

        return newState;
      });
    } else {
      console.error(
        `routine_id not found for date: ${dateKey}, time: ${time}, medicine: ${medicineId}`,
      );
    }
  };

  // const toggleHospitalCheck = hospitalId => {
  //   setCheckedItems(prev => ({
  //     ...prev,
  //     [`hospital-${hospitalId}`]: !prev[`hospital-${hospitalId}`],
  //   }));
  // };

  const toggleTimeCheck = time => {
    const dateKey = selectedDate.fullDate.format('YYYY-MM-DD');

    // 특정 시간대의 모든 약물이 체크되었는지 확인
    const medicinesForTime = medicineRoutines.filter(
      medicine =>
        medicine.types.includes(time) &&
        medicine.day_of_weeks.includes(
          selectedDate.fullDate.day() === 0 ? 7 : selectedDate.fullDate.day(),
        ),
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

      const routineMedicineId =
        routineMedicineMap[dateKey]?.[time]?.[medicine.medicine_id];
      if (routineMedicineId) {
        checkRoutine({
          routine_id: routineMedicineId,
          is_taken: !allChecked,
        });

        console.log(
          `📝 시간대 일괄 체크: ${routineMedicineId}의 상태 ${!allChecked}로 변경`,
        );
      }
    });

    setCheckedItems(updatedChecks);
  };

  useFocusEffect(
    useCallback(() => {
      const fetchRoutineData = async () => {
        try {
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
          const routineData = response.data.body;
          console.log('루틴 데이터 응답:', routineData);

          const processedRoutines = processRoutineData(routineData);
          setMedicineRoutines(processedRoutines);

          const {routineMap, checkedMap} = mapRoutineData(routineData);
          setRoutineMedicineMap(routineMap);
          setCheckedItems(checkedMap);
        } catch (error) {
          console.error('루틴 데이터 가져오기 실패:', error);
        }
      };

      fetchRoutineData();
    }, [selectedDate.fullDate]),
  );

  const mapRoutineData = routineData => {
    const routineMap = {};
    const checkedMap = {};

    routineData.forEach(day => {
      const dateKey = day.take_date;
      routineMap[dateKey] = {};

      day.user_schedule_dtos.forEach(schedule => {
        const timeType = getTimeTypeFromScheduleName(schedule.name);

        if (!routineMap[dateKey][timeType]) {
          routineMap[dateKey][timeType] = {};
        }

        schedule.routine_dtos?.forEach(medicine => {
          const checkKey = `${dateKey}-${timeType}-${medicine.medicine_id}`;
          routineMap[dateKey][timeType][medicine.medicine_id] =
            medicine.routine_id;
          checkedMap[checkKey] = medicine.is_taken;
        });
      });
    });

    return {routineMap, checkedMap};
  };

  // 루틴 데이터를 원하는 형식으로 가공하는 함수
  const processRoutineData = routineData => {
    // 약물 ID 기준으로 데이터를 그룹화할 객체
    const medicineMap = {};

    // 각 날짜별로 데이터 처리
    routineData.forEach(dayData => {
      const dayOfWeek = getDayOfWeek(dayData.take_date);

      // 각 스케줄 처리
      dayData.user_schedule_dtos.forEach(schedule => {
        // 스케줄 이름으로 시간대 결정, 없으면 시간으로 판단
        const timeType = getTimeTypeFromScheduleName(schedule.name);

        // 해당 스케줄의 약물 정보 처리
        if (schedule.routine_dtos && schedule.routine_dtos.length > 0) {
          schedule.routine_dtos.forEach(medicine => {
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
    const todayMedicineItems = [];
    const dateKey = selectedDate.fullDate.format('YYYY-MM-DD');

    Object.entries(timeMapping).forEach(([timeKey, timeInfo]) => {
      const medicinesForTime = medicineRoutines.filter(medicine => {
        const dayMatch = medicine.day_of_weeks.includes(
          selectedDate.fullDate.day() === 0 ? 7 : selectedDate.fullDate.day(),
        );
        const timeMatch = medicine.types.includes(timeKey);

        if (!dayMatch || !timeMatch) {
          return false;
        }

        const routineExist =
          routineMedicineMap[dateKey]?.[timeKey]?.[medicine.medicine_id];

        return Boolean(routineExist);
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

    // 모든 아이템 합치고 시간순 정렬
    return [...todayMedicineItems].sort((a, b) => a.sortValue - b.sortValue);
  };

  const allRoutines = getAllRoutinesByTime();

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
          <DayText fontSizeMode={fontSizeMode}>{dayInfo.day}</DayText>
          <DateText isToday={dayInfo.isToday} fontSizeMode={fontSizeMode}>
            {dayInfo.date}
          </DateText>
        </DayBox>
      ))}
    </WeekContainer>
  );

  return (
    <Container>
      <HeaderContainer>
        <Header style={{paddingTop: insets.top}}>
          <HeaderText fontSizeMode={fontSizeMode}>루틴</HeaderText>
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
              width={14}
              height={14}
              style={{color: themes.light.pointColor.Primary10}}
            />
            <ButtonText fontSizeMode={fontSizeMode}>돌아가기</ButtonText>
          </ReturnButton>
        </Header>
      </HeaderContainer>
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
          <TodayContainer fontSizeMode={fontSizeMode}>
            <TodayHeader today={today} selectedDate={selectedDate} />
            <MedicineListButton
              onPress={() => navigation.navigate('MedicineList')}>
              <MedicineListText fontSizeMode={fontSizeMode}>
                전체 목록
              </MedicineListText>
              <HeaderIcons.chevron
                width={14}
                height={14}
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
            {/* RoutineTimeline 컴포넌트 사용 */}
            <RoutineTimeline
              allRoutines={allRoutines}
              checkedItems={checkedItems}
              selectedDateString={selectedDate.fullDate.format('YYYY-MM-DD')}
              toggleTimeCheck={toggleTimeCheck}
              toggleCheck={toggleCheck}
              routineMode="default"
              emptyTitle="루틴이 없습니다."
              emptyDescription={`복용 중인 약을 검색하고\n루틴을 추가해 보세요.`}
            />
          </ScheduleContainer>
        </ScrollView>
      </RoundedBox>
    </Container>
  );
};

const Container = styled(LinearGradient).attrs(() => ({
  colors: [
    themes.light.pointColor.Primary,
    themes.light.pointColor.PrimaryDark,
  ],
  start: {x: 0, y: 0},
  end: {x: 0, y: 0.3},
}))`
  flex: 1;
`;

const HeaderContainer = styled.View`
  justify-content: flex-end;
  padding-top: 10px;
`;

const Header = styled.View`
  flex-direction: row;
  padding: 0px 20px;
  padding-top: 10px;
  justify-content: space-between;
`;

const HeaderText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
  padding-left: 10px;
`;

const ReturnButton = styled.TouchableOpacity`
  flex-direction: row;
  padding: 6px 10px;
  justify-content: center;
  align-items: center;
  gap: 7px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
`;

const ButtonText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode]};
  font-family: 'Pretendard-SemiBold';
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
  font-family: 'Pretendard-SemiBold';
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode]};
`;

// 페이징을 위한 컨테이너
const DayContainerWrapper = styled.View``;

// 주차 단위 컨테이너
const WeekContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: ${width};
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
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode]};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.buttonText};
`;

const DateText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]};
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
  padding: ${({fontSizeMode}) =>
    fontSizeMode === 'large'
      ? '20px 10px'
      : fontSizeMode === 'medium'
      ? '20px 20px'
      : '20px 30px'};
`;

export default Routine;
