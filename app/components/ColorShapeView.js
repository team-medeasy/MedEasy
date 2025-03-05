import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../styles';

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
  파랑: '#0000FF',
  남색: '#000080',
  자주: '#800080',
  보라: '#9370DB',
  회색: '#808080',
  검정: '#000000',
  투명: 'transparent',
};

// 모양 코드
const shapeCodes = {
  원형: '',
  타원형: '',
  장방형: '',
  삼각형: '',
  사각형: '',
  마름모형: '',
  오각형: '',
  육각형: '',
  팔각형: '',
  반원형: '',
  기타: '',
};

const ColorShapeView = ({ type, value, marginRight }) => {
    if (type === 'color') {
      return (
        <ColorView 
          style={{ 
            backgroundColor: colorCodes[value],
            marginRight : marginRight || 7,
          }} 
        />
      );
    }
    
    if (type === 'shape') {
      return (
        <ShapeView 
          style={{ 
            marginRight: marginRight || 7,
          }}/>
      );
    }
    
    return null;
  };

  const ShapeView = styled.View`
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border-width: 1.5px;
  border-color: ${themes.light.textColor.Primary50};
`;

const ColorView = styled.View`
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border-width: 1.5px;
  border-color: ${themes.light.borderColor.borderCircle};
`;
  
  export { ColorShapeView, colorCodes, shapeCodes };