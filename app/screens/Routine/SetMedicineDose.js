import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {
    View, 
    ScrollView,
    Platform
} from 'react-native';
import {themes} from './../../styles';
import {
    ModalHeader, 
    ProgressBar, 
    Button, 
    InputWithDelete
} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const SetMedicineDose = ({route, navigation}) => {
    const { medicine_id, nickname, routine_start_date, interval_days, user_schedule_ids } = route.params;
    console.log("user_schedule_ids:", user_schedule_ids);
    const progress = '83.33%';
    const {fontSizeMode} = useFontSize();

    const [dose, setDose] = useState('1'); // 기본값 1로 설정

    const handleNext = () => {
        navigation.navigate('SetMedicineTotal', {
            medicine_id: medicine_id,
            nickname: nickname,
            routine_start_date: routine_start_date,
            user_schedule_ids: user_schedule_ids,
            interval_days: parseInt(interval_days),
            dose: parseInt(dose) || 1
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
                            1회 복용량을 알려주세요
                        </LargeText>
                        <SmallText fontSizeMode={fontSizeMode}>
                            메디지가 복용해야 할 약의 개수도 기억해 드릴게요
                        </SmallText>
                    </TextContainer>
                    {/* 복용량 입력 */}
                    <Section>
                        <InputWithDelete
                            value={dose}
                            onChangeText={(text) => {
                                // 숫자만 입력되도록 처리
                                if (/^\d*$/.test(text)) {
                                    setDose(text);
                                }
                            }}
                            placeholder="복용량을 입력하세요"
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
                    title="다음" 
                    onPress={handleNext} 
                    disabled={dose.trim() === ''}
                    bgColor={dose.trim() != '' ? themes.light.boxColor.buttonPrimary : themes.light.boxColor.inputSecondary}
                    textColor={dose.trim() != '' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
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
    font-family: ${'Pretendard-Medium'};
    color: ${themes.light.textColor.Primary50};
`;

const Section = styled.View`
    padding: 0 20px;
`;

export default SetMedicineDose;