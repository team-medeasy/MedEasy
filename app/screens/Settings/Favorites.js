import React from 'react';
import {View, Text} from 'react-native';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { Header } from '../../components';

const Profile = () => {
  return (
    <Container>
      <Header>관심 목록</Header>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

export default Profile;
