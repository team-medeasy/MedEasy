import React from 'react';
import styled from 'styled-components/native';
import {View} from 'react-native';
import {Header, InputWithDelete, Button} from '../../components';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';

const AddCareTarget = () => {
  const {fontSizeMode} = useFontSize();

  return (
    <Container>
      <Header>관리 대상 추가</Header>

      <TextContainer>
        <LargeText fontSizeMode={fontSizeMode}>
          추가할 관리 대상의 인증번호를 입력해주세요.
        </LargeText>
        <SmallText fontSizeMode={fontSizeMode}>
          복약 루틴을 함께 확인하고 알림도 받아보실 수 있어요.
        </SmallText>
      </TextContainer>

      <InputContainer>
        <InputWithDelete/>
      </InputContainer>

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
        <Button title='확인' />
    </View>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const TextContainer = styled.View`
  padding: 35px 30px;
  gap: 10px;
`;

const LargeText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.textPrimary};
`;

const SmallText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

const InputContainer = styled.View`
  padding: 20px;
  gap: 15px;
`;

export default AddCareTarget;