import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { RoutineIcons } from '../../assets/icons';
import dayjs from 'dayjs';

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
        <Routine>
            <RoutineContainer>
                <TitleContainer>
                    <RoutineIcons.medicine 
                        width={15} 
                        height={15} 
                        style={{color: themes.light.pointColor.Primary}}
                    />
                    <TimeTitle>{item.name}</TimeTitle>
                </TitleContainer>
                <TimeText>
                    {dayjs(`2024-01-01T${item.take_time}`).format('A h:m')
                        .replace('AM', '오전')
                        .replace('PM', '오후')}
                </TimeText>
                <MedicineList>
                    {item.routine_medicine_dtos.map((medicine) => (
                        <MedicineText key={medicine.routine_medicine_id}>
                            {medicine.nickname} {medicine.dose}정
                        </MedicineText>
                    ))}
                </MedicineList>
            </RoutineContainer>
        </Routine>
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
                gap: 10 
            }}
        />
    );
};

const Routine = styled.View`
    margin-right: 10px;
`;

const RoutineContainer = styled.View`
    background-color: ${themes.light.boxColor.buttonPrimary};
    width: 190px;
    height: 220px;
    border-radius: 10px;
    padding: 20px;
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
    margin-top: 10px;
`;

const MedicineList = styled.View`
    margin-top: 10px;
`;

const MedicineText = styled.Text`
    color: ${themes.light.textColor.buttonText};
    font-family: 'Pretendard-Medium';
    font-size: ${FontSizes.body.default};
    margin-bottom: 5px;
`;

export default HomeRoutine;