import React from 'react';
import styled from 'styled-components/native';

const Routine = () => {
  return (
    <Container>
      <Title>루틴</Title>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: white;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: black;
`;

export default Routine;


