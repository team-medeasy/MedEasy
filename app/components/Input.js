import React, { useState } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { OtherIcons } from '../../assets/icons';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { useFontSize } from '../../assets/fonts/FontSizeContext';

// 삭제 버튼이 있는 입력창 - 향상된 버전
export const InputWithDelete = ({
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    style,
    autoCapitalize = 'none',
    secureTextEntry = false,
    onBlur,
    onFocus,
    returnKeyType = 'done',
    onSubmitEditing,
    autoComplete,
    autoCorrect,
    spellCheck,
    blurOnSubmit,
    editable = true,
    maxLength,
    multiline = false,
    numberOfLines,
    textContentType,
    showPasswordToggle = false, // 비밀번호 토글 표시 여부
    ...otherProps
}) => {
    const { fontSizeMode } = useFontSize();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    // 비밀번호 토글 기능이 있을 때는 secureTextEntry를 상태로 관리
    const actualSecureTextEntry = showPasswordToggle ? !isPasswordVisible : secureTextEntry;
    
    return (
        <InputContainer style={style}>
            <StyledInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                returnKeyType={returnKeyType}
                autoCapitalize={autoCapitalize}
                secureTextEntry={actualSecureTextEntry}
                fontSizeMode={fontSizeMode}
                placeholderTextColor={themes.light.textColor.Primary40}
                onBlur={onBlur}
                onFocus={onFocus}
                onSubmitEditing={onSubmitEditing}
                autoComplete={autoComplete}
                autoCorrect={autoCorrect}
                spellCheck={spellCheck}
                blurOnSubmit={blurOnSubmit}
                editable={editable}
                maxLength={maxLength}
                multiline={multiline}
                numberOfLines={numberOfLines}
                textContentType={textContentType}
                {...otherProps}
            />
            {/* 디버깅: 비밀번호 토글 항상 표시 */}
            {showPasswordToggle && (
                <PasswordToggleButton onPress={() => {
                    console.log('토글 버튼 클릭됨', isPasswordVisible);
                    setIsPasswordVisible(!isPasswordVisible);
                }}>
                    <PasswordToggleText>
                        {isPasswordVisible ? '숨기기' : '보기'}
                    </PasswordToggleText>
                </PasswordToggleButton>
            )}
            
            {/* 삭제 버튼 */}
            {!showPasswordToggle && value && value.length > 0 && (
                <DeleteButton onPress={() => onChangeText('')}>
                    <OtherIcons.deleteCircle
                        width={15}
                        height={15}
                        style={{color: themes.light.textColor.Primary20}}
                    />
                </DeleteButton>
            )}
        </InputContainer>
    )
};
  
// 읽기 전용 입력창
export const ReadOnlyInput = ({ text }) => {
    const { fontSizeMode } = useFontSize();
    
    return (
      <InputContainer>
        <LabelText numberOfLines={1} fontSizeMode={fontSizeMode}>{text}</LabelText>
      </InputContainer>
    );
};

const InputContainer = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${themes.light.boxColor.inputPrimary};
    border-radius: 10px;
    padding: 0 5px 0 20px;
`;

const StyledInput = styled.TextInput`
    flex: 1;
    padding: 18px 0;
    font-family: 'Pretendard-SemiBold';
    font-size: ${props => 
        props.fontSizeMode ? `${FontSizes.body[props.fontSizeMode]}` : FontSizes.body.default};
    color: ${themes.light.textColor.textPrimary};
`;

const DeleteButton = styled.TouchableOpacity`
    padding: 15px;
`;

const PasswordToggleButton = styled.TouchableOpacity`
    padding: 15px 10px;
    background-color: transparent;
    justify-content: center;
    align-items: center;
`;

const PasswordToggleText = styled.Text`
    color: ${themes.light.textColor.placeholder};
    font-size: 14px;
    font-family: 'Pretendard-Medium';
    text-align: center;
`;

const LabelText = styled.Text`
    flex: 1;
    padding: 18px 0;
    font-family: 'Pretendard-SemiBold';
    font-size: ${props => 
        props.fontSizeMode ? `${FontSizes.body[props.fontSizeMode]}` : FontSizes.body.default};
    color: ${themes.light.textColor.textPrimary};
`;