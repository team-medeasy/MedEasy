import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { themes } from './../../styles';
import { HeaderIcons, RoutineIcons, LogoIcons, OtherIcons } from './../../../assets/icons';
import CalendarWidget from '../../components/CalendarWidget';
import TodayHeader from '../../components/TodayHeader';
import HomeRoutine from '../../components/HomeRoutine';
import FontSizes from '../../../assets/fonts/fontSizes';
import dayjs from 'dayjs';
dayjs.locale('ko');

import { useSignUp } from '../../api/context/SignUpContext';
import { getRoutineByDate } from '../../api/routine';

const Home = () => {
  const navigation = useNavigation();
  const { signUpData } = useSignUp();

  const [medicineRoutines, setMedicineRoutines] = useState([]);
  const [todayRoutine, setTodayRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // 한국어 요일 매핑
  const koreanDays = ['일', '월', '화', '수', '목', '금', '토'];

  // today와 selectedDate 추가
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState({
    day: koreanDays[today.day()], // 한국어 요일로 변경
    date: today.date(),
    month: today.month() + 1,
    year: today.year(),
    fullDate: today
  });

  // API에서 루틴 데이터 가져오기
  useEffect(() => {
    const fetchRoutineData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 선택된 특정 날짜로 조회
        const selectedDateString = selectedDate.fullDate.format('YYYY-MM-DD');

        console.log('API 요청 파라미터:', { start_date: selectedDateString, end_date: selectedDateString });

        const response = await getRoutineByDate(selectedDateString, selectedDateString);
        const todayRoutines = response.data.body;

        console.log(selectedDateString, '의 루틴 데이터:', todayRoutines);

        // 시간대별로 정리된 루틴 데이터 처리
        const processedRoutines = todayRoutines[0]?.user_schedule_dtos.map(schedule => ({
          scheduleId: schedule.user_schedule_id,
          timeName: schedule.name,
          takeTime: (() => {
            const time = dayjs(`2024-01-01T${schedule.take_time}`);
            const hourMinute = time.format('mm') === '00'
              ? time.format('A h시')
              : time.format('A h시 mm분');
          
            return hourMinute
              .replace('AM', '오전')
              .replace('PM', '오후');
          })(),          
          medicines: schedule.routine_medicine_dtos.map(medicine => ({
            name: medicine.nickname,
            dose: medicine.dose,
            isTaken: medicine.is_taken
          })),
          medicineTitle: (() => {
            const medicineNames = schedule.routine_medicine_dtos.map(med => med.nickname);
            if (medicineNames.length === 1) {
              return medicineNames[0];
            } else if (medicineNames.length === 2) {
              return `${medicineNames[0]}, ${medicineNames[1]}`;
            } else if (medicineNames.length > 2) {
              return `${medicineNames[0]}, ${medicineNames[1]} 외 ${medicineNames.length - 2}건`;
            }
            return '';
          })()
        })).filter(routine => routine.medicineTitle !== '') || [];

        setMedicineRoutines(processedRoutines);
      } catch (error) {
        console.error('루틴 데이터 가져오기 실패:', error);
        setError(error);
        setMedicineRoutines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutineData();
  }, [selectedDate.fullDate]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchTodayRoutineData = async () => {
        const today = dayjs().format('YYYY-MM-DD');
        
        try {
          const response = await getRoutineByDate(today, today);
          const routineData = response.data.body;
          
          const todayRoutines = routineData.filter(routine =>
            dayjs(routine.take_date).format('YYYY-MM-DD') === today
          );
          
          if (todayRoutines.length > 0) {
            const hasMedicines = todayRoutines[0].user_schedule_dtos.some(schedule => 
              schedule.routine_medicine_dtos && schedule.routine_medicine_dtos.length > 0
            );
            
            if (hasMedicines) {
              console.log('⏰ 오늘의 루틴 일정이 존재합니다.');
              setTodayRoutine(todayRoutines[0].user_schedule_dtos);
            } else {
              setTodayRoutine(null);
            }
          } else {
            setTodayRoutine(null);
          }
        } catch (error) {
          console.error('오늘의 루틴 데이터 가져오기 실패:', error);
          setTodayRoutine(null);
        }
      };
      
      fetchTodayRoutineData();
      
      // 인터벌을 사용할 필요 없음
      return () => {}; 
    }, [])
  );

  // 날짜 변경 핸들러 추가
  const handleDateChange = (newSelectedDate) => {
    setSelectedDate(newSelectedDate);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleAddMedicineRoutine = () => {
    navigation.navigate('AddMedicineRoutine'); // 복용 루틴 추가 화면으로 이동
  };

  const handleAddHospitalVisit = () => {
    navigation.navigate('AddHospitalVisit'); // 병원 진료 추가 화면으로 이동
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: themes.light.bgColor.bgPrimary, 
      paddingTop: 68 
    }}>
      <ScrollContainer>
        <Header>
          <LogoContainer>
            <LogoIcons.logo
              height={20}
              width={13}
              style={{ color: themes.light.pointColor.Primary }}
              marginRight={10}
            />
            <LogoIcons.logoKr
              height={19}
              width={54}
              style={{ color: themes.light.pointColor.Primary }}
            />
          </LogoContainer>
          <TouchableOpacity onPress={handleNotificationPress}>
            <HeaderIcons.notification
              height={20}
              width={22}
              style={{ color: themes.light.textColor.textPrimary }}
            />
          </TouchableOpacity>
        </Header>

        {/* 약 알림 */}
        <PillReminderContainer>
          <TextContainer>
            <ReminderText>{signUpData.firstName}님, {'\n'}까먹은 약이 있어요.</ReminderText>
            <LogoIcons.logo
              width={70}
              height={112}
              style={{
                color: themes.light.pointColor.Primary10,
                transform: [{ rotate: '10deg' }],
                position: 'absolute',
                bottom: -20,
                right: 40,
              }}
            />
          </TextContainer>
          {todayRoutine ? (
            <View style={{
              alignItems: 'center'
            }}>
              <HomeRoutine schedules={todayRoutine} />
            </View>
          ) : (
            <View style={{
              marginHorizontal: 20
            }}>
              <RoutineButton onPress={handleAddMedicineRoutine}>
                <LogoIcons.logoAdd
                  height={115}
                  style={{ color: themes.light.pointColor.primary30 }}
                />
                <RoutineButtonText>루틴을 추가해주세요.</RoutineButtonText>
              </RoutineButton>
            </View>
          )}
          <ButtonContainer>
            <AddButton onPress={handleAddMedicineRoutine}>
              <ButtonContent>
                <ButtonInfo>
                  <RoutineIcons.medicine
                    height={16}
                    width={16}
                    style={{
                      color: themes.light.pointColor.Primary,
                      marginRight: 10,
                    }}
                  />
                  <ButtonText>복용 루틴 추가하기</ButtonText>
                </ButtonInfo>
                <HeaderIcons.chevron
                  height={16}
                  style={{
                    color: themes.light.textColor.Primary20,
                    transform: [{ rotate: '180deg' }],
                  }}
                />
              </ButtonContent>
            </AddButton>
            <AddButton onPress={handleAddHospitalVisit}>
              <ButtonContent>
                <ButtonInfo>
                  <RoutineIcons.hospital
                    height={16}
                    width={16}
                    style={{
                      color: themes.light.pointColor.Secondary,
                      marginRight: 10,
                    }}
                  />
                  <ButtonText>병원 진료 추가하기</ButtonText>
                </ButtonInfo>
                <HeaderIcons.chevron
                  height={16}
                  style={{
                    color: themes.light.textColor.Primary20,
                    transform: [{ rotate: '180deg' }],
                  }}
                />
              </ButtonContent>
            </AddButton>
          </ButtonContainer>
        </PillReminderContainer>

        {/* 달력 */}
        <CalendarWidget
          onDateChange={handleDateChange}
        />
        <EventIcons>
          <RoutineIcons.medicine width={16} height={16} style={{ color: themes.light.pointColor.Primary }} />
          <EventText>복용 완료</EventText>
          <RoutineIcons.medicine width={16} height={16} style={{ color: themes.light.textColor.Primary20 }} />
          <EventText>미복용</EventText>
          <RoutineIcons.hospital width={16} height={16} style={{ color: themes.light.pointColor.Secondary }} />
          <EventText>병원 진료</EventText>
        </EventIcons>

        <RoutineListContainer>
          <TodayContainer>
            <TodayHeader
              today={today}
              selectedDate={selectedDate}
            />
          </TodayContainer>
          {medicineRoutines.map((routine) => (
            <RoutineList
              key={`routine-${routine.scheduleId}`}
              onPress={() => {
                navigation.navigate('루틴', {
                  selectedDate: selectedDate,
                  paramFromHome: selectedDate.fullDate.format('YYYY-MM-DD')
                });
              }}
            >
              <ListComponent>
                <RoutineIcons.medicine
                  width={20}
                  height={20}
                  style={{ color: themes.light.pointColor.Primary }}
                />
                <ListText>
                  <RoutineTitle>{routine.medicineTitle}</RoutineTitle>
                  <RoutineTime>{routine.timeName} • {routine.takeTime}</RoutineTime>
                </ListText>
              </ListComponent>
              <OtherIcons.chevronDown
                style={{
                  color: themes.light.textColor.Primary30,
                  transform: [{ rotate: '-90deg' }]
                }}
              />
            </RoutineList>
          ))}
        </RoutineListContainer>
      </ScrollContainer>
    </View>
  );
};

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;
const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 15px;
  padding: 0px 25px;
