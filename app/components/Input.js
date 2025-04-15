import React from 'react';
import styled from 'styled-components/native';
import { OtherIcons } from '../../assets/icons';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';

export const InputWithDelete = ({
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    style,
}) => {
    return (
        <InputContainer style={style}>
        <StyledInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            returnKeyType="done"
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
    padding: 15px;
`;