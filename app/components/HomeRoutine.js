import React, {useState, useEffect} from 'react';
import {FlatList} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import {themes} from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import {useFontSize} from '../../assets/fonts/FontSizeContext';
import {RoutineIcons} from '../../assets/icons';
import dayjs from 'dayjs';

const HomeRoutine = ({schedules}) => {
  const {fontSizeMode} = useFontSize();
  const [routineSchedules, setRoutineSchedules] = useState([]);

  useEffect(() => {
    // 약이 있는 스케줄만 필터링
    const medicineSchedules = schedules.filter(
      schedule => schedule.routine_dtos.length > 0,
    );
    setRoutineSchedules(medicineSchedules);
  }, [schedules]);

  const renderRoutineItem = ({item}) => (
    <RoutineContainer>
      <MedicineHeader>
        <TitleContainer>
          <RoutineIcons.medicine
            width={15}
            height={15}
            style={{color: themes.light.pointColor.Primary}}
          />
          <TimeTitle fontSizeMode={fontSizeMode}>{item.name}</TimeTitle>
        </TitleContainer>
        <TimeText fontSizeMode={fontSizeMode}>
          {dayjs(`2024-01-01T${item.take_time}`)
            .format('A h:mm')
            .replace('AM', '오전')
            .replace('PM', '오후')}
        </TimeText>
      </MedicineHeader>

      <ContentContainer>
        {/* 상단 그라데이션 */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.8)',
            'rgba(0, 0, 0, 0)'
          ]}
          start={{ x: 0, y: 0 }}  // 위쪽 시작
          end={{ x: 0, y: 1 }}    // 아래쪽으로 흐름
          locations={[0, 1]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            zIndex: 10,
          }}
        />
        {/* 하단 그라데이션 */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          locations={[0, 1]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 10,
            zIndex: 10,
          }}
        />
        <ScrollView
          style={{maxHeight: 120}}
          contentContainerStyle={{paddingTop: 5, gap: 10}}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>
          {item.routine_dtos.map(medicine => (
            <MedicineItem key={medicine.routine_id}>
              {medicine.is_taken ? <FilledCircle /> : <EmptyCircle />}
              <MedicineText fontSizeMode={fontSizeMode}>
                {medicine.nickname} {medicine.dose}정
              </MedicineText>
            </MedicineItem>
          ))}
        </ScrollView>
      </ContentContainer>
    </RoutineContainer>
  );

  return (
    <FlatList
      data={routineSchedules}
      renderItem={renderRoutineItem}
      keyExtractor={item => item.user_schedule_id.toString()}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 15,
      }}
      style={{backgroundColor: 'transparent'}}
    />
  );
};

const FilledCircle = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 6px;
  background-color: ${themes.light.textColor.buttonText};
`;

const EmptyCircle = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 6px;
  border-width: 1.5px;
  border-color: ${themes.light.boxColor.buttonSecondary40};
`;

const ContentContainer = styled.View`
  position: relative;
  flex: 1;
`;

const RoutineContainer = styled.View`
  background-color: ${themes.light.boxColor.buttonPrimary};
  width: 190px;
  height: 220px;
  border-radius: 10px;
  padding: 20px;
  justify-content: flex-start;
  gap: 5px;
`;

const MedicineHeader = styled.View`
  gap: 6px;
`;

const TitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const TimeTitle = styled.Text`
  color: ${themes.light.textColor.buttonText};
  font-family: 'KimjungchulGothic-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
`;

const TimeText = styled.Text`
  color: ${themes.light.textColor.buttonText};
  font-family: 'Pretendard-Regular';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
`;

const MedicineItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 9px;
`;

const MedicineText = styled.Text`
  color: ${themes.light.textColor.buttonText};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  width: 90%;
`;

export default HomeRoutine;