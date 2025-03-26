import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { RoutineIcons } from '../../assets/icons';

const HomeRoutine = () => {
    return (
        <Container>
            <RoutineContainer>
                <TitleContainer>
                    <RoutineIcons.medicine width={15} height={15} style={{color: themes.light.pointColor.Primary}}/>
                    <TimeTitle>
                        복용 시간대
                    </TimeTitle>
                </TitleContainer>
                <TimeText>
                    복용시간
                </TimeText>
                <MedicineList>
                    <MedicineText>
                        약 이름
                    </MedicineText>
                </MedicineList>
            </RoutineContainer>
        </Container>
    );
};

const Container = styled.View`
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
    font-family: 'Pretendard-Medium';
    font-size: ${FontSizes.body.default};
`;

const MedicineList = styled.View`
    
`;

const MedicineText = styled.Text`
    color: ${themes.light.textColor.buttonText};
    font-family: 'Pretendard-Medium';
    font-size: ${FontSizes.body.default};
`;

export default HomeRoutine;