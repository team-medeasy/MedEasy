import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView } from 'react-native';
import { themes } from './../../styles';
import { HeaderIcons, OtherIcons } from '../../../assets/icons';
import { ModalHeader, ProgressBar } from '../../components';
import { SelectTimeButton, Button } from '../../components/Button';
import FontSizes from '../../../assets/fonts/fontSizes';
import { createRoutine } from '../../api/routine';

const SetMedicineTime = ({ route, navigation }) => {
    const progress = '60%';
    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelect = (option) => {
        setSelectedOption((prev) => (prev === option ? null : option));
    };


    const handleNext = () => {
        navigation.navigate('SetMedicineDose');
    };

    const handleSetTimings = () => {
        navigation.navigate('SetRoutineTime');
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
                        <LargeText>이 약은 하루중 언제 복용하나요?</LargeText>
                        <SmallText>복약 시간을 놓치지 않도록 도와드릴게요!</SmallText>
                    </TextContainer>
                    {/* 별명 */}
                    <SelectTime>
                        <SelectTimeButton
                            title={'🐥️ 아침'}
                            timeText={'오전 7시'}
                            onPress={() => handleSelect('🐥️ 아침')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOption === '🐥️ 아침' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOption === '🐥️ 아침' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                        <SelectTimeButton
                            title={'🥪️ 점심'}
                            timeText={'오후 12시'}
                            onPress={() => handleSelect('🥪️ 점심')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOption === '🥪️ 점심' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOption === '🥪️ 점심' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                        <SelectTimeButton
                            title={'🌙️ 저녁'}
                            timeText={'오후 7시'}
                            onPress={() => handleSelect('🌙️ 저녁')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOption === '🌙️ 저녁' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOption === '🌙️ 저녁' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                        <SelectTimeButton
                            title={'🛏️️ 자기 전'}
                            timeText={'오후 10시 30분'}
                            onPress={() => handleSelect('🛏️️ 자기 전')}
                            fontFamily={'Pretendard-SemiBold'}
                            bgColor={selectedOption === '🛏️️ 자기 전' ? themes.light.pointColor.Primary : themes.light.boxColor.inputSecondary}
                            textColor={selectedOption === '🛏️️ 자기 전' ? themes.light.textColor.buttonText : themes.light.textColor.Primary30}
                            fontSize={FontSizes.body.default}
                        />
                    </SelectTime>
                    {/* 시간대 설정하기 버튼 추가 */}
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
                <Button title="다음" onPress={handleNext} />
            </View>
        </Container>
    );
};

// 입력 필드 컴포넌트
const InputWithDelete = ({
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
}) => {
    return (
        <InputContainer>
            <StyledInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
            />
            {value.length > 0 && (
                <DeleteButton onPress={() => onChangeText('')}>
                    <OtherIcons.deleteCircle
                        width={15}
                        height={15}
                        style={{ color: themes.light.textColor.Primary20 }}
                    />
                </DeleteButton>
            )}
        </InputContainer>
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

const SelectTime = styled.TouchableOpacity`
    padding: 0 20px;
    gap: 10px;
`;
const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${themes.light.boxColor.inputPrimary};
  border-radius: 10px;
  padding: 0 15px;
`;

const StyledInput = styled.TextInput`
  flex: 1;
  padding: 18px 0;
  font-family: 'Pretendard-SemiBold';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.textPrimary};
`;

const DeleteButton = styled.TouchableOpacity`
  padding: 5px;
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
