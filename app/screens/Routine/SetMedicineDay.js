import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { View, ScrollView } from 'react-native';
import { themes } from './../../styles';
import { OtherIcons } from '../../../assets/icons';
import { ModalHeader, Button, ProgressBar, BackAndNextButtons } from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import { createRoutine } from '../../api/routine';

const SetMedicineDay = ({ route, navigation }) => {
    const progress = '40%';
    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelect = (option) => {
        setSelectedOption((prev) => (prev === option ? null : option));
    };

    const handleNext = () => {
        navigation.navigate('SetMedicineTime');
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

const SelectDay = styled.TouchableOpacity`
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
export default SetMedicineDay;
