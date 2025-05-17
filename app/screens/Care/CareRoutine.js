
import React, { useState, useRef } from 'react';
import { ScrollView, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderIcons, OtherIcons } from '../../../assets/icons';
import { themes } from '../../styles';
import dayjs from 'dayjs';
import TodayHeader from '../../components/TodayHeader';
import LinearGradient from 'react-native-linear-gradient';
import { getCareRoutine } from '../../api/userCare';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import RoutineTimeline from '../../components/RoutineTimeline';
import { 
  weekDays,
  generateWeeks,
  getTimeTypeFromScheduleName,
  convertToPrettyTime,
  convertToSortValue,
} from '../../../assets/data/utils';

const { width } = Dimensions.get('window');

const CareRoutine = ({ route }) => {
  const today = dayjs();
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const { fontSizeMode } = useFontSize();
  const { userId, userName, paramDate } = route.params;
  console.log('📦 route.params:', route.params);

  const insets = useSafeAreaInsets();

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

  const [currentPage, setCurrentPage] = useState(4);
  const [selectedDate, setSelectedDate] = useState({
    day: weekDays[today.day()],
    date: today.date(),
    month: today.month() + 1,
    year: today.year(),
    fullDate: today,
  });

  const [routineData, setRoutineData] = useState([]);
  const [timeMapping, setTimeMapping] = useState({
    MORNING: { label: '아침', time: '', sortValue: '' },
    LUNCH: { label: '점심', time: '', sortValue: '' },
    DINNER: { label: '저녁', time: '', sortValue: '' },
    BEDTIME: { label: '자기 전', time: '', sortValue: '' },
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

  const fetchCareRoutine = async (startDate, endDate) => {
    try {
      const response = await getCareRoutine({ 
        userId, 
        startDate, 
        endDate 
      });

      const fetchedRoutineData = response.data.body;
      console.log("🚸 피보호자 루틴 조회 API 응답: ", response.data.body);
      setRoutineData(fetchedRoutineData);

      const updatedTimeMapping = { ...timeMapping };
      fetchedRoutineData.forEach(dayData => {
        dayData.user_schedule_dtos.forEach(schedule => {
          const timeType = getTimeTypeFromScheduleName(schedule.name);
          if (timeType) {
            updatedTimeMapping[timeType] = {
              ...updatedTimeMapping[timeType],
              time: convertToPrettyTime(schedule.take_time),
              sortValue: convertToSortValue(schedule.take_time),
            };
          }
        });
      });

      setTimeMapping(updatedTimeMapping);
    } catch (error) {
      console.error('루틴 데이터 불러오기 실패:', error);
    }
  };

  React.useEffect(() => {
    const startDate = selectedDate.fullDate.startOf('week').format('YYYY-MM-DD');
    const endDate = selectedDate.fullDate.endOf('week').format('YYYY-MM-DD');
    fetchCareRoutine(startDate, endDate);
  }, [selectedDate, userId]);

    const getAllRoutinesByTime = () => {
    const todayMedicineItems = [];
    const dateKey = selectedDate.fullDate.format('YYYY-MM-DD');

    const dayRoutine = routineData.find(day => day.take_date === dateKey);

    if (dayRoutine) {
        Object.entries(timeMapping).forEach(([timeKey, timeInfo]) => {
        const scheduleForTime = dayRoutine.user_schedule_dtos.find(
            schedule => getTimeTypeFromScheduleName(schedule.name) === timeKey
        );

        if (scheduleForTime && scheduleForTime.routine_dtos.length > 0) {
            // 체크 상태를 담은 객체 생성
            const checkedItems = {};
            scheduleForTime.routine_dtos.forEach(medicine => {
            checkedItems[`${dateKey}-${timeKey}-${medicine.medicine_id}`] = medicine.is_taken;
            });

            todayMedicineItems.push({
            id: `medicine-${timeKey}`,
            label: timeInfo.label,
            time: timeInfo.time,
            sortValue: timeInfo.sortValue,
            type: 'medicine',
            timeKey,
            medicines: scheduleForTime.routine_dtos,
            checkedItems: checkedItems, // 체크 상태
            });
        }
        });
    }

    return todayMedicineItems.sort((a, b) => a.sortValue - b.sortValue);
    };

  const allRoutines = getAllRoutinesByTime();

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleScrollToIndexFailed = info => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({index: info.index, animated: true});
      }
    });
  };

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
          <DateText isToday={dayInfo.isToday} fontSizeMode={fontSizeMode}>{dayInfo.date}</DateText>
        </DayBox>
      ))}
    </WeekContainer>
  );

  return (
    <Container style={{ paddingTop: insets.top }}>
      <Header>
        <BackHeaderContainer>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <HeaderIcons.chevron
              width={18}
              height={18}
              style={{color: themes.light.textColor.buttonText}}
            />
          </TouchableOpacity>
          <HeaderText fontSizeMode={fontSizeMode}>{userName}의 루틴</HeaderText>
        </BackHeaderContainer>
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
          <ButtonText fontSizeMode={fontSizeMode}>돌아가기</ButtonText>
        </ReturnButton>
      </Header>

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
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
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
          </TodayContainer>
        </LinearGradient>

        <ScrollView contentContainerStyle={{paddingVertical: 70}}>
          <ScheduleContainer>
            {/* RoutineTimeline 컴포넌트 사용 */}
            <RoutineTimeline
              allRoutines={allRoutines}
              selectedDateString={selectedDate.fullDate.format('YYYY-MM-DD')}
              // toggleTimeCheck, toggleCheck는 CareRoutine에서는 사용하지 않으므로 빈 함수 전달 또는 조건부 전달
              toggleTimeCheck={() => {}}
              toggleCheck={() => {}}
              routineMode="care" // CareRoutine이므로 care 모드 명시
              emptyTitle="루틴이 없습니다."
              emptyDescription="현재 등록된 루틴이 없습니다."
            />
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

const BackHeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

const Header = styled.View`
  background-color: ${themes.light.pointColor.Primary};
  flex-direction: row;
  padding: 0px 20px;
  padding-top: 10px;
  justify-content: space-between;
`;

const HeaderText = styled.Text`
  font-size: ${({ fontSizeMode }) => FontSizes.title[fontSizeMode]};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
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
  font-size: ${({ fontSizeMode }) => FontSizes.caption[fontSizeMode]};
  font-family: 'Pretendart-Medium';
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
  font-size: ${({ fontSizeMode }) => FontSizes.caption[fontSizeMode]};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.buttonText};
`;

const DateText = styled.Text`
  font-size: ${({ fontSizeMode }) => FontSizes.heading[fontSizeMode]};
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

export default CareRoutine;