import React from 'react';
import {View, Text} from 'react-native';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';

const Profile = () => {
  return (
    <Container>
      <Title>자주 있는 질문</Title>
      <Text>자주 있는 질문 내용</Text>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 20px;
`;

const Title = styled.Text`
  font-size: ${FontSizes.title.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
  margin-bottom: 20px;
`;

export default Profile;
