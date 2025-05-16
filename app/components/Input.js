import React from 'react';
import styled from 'styled-components/native';
import { OtherIcons } from '../../assets/icons';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { useFontSize } from '../../assets/fonts/FontSizeContext';

// 삭제 버튼이 있는 입력창
export const InputWithDelete = ({
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    style,
    autoCapitalize = 'none',
    secureTextEntry = false,
}) => {
    const { fontSizeMode } = useFontSize();
    
    return (
        <InputContainer style={style}>
        <StyledInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            returnKeyType="done"
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            fontSizeMode={fontSizeMode}
            placeholderTextColor={themes.light.textColor.Primary40}
        />
        {value && value.length > 0 && (
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

const LabelText = styled.Text`
    flex: 1;
    padding: 18px 0;
    font-family: 'Pretendard-SemiBold';
    font-size: ${props => 
        props.fontSizeMode ? `${FontSizes.body[props.fontSizeMode]}` : FontSizes.body.default};
    color: ${themes.light.textColor.textPrimary};
`;