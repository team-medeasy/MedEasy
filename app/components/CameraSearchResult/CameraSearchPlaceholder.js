import React from 'react';
import styled from 'styled-components/native';
import {Dimensions} from 'react-native';
import ShimmerBox from '../ShimmerBox';

const screenWidth = Dimensions.get('window').width;
const padding = 20;

export const CameraSearchPlaceholder = () => {
  return (
    <Container>
      <ShimmerBox
        width={screenWidth - padding * 2}
        height={180}
        style={{marginBottom: 16, borderRadius: 12}}
      />

      <Row>
        <ShimmerBox width={70} height={22} style={{borderRadius: 6}} />
        <ShimmerBox width={70} height={22} style={{borderRadius: 6}} />
      </Row>

      <ShimmerBox
        width={200}
        height={20}
        style={{marginBottom: 10, borderRadius: 6}}
      />
      <ShimmerBox width={100} height={16} style={{borderRadius: 6}} />
    </Container>
  );
};

const Container = styled.View`
  padding: 0 ${padding}px;
  margin-bottom: 32px;
`;

const Row = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
`;
