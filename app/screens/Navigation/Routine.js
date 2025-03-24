import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Dimensions, FlatList, Platform } from 'react-native';
import styled from 'styled-components/native';
import { OtherIcons, RoutineIcons } from '../../../assets/icons';
import { themes } from '../../styles';
import dayjs from 'dayjs';

import { getRoutineByDate } from '../../api/routine';

// data.js에서 데이터 import
import {
  timeMapping,
  initialHospitalRoutines,
  weekDays,
} from '../../../assets/data/data';
import FontSizes from '../../../assets/fonts/fontSizes';

const { width } = Dimensions.get('window');
const PAGE_SIZE = 7; // 한 페이지에 7일씩 표시

const Routine = () => {
  const today = dayjs();
  const flatListRef = useRef(null);

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

  // 상대적 날짜 텍스트 생성 함수
  const getRelativeDayText = (selectedDate, today) => {
    const selectedDateObj = dayjs(`${selectedDate.year}-${selectedDate.month}-${selectedDate.date}`);
    const todayObj = dayjs(`${today.year()}-${today.month() + 1}-${today.date()}`);
    const diff = selectedDateObj.diff(todayObj, 'day');

    if (diff === 0) return '오늘';
    if (diff === -1) return '어제';
    if (diff === 1) return '내일';
    if (diff === 2) return '모레';
    return diff < 0 ? `${Math.abs(diff)}일 전` : `${diff}일 후`;
  };

  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (medicineId, time) => {
    setCheckedItems(prev => ({
      ...prev,
      [`medicine-${medicineId}-${time}`]:
        !prev[`medicine-${medicineId}-${time}`],
    }));
  };

  const toggleHospitalCheck = hospitalId => {
    setCheckedItems(prev => ({
      ...prev,
      [`hospital-${hospitalId}`]: !prev[`hospital-${hospitalId}`],
    }));
  };

  const toggleTimeCheck = time => {
    // 특정 시간대의 모든 약물이 체크되었는지 확인
    const medicinesForTime = medicineRoutines.filter(
      medicine =>
        medicine.types.includes(time) &&
        medicine.day_of_weeks.includes(selectedDate.fullDate.day() + 1),
    );

    const allChecked =
      medicinesForTime.length > 0 &&
      medicinesForTime.every(
        medicine => checkedItems[`medicine-${medicine.medicine_id}-${time}`],
      );

    // 해당 시간대의 모든 약물 체크 상태를 변경
    const updatedChecks = { ...checkedItems };
    medicinesForTime.forEach(medicine => {
      updatedChecks[`medicine-${medicine.medicine_id}-${time}`] = !allChecked;
    });

    setCheckedItems(updatedChecks);
  };

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
        const startDate = selectedDate.fullDate.startOf('week').format('YYYY-MM-DD');
        const endDate = selectedDate.fullDate.endOf('week').format('YYYY-MM-DD');

        console.log('API 요청 파라미터:', { start_date: startDate, end_date: endDate });

        const response = await getRoutineByDate(startDate, endDate);
        console.log('루틴 데이터 응답:', response.data.body);

        // 응답 데이터가 response.data.body에 있다고 가정
        const routineData = response.data.body;

        // 전체 데이터 구조 확인
        console.log('전체 루틴 데이터:', routineData);

        // 각 날짜별 스케줄 정보 추출 및 출력
        routineData.forEach(dayData => {
          console.log(`날짜: ${dayData.take_date}`);

          // 해당 날짜의 스케줄 목록 출력
          dayData.user_schedule_dtos.forEach(schedule => {
            console.log(`  스케줄: ${schedule.name}, 시간: ${schedule.take_time}`);

            // 각 스케줄에 포함된 약물 정보 출력
            if (schedule.routine_medicine_dtos && schedule.routine_medicine_dtos.length > 0) {
              console.log('  복용 약물 목록:');
              schedule.routine_medicine_dtos.forEach(medicine => {
                console.log(`    - 약물: ${medicine.nickname || '이름 없음'} (ID: ${medicine.medicine_id})`);
                console.log(`      용량: ${medicine.dose}정, 복용 여부: ${medicine.is_taken ? '복용함' : '복용 전'}`);
                console.log(`      routine_medicine_id: ${medicine.routine_medicine_id}`);
              });
            }
          });

          console.log('------------------------');
        });

        // 복용하지 않은 약물만 필터링하여 출력
        console.log('\n복용하지 않은 약물 목록:');
        routineData.forEach(dayData => {
          const unTakenMedicines = [];

          dayData.user_schedule_dtos.forEach(schedule => {
            if (schedule.routine_medicine_dtos) {
              schedule.routine_medicine_dtos.forEach(med => {
                if (!med.is_taken) {
                  unTakenMedicines.push({
                    date: dayData.take_date,
                    schedule: schedule.name,
                    time: schedule.take_time,
                    medicine: med.nickname,
                    dose: med.dose
                  });
                }
              });
            }
          });

          if (unTakenMedicines.length > 0) {
            console.log(`${dayData.take_date}에 복용하지 않은 약물:`);
            unTakenMedicines.forEach(item => {
              console.log(`  - ${item.time} ${item.schedule}: ${item.medicine} ${item.dose}정`);
            });
          }
        });

        if (response.data && response.data.medicine) {
          setMedicineRoutines(response.data.medicine);
        }

        // if (response.data && response.data.hospital) {
        //   setHospitalRoutines(response.data.hospital);
        // }

      } catch (error) {
        console.error('루틴 데이터 가져오기 실패:', error);
      }
    };

    fetchRoutineData();
  }, [selectedDate.fullDate]); // selectedDate가 변경될 때마다 API 호출

  // 모든 루틴 (약 복용 + 병원 방문)을 시간순으로 정렬
  const getAllRoutinesByTime = () => {
    // 오늘 날짜에 해당하는 약 복용 아이템 생성
    const todayMedicineItems = [];

    Object.entries(timeMapping).forEach(([timeKey, timeInfo]) => {
      const medicinesForTime = medicineRoutines.filter(
        medicine =>
          medicine.types.includes(timeKey) &&
          medicine.day_of_weeks.includes(selectedDate.fullDate.day() + 1),
      );

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
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
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
        flatListRef.current.scrollToIndex({ index: info.index, animated: true });
      }
    });
  };

  // 각 주차를 렌더링하는 함수
  const renderWeek = ({ item, index }) => (
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
        <ReturnButton onPress={() => {
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
            height={9}
            style={{ color: themes.light.pointColor.Primary10 }}
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
      <TodayBackColor>
        <TodayContainer>
          <TodayText>{getRelativeDayText(selectedDate, today)}</TodayText>
          <TodayDate>{`${selectedDate.month}월 ${selectedDate.date}일 ${selectedDate.day}요일`}</TodayDate>
        </TodayContainer>
      </TodayBackColor>

      <ScrollView>
        <ScheduleContainer>
          {/* 타임라인 컨테이너 추가 */}
          <TimelineContainer>
            {/* 타임라인 세로줄 */}
            <TimelineLine />

            {/* 모든 루틴을 시간순으로 렌더링 */}
            {allRoutines.map((routine, index) => (
              <RoutineBoxContainer key={routine.id}>
                {/* 타임라인 포인트 */}
                <TimelinePoint
                  type={routine.type}
                  isFirst={index === 0}
                  isLast={index === allRoutines.length - 1}
                />
                <TimelineBigPoint
                  type={routine.type}
                  isFirst={index === 0}
                  isLast={index === allRoutines.length - 1}
                />

                {/* 루틴 컨테이너 */}
                <RoutineContainer>
                  {routine.type === 'medicine' ? (
                    <TimeContainer>
                      <IconContainer>
                        <RoutineIcons.medicine
                          width={22}
                          height={22}
                          style={{ color: themes.light.pointColor.Primary }}
                        />
                      </IconContainer>
                      <TextContainer>
                        <TypeText>{routine.label}</TypeText>
                        <TimeText>{routine.time}</TimeText>
                      </TextContainer>
                      <CheckBox
                        onPress={() => toggleTimeCheck(routine.timeKey)}>
                        {routine.medicines.every(
                          medicine =>
                            checkedItems[
                            `medicine-${medicine.medicine_id}-${routine.timeKey}`
                            ],
                        ) ? (
                          <RoutineIcons.checkOn
                            width={26}
                            height={26}
                            style={{ color: themes.light.pointColor.Primary }}
                          />
                        ) : (
                          <RoutineIcons.checkOff
                            width={26}
                            height={26}
                            style={{
                              color: themes.light.boxColor.inputSecondary,
                            }}
                          />
                        )}
                      </CheckBox>
                    </TimeContainer>
                  ) : (
                    <HospitalTimeContainer>
                      <IconContainer>
                        <RoutineIcons.hospital
                          width={22}
                          height={22}
                          style={{ color: themes.light.pointColor.Secondary }}
                        />
                      </IconContainer>
                      <TextContainer>
                        <TypeText>{routine.label}</TypeText>
                        <TimeText>{routine.time}</TimeText>
                      </TextContainer>
                      <CheckBox
                        onPress={() =>
                          toggleHospitalCheck(routine.hospital.hospital_id)
                        }>
                        {checkedItems[
                          `hospital-${routine.hospital.hospital_id}`
                        ] ? (
                          <RoutineIcons.checkOn
                            width={26}
                            height={26}
                            style={{ color: themes.light.pointColor.Primary }}
                          />
                        ) : (
                          <RoutineIcons.checkOff
                            width={26}
                            height={26}
                            style={{
                              color: themes.light.boxColor.inputSecondary,
                            }}
                          />
                        )}
                      </CheckBox>
                    </HospitalTimeContainer>
                  )}

                  {/* 약 복용 루틴일 경우에만 약 목록 표시 */}
                  {routine.type === 'medicine' && (
                    <Routines>
                      <RoutineList>
                        {routine.medicines.map(medicine => (
                          <MedicineItem key={medicine.medicine_id}>
                            <MedicineText
                              isChecked={
                                checkedItems[
                                `medicine-${medicine.medicine_id}-${routine.timeKey}`
                                ]
                              }>
                              {`${medicine.nickname}`}
                            </MedicineText>
                            <MedicineCount isChecked={
                              checkedItems[
                              `medicine-${medicine.medicine_id}-${routine.timeKey}`
                              ]
                            }>
                              {`${medicine.dose}개`}
                            </MedicineCount>
                            <CheckBox
                              onPress={() =>
                                toggleCheck(
                                  medicine.medicine_id,
                                  routine.timeKey,
                                )
                              }>
                              {checkedItems[
                                `medicine-${medicine.medicine_id}-${routine.timeKey}`
                              ] ? (
                                <RoutineIcons.checkOn
                                  width={26}
                                  height={26}
                                  style={{
                                    color: themes.light.pointColor.Primary,
                                  }}
                                />
                              ) : (
                                <RoutineIcons.checkOff
                                  width={26}
                                  height={26}
                                  style={{
                                    color: themes.light.boxColor.inputSecondary,
                                  }}
                                />
                              )}
                            </CheckBox>
                          </MedicineItem>
                        ))}
                      </RoutineList>
                    </Routines>
                  )}
                </RoutineContainer>
              </RoutineBoxContainer>
            ))}
          </TimelineContainer>
        </ScheduleContainer>
      </ScrollView>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgSecondary};
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
  padding: 6px 10px;
  justify-content: center;
  align-items: center;
  gap: 7px;
  border: 1px solid ${themes.light.pointColor.Primary20};
  border-radius: 20px;
`;

const ButtonText = styled.Text`
  font-size: ${FontSizes.caption.default};
  font-family: 'Pretendart-Regular';
  color: ${themes.light.pointColor.Primary10};
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
  background-color: ${({ isToday, isSelected }) =>
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

const TodayBackColor = styled.View`
  background-color: ${themes.light.pointColor.Primary};
`;

const TodayContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background-color: ${themes.light.bgColor.bgSecondary};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
`;

const TodayText = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'Pretendard-ExtraBold';
  color: ${themes.light.textColor.textPrimary};
`;

const TodayDate = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'Pretendard-ExtraBold';
  color: ${themes.light.textColor.Primary30};
`;

// 타임라인 관련 스타일 추가
const TimelineContainer = styled.View`
  padding-top: 10px;
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

const TimelineBigPoint = styled.View`
  position: absolute;
  left: -16px;
  top: 15px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: ${themes.light.pointColor.primary30};
  z-index: 2;
`;

const TimelinePoint = styled.View`
  position: absolute;
  left: -12px;
  top: 19px;
  width: 12px;
  height: 12px;
  border-radius: 10px;
  background-color: ${themes.light.pointColor.Primary};
  z-index: 2;
`;

const RoutineBoxContainer = styled.View`
  position: relative;
  margin-bottom: 30px;
`;

// 루틴 컨테이너 스타일 수정
const RoutineContainer = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 0 20px;
  border-radius: 10px;
  width: auto;
  height: auto;
  margin-left: 24px;
  margin-right: 20px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
`;

const TimeContainer = styled.View`
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
  padding: 20px 0px;
  align-items: center;
`;

// 병원 루틴용 컨테이너
const HospitalTimeContainer = styled.View`
  flex-direction: row;
  padding: 20px 0px;
  align-items: center;
`;

const IconContainer = styled.View`
  padding-right: 15px;
`;

const TextContainer = styled.View``;

const TypeText = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'Pretendard-ExtraBold';
`;

const TimeText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

const RoutineList = styled.View``;

const MedicineItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CheckBox = styled.TouchableOpacity`
  position: absolute;
  right: 0;
`;

const Routines = styled.View``;

const MedicineText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  padding: 20px;
  text-decoration-line: ${({ isChecked }) =>
    isChecked ? 'line-through' : 'none'};
  color: ${({ isChecked }) =>
    isChecked
      ? themes.light.textColor.Primary50
      : themes.light.textColor.textPrimary};
`;

const MedicineCount = styled.Text`
  position: absolute;
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  right: 45px;
  text-decoration-line: ${({ isChecked }) =>
    isChecked ? 'line-through' : 'none'};
  color: ${({ isChecked }) =>
    isChecked
      ? themes.light.textColor.Primary50
      : themes.light.textColor.textPrimary};
`;

export default Routine;
