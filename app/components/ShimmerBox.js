import React from 'react';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {themes} from '../styles';

const ShimmerBox = ({width, height, style}) => {
  return (
    <ShimmerPlaceholder
      shimmerColors={[
        themes.light.boxColor.placeholder,
        '#F5F5F5',
        themes.light.boxColor.placeholder,
      ]}
      LinearGradient={LinearGradient}
      width={width}
      height={height}
      style={style}
    />
  );
};

export default ShimmerBox;
