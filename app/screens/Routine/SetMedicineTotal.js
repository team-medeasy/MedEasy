import React, {useState} from 'react';
import styled from 'styled-components/native';
import {View, ScrollView, Platform} from 'react-native';
import {themes} from './../../styles';
import {
    ModalHeader, 
    ProgressBar, 
    Button, 
    InputWithDelete
} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

import { createRoutine } from '../../api/routine';

const SetMedicineTotal = ({route, navigation}) => {
    const { medicine_id, nickname, routine_start_date, interval_days, user_schedule_ids, dose } = route.params;
    console.log("dose:", dose);
    const progress = '100%';
    const {fontSizeMode} = useFontSize();
    
    const [total, setTotal] = useState('');

    const handleSaveRoutine = () => {
        // 전송할 데이터 구성
        const routineData = {
            medicine_id,
            nickname,
            dose: parseInt(dose),
            total_quantity: parseInt(total),
            user_schedule_ids,
            routine_start_date,
            interval_days: parseInt(interval_days)
        };
        
        // 데이터 콘솔에 출력
        console.log("전송 데이터:", JSON.stringify(routineData, null, 2));
        
        // API 호출
        createRoutine(routineData)
            .then(response => {
                console.log("루틴 생성 성공:", response);
                navigation.getParent().goBack();
            })
            .catch(error => {
                console.error("루틴 생성 실패:", error);
                // 오류 처리
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
                        <LargeText fontSizeMode={fontSizeMode}>
                            약의 총 개수를 알려주세요
                        </LargeText>
                        <SmallText fontSizeMode={fontSizeMode}>
                            메디지가 복용해야 할 약의 개수도 기억해 드릴게요
                        </SmallText>
                    </TextContainer>
                    {/* 총 복용량 입력 */}
                    <Section>
                        <InputWithDelete
                            value={total}
                            onChangeText={(text) => {
                                // 숫자만 입력되도록 처리
                                if (/^\d*$/.test(text)) {
                                    setTotal(text);
                                }
                            }}
                            placeholder="약의 총 개수를 입력하세요"
                            keyboardType="numeric"
                        />
                    </Section>
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
                    title="저장하기" 
                    onPress={handleSaveRoutine}
                    disabled={!total}
                    bgColor={total ? themes.light.boxColor.buttonPrimary : themes.light.boxColor.inputSecondary}
                    textColor={total ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
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
    font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
    font-family: ${'KimjungchulGothic-Bold'};
    color: ${themes.light.textColor.textPrimary};
`;
const SmallText = styled.Text`
    font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
    font-family: ${'Pretendard-Midium'};
    color: ${themes.light.textColor.Primary50};
`;

const Section = styled.View`
    padding: 0 20px;
`;

export default SetMedicineTotal;