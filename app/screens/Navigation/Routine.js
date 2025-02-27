import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import {Platform} from 'react-native';
import { OtherIcons } from '../../../assets/icons';
import { themes } from '../../styles';
import dayjs from 'dayjs';

import { RoutineIcons } from '../../../assets/icons';

const timeMapping = {
  MORNING: { label: '아침', time: '오전 8:00' },
  LUNCH: { label: '점심', time: '오후 12:30' },
  DINNER: { label: '저녁', time: '오후 6:30' },
  BEDTIME: { label: '자기 전', time: '오후 10:00' }
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
      [`${medicineId}-${time}`]: !prev[`${medicineId}-${time}`]
    }));
  };

  const toggleTimeCheck = (time) => {
    const allChecked = Object.entries(checkedItems)
      .filter(([key]) => key.endsWith(`-${time}`))
      .every(([, value]) => value);

    const updatedChecks = { ...checkedItems };
    Object.keys(checkedItems).forEach((key) => {
      if (key.endsWith(`-${time}`)) {
        updatedChecks[key] = !allChecked;
      }
    });
    setCheckedItems(updatedChecks);
  };



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

  const groupByTime = (routines) => {
    const grouped = {
      MORNING: [],
      LUNCH: [],
      DINNER: [],
      BEDTIME: []
    };
    routines.forEach((medicine) => {
      if (medicine.day_of_weeks.includes(selectedDate.fullDate.day() + 1)) {
        medicine.types.forEach((type) => {
          if (grouped[type]) {
            grouped[type].push(medicine);
          }
        });
      }
    });
    return grouped;
  };

  const groupedMedicines = groupByTime(medicineRoutines);

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
          {Object.entries(groupedMedicines).map(([time, medicines]) => (
            medicines.length > 0 && (
              <MedicineRoutine key={time}>
                <TimeContainer>
                  <IconContainer><RoutineIcons.medicine width={22} height={22} style={{ color: themes.light.pointColor.Primary }} /></IconContainer>
                  <TextContainer>
                    <TypeText>{timeMapping[time].label}</TypeText>
                    <TimeText>{timeMapping[time].time}</TimeText>
                  </TextContainer>
                  <CheckBox onPress={() => toggleTimeCheck(time)}>
                    {Object.keys(checkedItems).some(key => key.endsWith(`-${time}`) && checkedItems[key]) ? (
                      <RoutineIcons.checkOn width={26} height={26} style={{ color: themes.light.pointColor.Primary }} />
                    ) : (
                      <RoutineIcons.checkOff width={26} height={26} style={{ color: themes.light.boxColor.inputSecondary }} />
                    )}
                  </CheckBox>
                </TimeContainer>
                <Routines>
                  <RoutineList>
                    {medicines.map((medicine) => (
                      <MedicineItem key={medicine.medicine_id}>
                        <MedicineText>{`${medicine.nickname} (${medicine.dose}정)`}</MedicineText>
                        <CheckBox onPress={() => toggleCheck(medicine.medicine_id, time)}>
                          {checkedItems[`${medicine.medicine_id}-${time}`] ? (
                            <RoutineIcons.checkOn width={26} height={26} style={{ color: themes.light.pointColor.Primary }} />
                          ) : (
                            <RoutineIcons.checkOff width={26} height={26} style={{ color: themes.light.boxColor.inputSecondary }} />
                          )}
                        </CheckBox>
                      </MedicineItem>
                    ))}
                  </RoutineList>
                </Routines>
              </MedicineRoutine>
            )
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

const MedicineRoutine = styled.View`
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

const HospitalRoutine = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 20px 20px;
  border-radius: 10px;
  width: 100%;
  height: auto;
  margin-bottom: 30px;
`;

const HospitalText = styled.Text`
  font-size: 18px;
  font-family: 'Pretendard-ExtraBold';
`;

export default Routine;