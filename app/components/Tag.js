import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { ScrollView, Text, LayoutAnimation } from 'react-native';
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
  max-width: ${props => props.maxWidth || '150'};
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
  overflowMode = 'scroll', // 'ellipsis' or 'scroll'
  maxWidth = '130',
  maxLength = 16, // 최대 글자 수
  ...rest
}) => {
  const [isOverflow, setIsOverflow] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    // 텍스트가 문자열이고 길이가 maxLength를 초과하면 오버플로우 처리
    if (typeof children === 'string' && children.length > maxLength) {
      setIsOverflow(true);
    } else {
      setIsOverflow(false);
    }
  }, [children, maxLength]);

  if (typeof children !== 'string') {
    return (
      <TagContainer
        sizeType={sizeType}
        colorType={colorType}
        bgColor={bgColor}
        style={style}
        maxWidth={maxWidth}
        {...rest}
      >
        {children}
      </TagContainer>
    );
  }

  return (
    <TagContainer
      sizeType={sizeType}
      colorType={colorType}
      bgColor={bgColor}
      style={style}
      maxWidth={maxWidth}
      {...rest}
    >
      {isOverflow ? (
        overflowMode === 'ellipsis' ? (
          <TagText
            ref={textRef}
            sizeType={sizeType}
            colorType={colorType}
            color={color}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {children}
          </TagText>
        ) : (
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <TagText
              ref={textRef}
              sizeType={sizeType}
              colorType={colorType}
              color={color}
            >
              {children}
            </TagText>
          </ScrollView>
        )
      ) : (
        <TagText
          ref={textRef}
          sizeType={sizeType}
          colorType={colorType}
          color={color}
        >
          {children}
        </TagText>
      )}
    </TagContainer>
  );
};

export { Tag };