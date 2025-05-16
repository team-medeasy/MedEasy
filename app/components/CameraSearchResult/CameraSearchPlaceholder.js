import React from 'react';
import styled from 'styled-components/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {themes} from '../../styles';
import {Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const padding = 20;

export const CameraSearchPlaceholder = () => {
  return (
    <Container>
      <Shimmer
        width={screenWidth - padding * 2}
        height={180}
        style={{marginBottom: 16, borderRadius: 12}}
      />

      <Row>
        <Shimmer width={70} height={22} style={{borderRadius: 6}} />
        <Shimmer width={70} height={22} style={{borderRadius: 6}} />
      </Row>

      <Shimmer
        width={200}
        height={20}
        style={{marginBottom: 10, borderRadius: 6}}
      />
      <Shimmer width={100} height={16} style={{borderRadius: 6}} />
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

const Shimmer = props => (
  <ShimmerPlaceholder
    shimmerColors={[
      themes.light.boxColor.placeholder,
      '#F5F5F5',
      themes.light.boxColor.placeholder,
    ]}
    LinearGradient={LinearGradient}
    {...props}
  />
);
