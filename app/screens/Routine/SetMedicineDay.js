import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader, Button, ProgressBar } from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';

const DAYS = [
    { id: 1, label: '월' },
    { id: 2, label: '화' },
    { id: 3, label: '수' },
    { id: 4, label: '목' },
    { id: 5, label: '금' },
    { id: 6, label: '토' },
    { id: 7, label: '일' },
];

const SetMedicineDay = ({ route, navigation }) => {
    const { medicine_id, nickname } = route.params;
    console.log("medicine_id:", medicine_id);
    console.log("nickname:", nickname);
    const progress = '33.33%';

    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);

    const handleSelect = (option) => {
        setSelectedOption((prev) => (prev === option ? null : option));
        if (option !== '특정 요일') setSelectedDays([]);
    };

    const toggleDay = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleNext = () => {
        let day_of_weeks = [];

        if (selectedOption === '매일') {
            day_of_weeks = [1, 2, 3, 4, 5, 6, 7];
        } else if (selectedOption === '특정 요일') {
            day_of_weeks = selectedDays;
        } else if (selectedOption === '주기 설정') {
            day_of_weeks = [1, 3, 5, 7];
        }

        navigation.navigate('SetMedicineStartDay', {
            medicine_id,
            nickname,
            day_of_weeks,
        });
    };

    return (
        <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ModalHeader showDelete="true" onDeletePress={() => { }}>
                루틴 추가
            </ModalHeader>
            <ProgressBar progress={progress} />
            <ScrollView>
                <View>
                    <TextContainer>
                        <LargeText>며칠 주기로 복용하는 약인가요?</LargeText>
                        <SmallText>일정에 맞춰 복약 알림을 보내드릴게요!</SmallText>
                    </TextContainer>
                    {/* 별명 */}
                    <SelectDay>
                        <Button
                            title={'매일'}
                            onPress={() => handleSelect('매일')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOption === '매일' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOption === '매일' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                        <Button
                            title={'특정 요일마다 (예: 월, 수, 금)'}
                            onPress={() => handleSelect('특정 요일')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOption === '특정 요일' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOption === '특정 요일' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                        {selectedOption === '특정 요일' && (
                            <DaySelection>
                                {DAYS.map((day) => (
                                    <DayButton key={day.id} selected={selectedDays.includes(day.id)} onPress={() => toggleDay(day.id)}>
                                        <DayText selected={selectedDays.includes(day.id)}>{day.label}</DayText>
                                    </DayButton>
                                ))}
                            </DaySelection>
                        )}
                        <Button
                            title={'주기 설정 (예: 2일 간격으로)'}
                            onPress={() => handleSelect('주기 설정')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOption === '주기 설정' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOption === '주기 설정' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                    </SelectDay>
                </View>
            </ScrollView>

            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingBottom: 30,
                    alignItems: 'center',
                }}>
                <Button
                    title="다음"
                    onPress={handleNext}
                    disabled={!selectedOption || (selectedOption === '특정 요일' && selectedDays.length === 0)}
                    bgColor={selectedOption && (selectedOption !== '특정 요일' || selectedDays.length > 0) ? themes.light.boxColor.buttonPrimary : themes.light.boxColor.inputSecondary}
                    textColor={selectedOption && (selectedOption !== '특정 요일' || selectedDays.length > 0) ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                />
            </View>
        </Container>
    );
};

const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const TextContainer = styled.View`
    padding: 35px 30px;
    gap: 10px;
`;

const LargeText = styled.Text`
    font-size: ${FontSizes.title.default};
    font-family: ${'KimjungchulGothic-Bold'};
    color: ${themes.light.textColor.textPrimary};
`;
const SmallText = styled.Text`
    font-size: ${FontSizes.body.default};
    font-family: ${'Pretendard-Midium'};
    color: ${themes.light.textColor.Primary50};
`;

const SelectDay = styled.TouchableOpacity`
    padding: 0 20px;
    gap: 10px;
`;

const DaySelection = styled.View`
    flex-direction: row;
    gap: 10px;
    justify-content: center;
`;

const DayButton = styled.TouchableOpacity`
    background-color: ${(props) => (props.selected ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary)};
    padding: 8px 10px;
    border-radius: 5px;
`;

const DayText = styled.Text`
    color: ${(props) => (props.selected ? themes.light.textColor.buttonText : themes.light.textColor.Primary30)};
    font-size: ${FontSizes.body.default};
    font-family: 'Pretendard-SemiBold';
`;

export default SetMedicineDay;
