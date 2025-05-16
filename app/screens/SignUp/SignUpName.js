import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import styled from 'styled-components/native';
import {themes, fonts} from './../../styles';
import {ProgressBar, BackAndNextButtons} from './../../components';
import {useSignUp} from '../../api/context/SignUpContext';
import FontSizes from '../../../assets/fonts/fontSizes';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const Container1 = styled.View`
  justify-content: center;
  margin-top: 78px;
  margin-left: 30px;
`;

const Container2 = styled.View`
  justify-content: center;
  align-items: center;
  flex-direction: row;
  margin-left: 25px;
  margin-right: 25px;
  margin-top: 37px;
`;

const InputContainer = styled.View`
  flex: 1;
  margin-left: ${props => props.marginLeft || '0px'};
  margin-right: ${props => props.marginRight || '0px'};
`;

const BtnContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 30px;
  align-items: center;
`;

const TextInput = styled.TextInput`
  height: 60px;
  border-radius: 8px;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 20px;
  font-size: ${FontSizes.body.default};
  /* color: ${themes.light.textColor.Primary100 || '#000000'}; */
`;

const SignUpNameScreen = ({navigation}) => {
  const {signUpData, updateSignUpData} = useSignUp();
  const [name, setName] = useState(signUpData.name || '');
  const progress = '25%';
  const secondInput = React.useRef();

  const handleNext = () => {
    if (name) {
      // Context에 상태 저장
      updateSignUpData({name});
      navigation.navigate('SignUpEmail');
    } else {
      alert('성을 포함한 이름을 모두 입력하세요.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <ProgressBar progress={progress} />
        <Container1>
          <Text
            style={{
              fontFamily: fonts.title.fontFamily,
              fontSize: fonts.title.fontSize,
            }}>
            안녕하세요, 메디지입니다 👋
          </Text>
          <Text
            style={{
              fontFamily: 'Pretendard-Medium',
              fontSize: 16,
              marginTop: 7,
              color: themes.light.textColor.Primary50,
            }}>
            이름을 입력해주세요.
          </Text>
        </Container1>
        <Container2>
          <InputContainer marginRight="5px">
            <TextInput
              placeholder="이름"
              placeholderTextColor={themes.light.textColor.placeholder}
              value={name}
              onChangeText={setName}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </InputContainer>
        </Container2>
        <BtnContainer>
          <BackAndNextButtons
            onPressPrev={() => navigation.goBack()}
            onPressNext={handleNext}
          />
        </BtnContainer>
      </Container>
    </TouchableWithoutFeedback>
  );
};
export default SignUpNameScreen;
