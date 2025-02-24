import React from 'react';
import styled from 'styled-components/native';
import { themes } from '../styles';

const size = {
  small: {
    fontSize: '12px',
    fontFamily: 'Pretendard-SemiBold',
    padding: '4px 7px',
  },
  large: {
    fontSize: '15px',
    fontFamily: 'Pretendard-Bold',
    padding: '6px 10px',
  },
};

const color = {
  resultPrimary: {
    bgColor: themes.light.boxColor.tagResultPrimary,
    color: themes.light.pointColor.Primary,
  },
  resultSecondary: {
    bgColor: themes.light.boxColor.tagResultSecondary,
    color: themes.light.textColor.primary,
  },
  detailPrimary: {
    bgColor: themes.light.boxColor.tagDetailPrimary,
    color: themes.light.textColor.buttonText,
  },
  detailSecondary: {
    bgColor: themes.light.boxColor.tagDetailSecondary,
    color: themes.light.textColor.buttonText,
  },
};

const TagContainer = styled.Text`
  font-size: ${(props) => (props.sizeType === 'small' ? size.small.fontSize : size.large.fontSize)};
  font-family: ${(props) => (props.sizeType === 'small' ? size.small.fontFamily : size.large.fontFamily)};
  background-color: ${(props) => 
    props.colorType ? 
      color[props.colorType].bgColor : 
      props.bgColor || themes.light.boxColor.tagDetailPrimary};
  color: ${(props) => 
    props.colorType ? 
      color[props.colorType].color : 
      props.color || themes.light.textColor.buttonText};
  border-radius: 5px;
  padding: ${(props) => (props.sizeType === 'small' ? size.small.padding : size.large.padding)};
  align-self: flex-start;
`;

const Tag = ({ 
  children, 
  sizeType = 'large', 
  colorType, 
  bgColor, 
  color, 
  style, 
  ...rest 
}) => {
  return (
    <TagContainer 
      sizeType={sizeType} 
      colorType={colorType} 
      bgColor={bgColor} 
      color={color} 
      style={style} 
      {...rest}
    >
      {children}
    </TagContainer>
  );
};

export { Tag };