import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';

export const CameraSearchPlaceholder = () => {
  return (
    <Container>
      <ImagePlaceholder />
      <Row>
        <TagPlaceholder />
        <TagPlaceholder />
      </Row>
      <NamePlaceholder />
      <InfoPlaceholder />
    </Container>
  );
};

const Container = styled.View`
  padding: 0 20px;
  margin-bottom: 32px;
`;

const ImagePlaceholder = styled.View`
  width: 100%;
  height: 180px;
  background-color: ${themes.light.boxColor.placeholder};
  border-radius: 12px;
  margin-bottom: 16px;
`;

const Row = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
`;

const TagPlaceholder = styled.View`
  width: 70px;
  height: 22px;
  background-color: ${themes.light.boxColor.placeholder};
  border-radius: 6px;
`;

const NamePlaceholder = styled.View`
  width: 60%;
  height: 20px;
  background-color: ${themes.light.boxColor.placeholder};
  border-radius: 6px;
  margin-bottom: 10px;
`;

const InfoPlaceholder = styled.View`
  width: 40%;
  height: 16px;
  background-color: ${themes.light.boxColor.placeholder};
  border-radius: 6px;
`;
