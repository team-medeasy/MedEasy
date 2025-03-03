import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { OtherIcons } from '../../../assets/icons';
import { themes } from '../../styles';
import dayjs from 'dayjs';

import { RoutineIcons } from '../../../assets/icons';

// 시간 매핑에 시간값 추가 (정렬을 위한 숫자값 포함)
const timeMapping = {
  MORNING: { label: '아침', time: '오전 8:00', sortValue: 800 },
  LUNCH: { label: '점심', time: '오후 12:30', sortValue: 1230 },
  DINNER: { label: '저녁', time: '오후 6:30', sortValue: 1830 },
  BEDTIME: { label: '자기 전', time: '오후 10:00', sortValue: 2200 }
};

// 병원 시간을 숫자값으로 변환하는 함수
const getTimeValue = (timeString) => {
  if (!timeString) return 0;

  const isPM = timeString.includes('오후');
  let [hour, minute] = timeString.replace('오전 ', '').replace('오후 ', '').split(':').map(Number);

  if (isPM && hour !== 12) hour += 12;
  return hour * 100 + minute;
};

const Routine = () => {
  const today = dayjs();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const [selectedDate, setSelectedDate] = useState({
    day: weekDays[today.day()],
    date: today.date(),
    month: today.month() + 1,
    year: today.year(),
    fullDate: today
  });

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate({
        day: weekDays[today.day()],
        date: today.date(),
        month: today.month() + 1,
        year: today.year(),
        fullDate: today
      });
    }, [])
  );

  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = today.startOf('week').add(i, 'day');
    return {
      day: weekDays[date.day()],
      date: date.date(),
      month: date.month() + 1,
      year: date.year(),
      fullDate: date,
      isToday: date.date() === today.date() &&
        date.month() === today.month() &&
        date.year() === today.year()
    };
  });

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
    setCheckedItems((prev) => ({
      ...prev,
      [`medicine-${medicineId}-${time}`]: !prev[`medicine-${medicineId}-${time}`]
    }));
  };

  const toggleHospitalCheck = (hospitalId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [`hospital-${hospitalId}`]: !prev[`hospital-${hospitalId}`]
    }));
  };

  const toggleTimeCheck = (time) => {
    // 특정 시간대의 모든 약물이 체크되었는지 확인
    const medicinesForTime = medicineRoutines.filter(medicine =>
      medicine.types.includes(time) &&
      medicine.day_of_weeks.includes(selectedDate.fullDate.day() + 1)
    );

    const allChecked = medicinesForTime.length > 0 &&
      medicinesForTime.every(medicine => checkedItems[`medicine-${medicine.medicine_id}-${time}`]);

    // 해당 시간대의 모든 약물 체크 상태를 변경
    const updatedChecks = { ...checkedItems };
    medicinesForTime.forEach(medicine => {
      updatedChecks[`medicine-${medicine.medicine_id}-${time}`] = !allChecked;
    });

    setCheckedItems(updatedChecks);
  };

  //임시 약 데이터
  const [medicineRoutines, setMedicineRoutines] = useState([
    {
      medicine_id: 3594,
      nickname: '아스피린',
      dose: 1,
      total_quantity: 30,
      day_of_weeks: [1, 2, 3],
      types: ['MORNING', 'LUNCH', 'DINNER', 'BEDTIME']
    },
    {
      medicine_id: 9876,
      nickname: '타이레놀',
      dose: 2,
      total_quantity: 20,
      day_of_weeks: [2, 4, 6],
      types: ['MORNING', 'DINNER']
    }
  ]);

  //임시 병원 데이터
  const [hospitalRoutines, setHospitalRoutines] = useState([
    {
      hospital_id: 1001,
      name: '한성대병원 외래 진료',
      time: 'MORNING',
      specific_time: '오전 10:30',
      sortValue: 1030,
      day_of_weeks: [1, 3, 5]
    },
    {
      hospital_id: 1002,
      name: '연세세브란스병원',
      time: 'AFTERNOON',
      specific_time: '오후 2:00',
      sortValue: 1400,
      day_of_weeks: [2, 4]
    },
    {
      hospital_id: 1003,
      name: '고려대학병원',
      time: 'MORNING',
      specific_time: '오전 11:00',
      sortValue: 1100,
      day_of_weeks: [3, 6]
    }
  ]);

  // 모든 루틴 (약 복용 + 병원 방문)을 시간순으로 정렬
  const getAllRoutinesByTime = () => {
    // 오늘 날짜에 해당하는 약 복용 아이템 생성
    const todayMedicineItems = [];

    Object.entries(timeMapping).forEach(([timeKey, timeInfo]) => {
      const medicinesForTime = medicineRoutines.filter(medicine =>
        medicine.types.includes(timeKey) &&
        medicine.day_of_weeks.includes(selectedDate.fullDate.day() + 1)
      );

      if (medicinesForTime.length > 0) {
        todayMedicineItems.push({
          id: `medicine-${timeKey}`,
          label: timeInfo.label,
          time: timeInfo.time,
          sortValue: timeInfo.sortValue,
          type: 'medicine',
          timeKey,
          medicines: medicinesForTime
        });
      }
    });

    // 오늘 날짜에 해당하는 병원 방문 아이템 생성
    const todayHospitalItems = hospitalRoutines
      .filter(hospital => hospital.day_of_weeks.includes(selectedDate.fullDate.day() + 1))
      .map(hospital => ({
        id: `hospital-${hospital.hospital_id}`,
        label: hospital.name,
        time: hospital.specific_time,
        sortValue: hospital.sortValue,
        type: 'hospital',
        hospital
      }));

    // 모든 아이템 합치고 시간순 정렬
    return [...todayMedicineItems, ...todayHospitalItems]
      .sort((a, b) => a.sortValue - b.sortValue);
  };

  const allRoutines = getAllRoutinesByTime();

  return (
    <Container>
      <Header>
        <HeaderText>루틴</HeaderText>
        <ReturnButton>
          <OtherIcons.return width={11} height={9} style={{ color: themes.light.textColor.Primary50 }} />
          <ButtonText>돌아가기</ButtonText>
        </ReturnButton>
      </Header>
      <DayContainer>
        {currentWeek.map((dayInfo, index) => (
          <DayBox
            key={index}
            isToday={dayInfo.isToday}
            isSelected={selectedDate.date === dayInfo.date && selectedDate.month === dayInfo.month && selectedDate.year === dayInfo.year}
            onPress={() => setSelectedDate(dayInfo)}>
            <DayText>{dayInfo.day}</DayText>
            <DateText isToday={dayInfo.isToday}>{dayInfo.date}</DateText>
          </DayBox>
        ))}
      </DayContainer>
      <ScrollView>
        <ScheduleContainer>
          <TodayContainer>
            <TodayText>{getRelativeDayText(selectedDate, today)}</TodayText>
            <TodayDate>{`${selectedDate.month}월 ${selectedDate.date}일 ${selectedDate.day}요일`}</TodayDate>
          </TodayContainer>

          // 렌더링 부분에서 조건부로 컨테이너 사용
          {allRoutines.map((routine) => (
            <RoutineContainer key={routine.id}>
              {routine.type === 'medicine' ? (
                <TimeContainer>
                  <IconContainer>
                    <RoutineIcons.medicine width={22} height={22} style={{ color: themes.light.pointColor.Primary }} />
                  </IconContainer>
                  <TextContainer>
                    <TypeText>{routine.label}</TypeText>
                    <TimeText>{routine.time}</TimeText>
                  </TextContainer>
                  <CheckBox onPress={() => toggleTimeCheck(routine.timeKey)}>
                    {routine.medicines.every(medicine =>
                      checkedItems[`medicine-${medicine.medicine_id}-${routine.timeKey}`]) ? (
                      <RoutineIcons.checkOn width={26} height={26} style={{ color: themes.light.pointColor.Primary }} />
                    ) : (
                      <RoutineIcons.checkOff width={26} height={26} style={{ color: themes.light.boxColor.inputSecondary }} />
                    )}
                  </CheckBox>
                </TimeContainer>
              ) : (
                <HospitalTimeContainer>
                  <IconContainer>
                    <RoutineIcons.hospital width={22} height={22} style={{ color: themes.light.pointColor.Secondary }} />
                  </IconContainer>
                  <TextContainer>
                    <TypeText>{routine.label}</TypeText>
                    <TimeText>{routine.time}</TimeText>
                  </TextContainer>
                  <CheckBox onPress={() => toggleHospitalCheck(routine.hospital.hospital_id)}>
                    {checkedItems[`hospital-${routine.hospital.hospital_id}`] ? (
                      <RoutineIcons.checkOn width={26} height={26} style={{ color: themes.light.pointColor.Primary }} />
                    ) : (
                      <RoutineIcons.checkOff width={26} height={26} style={{ color: themes.light.boxColor.inputSecondary }} />
                    )}
                  </CheckBox>
                </HospitalTimeContainer>
              )}

              {/* 약 복용 루틴일 경우에만 약 목록 표시 */}
              {routine.type === 'medicine' && (
                <Routines>
                  <RoutineList>
                    {routine.medicines.map((medicine) => (
                      <MedicineItem key={medicine.medicine_id}>
                        <MedicineText>{`${medicine.nickname} (${medicine.dose}정)`}</MedicineText>
                        <CheckBox onPress={() => toggleCheck(medicine.medicine_id, routine.timeKey)}>
                          {checkedItems[`medicine-${medicine.medicine_id}-${routine.timeKey}`] ? (
                            <RoutineIcons.checkOn width={26} height={26} style={{ color: themes.light.pointColor.Primary }} />
                          ) : (
                            <RoutineIcons.checkOff width={26} height={26} style={{ color: themes.light.boxColor.inputSecondary }} />
                          )}
                        </CheckBox>
                      </MedicineItem>
                    ))}
                  </RoutineList>
                </Routines>
              )}
            </RoutineContainer>
          ))}
        </ScheduleContainer>
      </ScrollView>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const Header = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  flex-direction: row;
  padding: 0px 20px;
  
  ${Platform.OS === 'ios' && `
        margin-top: 70px;
      `}
      ${Platform.OS === 'android' && `
        margin-top: 40px;
      `}
  justify-content: space-between;
`;

const HeaderText = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${themes.light.textColor.textPrimary};
  padding-left: 10px;
`;

const ReturnButton = styled.TouchableOpacity`
  flex-direction: row;
  padding: 6px 10px;
  justify-content: center;
  align-items: center;
  gap: 7px;
  border: 1px solid ${themes.light.textColor.Primary20};
  border-radius: 20px;
`;

const ButtonText = styled.Text`
  font-size: 12px;
  font-family: 'Pretendart-Regular';
  color: ${themes.light.textColor.Primary50};
`;

const DayContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: 30px 20px;
  gap: 9px;
`;

const DayBox = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  display: flex;
  padding: 10px 4px;
  border-radius: 7px;
  background-color: ${({ isToday, isSelected }) =>
    isSelected
      ? themes.light.pointColor.Primary20
      : 'transparent'};
`;

const DayText = styled.Text`
  font-size: 12px;
  font-family: 'Pretendard-Regular';
  color: ${themes.light.textColor.textPrimary};
`;

const DateText = styled.Text`
  font-size: 18px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

const ScheduleContainer = styled.View`
  background-color: ${themes.light.bgColor.bgSecondary};
`;

const TodayContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 20px;
`;

const TodayText = styled.Text`
  font-size: 22px;
  font-family: 'Pretendard-ExtraBold';
  color: ${themes.light.textColor.textPrimary};
`;

const TodayDate = styled.Text`
  font-size: 22px;
  font-family: 'Pretendard-ExtraBold';
  color: ${themes.light.textColor.Primary30};
`;

const RoutineContainer = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 0 20px;
  border-radius: 10px;
  width: auto;
  height: auto;
  margin-bottom: 30px;
  margin-left: 55px;
  margin-right: 20px;
`;

const TimeContainer = styled.View`
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
  padding: 20px 0px;
  align-items: center;
`;

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
  font-size: 18px;
  font-family: 'Pretendard-ExtraBold';
`;

const TimeText = styled.Text`
  font-size: 15px;  
  font-family: 'Pretendard-Regular';
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
  font-size: 15px;
  font-family: 'Pretendard-Regular';
  padding: 20px;
`;

export default Routine;