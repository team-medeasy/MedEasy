import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Platform } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader, Button, ProgressBar } from '../../components';
import { DateTimePickerModal } from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';

const SetMedicineStartDay = ({ route, navigation }) => {
    const { medicine_id, nickname, day_of_weeks } = route.params;

    console.log("day_of_weeks:", day_of_weeks);
    
    const progress = '50%';
    const [startDate, setStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false); 
    
    const handleDateChange = (value) => {
        let dateObj;
    
        if (value && typeof value === 'object' && value.date) {
            dateObj = new Date(value.date);
        } else if (typeof value === 'string') {
            dateObj = new Date(value);
        } else {
            dateObj = value;
        }
    
        if (!isNaN(dateObj)) {
            setStartDate(dateObj);
        }
    };
    
    
    // 모달 확인 버튼 핸들러
    const handleConfirm = () => {
        setShowDatePicker(false);
    };
    
    const handleNext = () => {
        navigation.navigate('SetMedicineTime', {
            medicine_id,
            nickname,
            day_of_weeks,
            routine_start_date: formatDate(startDate), // YYYY-MM-DD 형식
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
                    </DateSection>
                </View>
            </ScrollView>
            
            {/* DateTimePickerModal 컴포넌트 사용 */}
            <DateTimePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onConfirm={handleConfirm}
                mode="date"
                date={startDate}
                onChange={handleDateChange}
                title="복용 시작일"
            />
            
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

// 스타일 컴포넌트들은 그대로 유지
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