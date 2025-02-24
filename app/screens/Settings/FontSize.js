import React from 'react';
import {View, Text} from 'react-native';
import styled from 'styled-components/native';
import {themes} from '../../styles';

const Profile = () => {
  return (
    <Container>
      <Title>글자 크기 설정</Title>
      <Text>글자 크기 설정 내용</Text>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 20px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
  margin-bottom: 20px;
`;

export default Profile;
