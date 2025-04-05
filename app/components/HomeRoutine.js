import React, { useState, useEffect } from 'react';
import { FlatList, View } from 'react-native';
import styled from 'styled-components/native';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { RoutineIcons } from '../../assets/icons';
import dayjs from 'dayjs';
import { ScrollView } from 'react-native-gesture-handler';

const HomeRoutine = ({ schedules }) => {
    const [routineSchedules, setRoutineSchedules] = useState([]);

    useEffect(() => {
        // 약이 있는 스케줄만 필터링
        const medicineSchedules = schedules.filter(schedule => 
            schedule.routine_medicine_dtos.length > 0
        );
        setRoutineSchedules(medicineSchedules);
    }, [schedules]);

    const renderRoutineItem = ({ item }) => (
        <RoutineContainer>
            <MedicineHeader>
                <TitleContainer>
                    <RoutineIcons.medicine 
                        width={15} 
                        height={15} 
                        style={{color: themes.light.pointColor.Primary}}
                    />
                    <TimeTitle>{item.name}</TimeTitle>
                </TitleContainer>
                <TimeText>
                    {dayjs(`2024-01-01T${item.take_time}`).format('A h:mm')
                        .replace('AM', '오전')
                        .replace('PM', '오후')}
                </TimeText>
            </MedicineHeader>
            <ScrollView 
                style={{ marginTop: 10 }} 
                contentContainerStyle={{ gap: 10 }} 
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
            >
                {item.routine_medicine_dtos.map((medicine) => (
                    <MedicineItem key={medicine.routine_medicine_id}>
                        {medicine.is_taken ? <FilledCircle /> : <EmptyCircle />}
                        <MedicineText>
                            {medicine.nickname} {medicine.dose}정
                        </MedicineText>
                    </MedicineItem>
                ))}
            </ScrollView>
        </RoutineContainer>
    );

    return (
        <FlatList
            data={routineSchedules}
            renderItem={renderRoutineItem}
            keyExtractor={(item) => item.user_schedule_id.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
                paddingHorizontal: 20,
                gap: 15
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

const RoutineContainer = styled.View`
    background-color: ${themes.light.boxColor.buttonPrimary};
    width: 190px;
    height: 220px;
    border-radius: 10px;
    padding: 20px;
    justify-content: space-between;
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
    font-size: ${FontSizes.title.default};
`;

const TimeText = styled.Text`
    color: ${themes.light.textColor.buttonText};
    font-family: 'Pretendard-Regular';
    font-size: ${FontSizes.body.default};
`;

const MedicineList = styled.View`
    margin-top: 10px;
    gap: 10px;
`;

const MedicineItem = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 9px;
`;

const MedicineText = styled.Text`
    color: ${themes.light.textColor.buttonText};
    font-family: 'Pretendard-Medium';
    font-size: ${FontSizes.body.default};
    width: 90%;
`;

export default HomeRoutine;