`;

const LogoContainer = styled.View`
  flex-direction: row;
  padding: 0px;
`;

const PillReminderContainer = styled.View`
  flex-direction: column;
  justify-content: space-between;
  border-bottom-width: 10px;
  border-bottom-color: ${themes.light.bgColor.bgSecondary};
`;

const TextContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  margin-top: 20px;
  padding: 20px 20px;
`;

const ReminderText = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  margin-left: 10px;
`;

const RoutineButton = styled(TouchableOpacity)`
  background-color: ${themes.light.pointColor.Primary20};
  width: 100%;
  height: 220px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const RoutineButtonText = styled.Text`
  font-size: ${FontSizes.body.medium};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.pointColor.Primary};
  margin-top: 10px;
`;

const ButtonContainer = styled.View`
  flex-direction: column;
  width: 100%;
  padding: 20px;;
`;

const AddButton = styled(TouchableOpacity)`
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 10px 0;
  flex: 1;
`;

const ButtonContent = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ButtonInfo = styled.View`
  flex-direction: row;
  padding: 0 10px;
`;

const ButtonText = styled.Text`
  font-size: ${FontSizes.body.medium};
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

const EventIcons = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding-left: 34px;
  padding-bottom: 34px;
`;

const EventText = styled.Text`
  font-size: ${FontSizes.caption.medium};
  color: ${themes.light.textColor.Primary50};
  padding-right: 10px;
`;

const TodayContainer = styled.View`
  padding: 10px 0 20px 0;
`;

const RoutineListContainer = styled.View`
  background-color: ${themes.light.bgColor.bgSecondary};
  padding: 20px 20px 200px 20px;
`;

const RoutineList = styled.TouchableOpacity`
  flex-direction: row;
  background-color: ${themes.light.bgColor.bgPrimary};
  width: 100%;
  height: auto;
  border-radius: 10px;
  padding: 15px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ListComponent = styled.View`
  flex-direction: row;
  gap: 20px;
  align-items: center;
  overflow: hidden;
`;

const ListText = styled.View`
  width: 80%;
`;

const RoutineTitle = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.textPrimary};
`;

const RoutineTime = styled.Text`
  font-size: ${FontSizes.caption.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

export default Home;