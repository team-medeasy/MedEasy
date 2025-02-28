import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import {Header} from '../../components/\bHeader/Header';

const CameraSearchResultsScreen = () => {

  return (
    <Container>
        <Header>약 검색 결과</Header>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

export default CameraSearchResultsScreen;
