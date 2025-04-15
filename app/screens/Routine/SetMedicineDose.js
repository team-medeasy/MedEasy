import React, {useState} from 'react';
import styled from 'styled-components/native';
import {
    View, 
    ScrollView,
} from 'react-native';
import {themes} from './../../styles';
import {
    ModalHeader, 
    ProgressBar, 
    Button, 
    InputWithDelete
} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';

const SetMedicineDose = ({route, navigation}) => {
    const { medicine_id, nickname, day_of_weeks, user_schedule_ids } = route.params;
    console.log("user_schedule_ids:",user_schedule_ids);
    const [dose, setDose] = useState('');
    const progress = '80%';

    const handleNext = () => {
        navigation.navigate('SetMedicineTotal', {
            medicine_id: medicine_id,
            nickname: nickname,
            day_of_weeks: day_of_weeks,
            user_schedule_ids: user_schedule_ids,
            dose: parseInt(dose) || 1 // 기본값 1 설정
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
                        <LargeText>1회 복용량을 알려주세요</LargeText>
                        <SmallText>메디지가 복용해야 할 약의 개수도 기억해 드릴게요</SmallText>
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

const Section = styled.View`
    padding: 0 20px;
`;

export default SetMedicineDose;
