import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView } from 'react-native';
import { themes } from './../../styles';
import { OtherIcons } from '../../../assets/icons';
import { ModalHeader, Button, ProgressBar, BackAndNextButtons } from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';

const SetMedicineDay = ({ route, navigation }) => {
    const { medicine_id, nickname } = route.params;
    console.log("medicine_id:", medicine_id);
    console.log("nickname:", nickname);
    const progress = '40%';

    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);

    const handleSelect = (option) => {
        setSelectedOption((prev) => (prev === option ? null : option));
    };

    const handleNext = () => {
        let day_of_weeks = [];
        
        // 선택된 옵션에 따라 day_of_weeks 설정
        if (selectedOption === '매일') {
            // 매일: 월화수목금토일 (1,2,3,4,5,6,7)
            day_of_weeks = [1, 2, 3, 4, 5, 6, 7];
        } else if (selectedOption === '특정 요일') {
            // 특정 요일: 화,목,토 (2,4,6) 예시
            day_of_weeks = [2, 4, 6];

        } else if (selectedOption === '주기 설정') {
            // 2일 간격: 월수금일 (1,3,5,7) 예시
            day_of_weeks = [1, 3, 5, 7];
        }
        
        // 다음 화면으로 필요한 데이터 전달
        navigation.navigate('SetMedicineTime', {
            medicine_id: medicine_id,
            nickname: nickname,
            day_of_weeks: day_of_weeks,
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
                                title={'특정 요일마다 (예: 화, 목, 토)'} 
                                onPress={() => handleSelect('특정 요일')} 
                                fontFamily={'Pretendard-SemiBold'}
                                bgColor={selectedOption === '특정 요일' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                                textColor={selectedOption === '특정 요일' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                                fontSize={FontSizes.body.default} 
                            />
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
                <Button title="다음" onPress={handleNext} />
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
export default SetMedicineDay;
