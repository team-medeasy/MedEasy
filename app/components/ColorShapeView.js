import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../styles';
import {ShapeIcons} from '../../assets/icons';

// 색상 코드
const colorCodes = {
  하양: '#FFFFFF',
  노랑: 'rgba(255, 221, 0, 1)',
  주황: '#FFA500',
  분홍: '#FFC0CB',
  빨강: '#FF0000',
  갈색: '#8B4513',
  초록: '#008000',
  청록: '#00CED1',
  연두: '#90EE90',
  파랑: '#0000FF',
  남색: '#000080',
  자주: '#800080',
  보라: '#9370DB',
  자홍: '#FF00FF',
  회색: '#808080',
  검정: '#000000',
  투명: 'transparent',
};

// 모양 코드
const shapeCodes = {
  원형: 'circle',
  타원형: 'oval',
  장방형: 'oblong',
  삼각형: 'triangle',
  사각형: 'rectangle',
  마름모형: 'diamond',
  오각형: 'pentagon',
  육각형: 'hexagon',
  팔각형: 'octagon',
  반원형: 'half_moon',
  기타: 'other',
};

const ColorShapeView = ({type, value, marginRight, width, height}) => {
  if (type === 'color') {
    return (
      <ColorView
        style={{
          backgroundColor: colorCodes[value],
          marginRight: marginRight || 7,
          width: width || 14,
          height: height || 14,
        }}
      />
    );
  }

  if (type === 'shape') {
    const shapeKey = shapeCodes[value];
    const ShapeIcon = ShapeIcons[shapeKey];

    if (ShapeIcon) {
      return <ShapeIcon style={{marginRight: marginRight || 7}} />;
    }

    return (
      <ShapeView
        style={{
          marginRight: marginRight || 7,
          width: width || 14,
          height: height || 14,
        }}
      />
    );
  }

  return null;
};

const ShapeView = styled.View`
  border-radius: 7px;
  border-width: 1.5px;
  border-color: ${themes.light.textColor.Primary50};
`;

const ColorView = styled.View`
  border-radius: 7px;
  border-width: 1.5px;
  border-color: ${themes.light.borderColor.borderCircle};
`;

export {ColorShapeView};
