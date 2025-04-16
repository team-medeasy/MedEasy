import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Platform } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader, Button, ProgressBar } from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import DateTimePicker from '@react-native-community/datetimepicker';

const SetMedicineStartDay = ({ route, navigation }) => {
    const { medicine_id, nickname, day_of_weeks } = route.params;

    console.log("day_of_weeks:", day_of_weeks);
    
    const progress = '50%';
    const [startDate, setStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        setShowDatePicker(Platform.OS === 'ios');
        setStartDate(currentDate);
    };
    
    const handleNext = () => {
        navigation.navigate('SetMedicineTime', {
            medicine_id,
            nickname,
            day_of_weeks,
            routine_start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
        });
    };
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}년 ${month}월 ${day}일`;
    };
    
    return (
        <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ModalHeader showDelete="true" onDeletePress={() => {}}>
                루틴 추가
            </ModalHeader>
            <ProgressBar progress={progress} />
            <ScrollView>
                <View>
                    <TextContainer>
                        <LargeText>복용 시작일을 설정해주세요</LargeText>
                        <SmallText>언제부터 약을 복용하기 시작하나요?</SmallText>
                    </TextContainer>
                    
                    <DateSection>
                        <DateButton onPress={() => setShowDatePicker(true)}>
                            <DateText>{formatDate(startDate)}</DateText>
                        </DateButton>
                        
                        {showDatePicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                minimumDate={new Date()} // 오늘 이전 날짜는 선택 불가
                            />
                        )}
                    </DateSection>
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
                    bgColor={themes.light.boxColor.buttonPrimary}
                    textColor={themes.light.textColor.buttonText}
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

const DateSection = styled.View`
    padding: 0 20px;
    align-items: center;
`;

const DateButton = styled.TouchableOpacity`
    background-color: ${themes.light.boxColor.inputSecondary};
    padding: 15px 20px;
    border-radius: 10px;
    width: 90%;
    align-items: center;
`;

const DateText = styled.Text`
    font-size: ${FontSizes.body.large};
    font-family: 'Pretendard-SemiBold';
    color: ${themes.light.textColor.Primary30};
`;

export default SetMedicineStartDay;