import React, { useState } from 'react';
import styled from 'styled-components/native';
import {Alert, View} from 'react-native';
import {Header, InputWithDelete, Button} from '../../components';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import { registerCareReceiver } from '../../api/userCare';
import { navigate } from '../Navigation/NavigationRef';
import { useNavigation } from '@react-navigation/native';

const AddCareTarget = () => {
  const {fontSizeMode} = useFontSize();
  const [authCode, setAuthCode] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!authCode.trim()) {
      Alert.alert('인증번호를 입력해주세요.');
      return;
    }
     console.log('전송할 auth_code:', authCode);

    try {
      const response = await registerCareReceiver({ auth_code: authCode.trim()});
      console.log('등록 성공:', response.data);
      Alert.alert(
      '등록 완료',
      '관리 대상이 성공적으로 등록되었습니다.',
      [{ text: '확인', onPress: () => navigation.goBack() }]
    );
    } catch (error) {
      console.error('등록 실패:', error);
      Alert.alert('등록에 실패했습니다. 인증번호를 확인해주세요.');
    }
  };

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
        <InputWithDelete
          placeholder="인증번호 입력"
          value={authCode}
          onChangeText={setAuthCode}
        />
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
        <Button title='확인' onPress={handleRegister}/>
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