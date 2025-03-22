import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView, Platform } from 'react-native';
import { themes } from './../../styles';
import { HeaderIcons, OtherIcons } from '../../../assets/icons';
import { ModalHeader, ProgressBar } from '../../components';
import { SelectTimeButton, Button } from '../../components/Button';
import FontSizes from '../../../assets/fonts/fontSizes';

import { getUserSchedule } from '../../api/user';

const SetMedicineTime = ({ route, navigation }) => {
    const { medicine_id, nickname, day_of_weeks } = route.params;
    console.log("day_of_weeks:", day_of_weeks);

    const progress = '60%';
    
    // 여러 시간대 선택을 위해 배열로 변경
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [scheduleData, setScheduleData] = useState([]);

    // 시간대와 ID 매핑
    const scheduleMapping = {
        '🐥️ 아침': 1,
        '🥪️ 점심': 2,
        '🌙️ 저녁': 3,
        '🛏️️ 자기 전': 4
    };

    const handleSelect = (option) => {
        setSelectedOptions(prev => {
            // 이미 선택된 옵션인 경우 제거, 아니면 추가
            if (prev.includes(option)) {
                return prev.filter(item => item !== option);
            } else {
                return [...prev, option];
            }
        });
    };

    const handleNext = () => {
        // 선택된 시간대를 ID로 변환
        const user_schedule_ids = selectedOptions.map(option => scheduleMapping[option]);
        
        navigation.navigate('SetMedicineDose', {
            medicine_id: medicine_id,
            nickname: nickname,
            day_of_weeks: day_of_weeks,
            user_schedule_ids: user_schedule_ids
        });
    };

    const handleSetTimings = () => {
        navigation.navigate('SetRoutineTime');
    };

    // 시간 변환 함수
    const formatTime = (timeString) => {
        const [hour, minute] = timeString.split(':').map(Number);
        const period = hour < 12 ? '오전' : '오후';
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        
        return minute === 0 
            ? `${period} ${formattedHour}시`
            : `${period} ${formattedHour}시 ${minute}분`;
    };
    
    useEffect(() => {
        async function fetchUserSchedule() {
            try {
                const getData = await getUserSchedule();
                const formattedSchedule = {};

                getData.data.body.forEach((item) => {
                    formattedSchedule[item.name] = formatTime(item.take_time);
                });

                setScheduleData(formattedSchedule);
            } catch (error) {
                console.error('스케줄 데이터 가져오기 실패:', error);
            }
        }

        fetchUserSchedule();
    }, []);

    return (
        <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ModalHeader showDelete="true" onDeletePress={() => { }}>
                루틴 추가
            </ModalHeader>
            <ProgressBar progress={progress} />
            <ScrollView>
                <View>
                    <TextContainer>
                        <LargeText>이 약은 하루중 언제 복용하나요?</LargeText>
                        <SmallText>복약 시간을 놓치지 않도록 도와드릴게요!</SmallText>
                    </TextContainer>
                    
                    <SelectTime>
                        <SelectTimeButton
                            title={'🐥️ 아침'}
                            timeText={scheduleData['아침 식사 후'] || '오전 7시'}
                            onPress={() => handleSelect('🐥️ 아침')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOptions.includes('🐥️ 아침') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOptions.includes('🐥️ 아침') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                        <SelectTimeButton
                            title={'🥪️ 점심'}
                            timeText={scheduleData['점심 식사 후'] || '오후 12시'}
                            onPress={() => handleSelect('🥪️ 점심')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOptions.includes('🥪️ 점심') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOptions.includes('🥪️ 점심') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                        <SelectTimeButton
                            title={'🌙️ 저녁'}
                            timeText={scheduleData['저녁 식사 후'] || '오후 7시'}
                            onPress={() => handleSelect('🌙️ 저녁')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOptions.includes('🌙️ 저녁') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOptions.includes('🌙️ 저녁') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                        <SelectTimeButton
                            title={'🛏️️ 자기 전'}
                            timeText={'오후 10시 30분'}
                            onPress={() => handleSelect('🛏️️ 자기 전')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOptions.includes('🛏️️ 자기 전') ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOptions.includes('🛏️️ 자기 전') ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                    </SelectTime>
                    
                    <TimeSettingButton onPress={handleSetTimings}>
                        <ButtonText>시간대 설정하기</ButtonText>
                        <OtherIcons.chevronDown
                            width={10}
                            height={10}
                            style={{
                                color: themes.light.textColor.Primary20,
                                transform: [{ rotate: '-90deg' }],
                            }}
                        />
                    </TimeSettingButton>
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
                    disabled={selectedOptions.length === 0}
                    bgColor={selectedOptions.length > 0 ? themes.light.boxColor.buttonPrimary : themes.light.boxColor.inputSecondary}
                    textColor={selectedOptions.length > 0 ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
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

const SelectTime = styled.View`
    padding: 0 20px;
    gap: 10px;
`;

const TimeSettingButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 20px;
    gap: 10px;
`;

const ButtonText = styled.Text`
    font-family: 'Pretendard-Medium';
    font-size: ${FontSizes.body.default};
    color: ${themes.light.textColor.Primary30};
`;

export default SetMedicineTime;