import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { themes } from './../../styles';
import { ModalHeader, Button } from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useNavigation } from '@react-navigation/native';

const SetRoutineTime = () => {
  const navigation = useNavigation();

  return (
    <Container>
      <ModalHeader 
        showDelete='true' 
        onDeletePress={() => {}}
      >루틴 설정</ModalHeader>
      
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
        }}
      >
        <Button title="닫기" onPress={() => navigation.goBack()} />
      </View>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

export default SetRoutineTime;