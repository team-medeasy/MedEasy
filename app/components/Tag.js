import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../styles';

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

const TagContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: ${props =>
    props.sizeType === 'small' ? size.small.fontSize : size.large.fontSize};
  font-family: ${props =>
    props.sizeType === 'small' ? size.small.fontFamily : size.large.fontFamily};
  background-color: ${props =>
    props.colorType
      ? color[props.colorType].bgColor
      : props.bgColor || themes.light.boxColor.tagDetailPrimary};
  border-radius: 5px;
  padding: ${props =>
    props.sizeType === 'small' ? size.small.padding : size.large.padding};
  align-self: flex-start;
`;

const TagText = styled.Text`
  color: ${props =>
    props.colorType
      ? color[props.colorType].color
      : props.color || themes.light.textColor.buttonText};
  font-size: ${props =>
    props.sizeType === 'small' ? size.small.fontSize : size.large.fontSize};
  font-family: ${props =>
    props.sizeType === 'small' ? size.small.fontFamily : size.large.fontFamily};
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
      style={style}
      {...rest}>
      {typeof children === 'string' ? (
        <TagText sizeType={sizeType} colorType={colorType}>
          {children}
        </TagText>
      ) : (
        children
      )}
    </TagContainer>
  );
};

export {Tag};
