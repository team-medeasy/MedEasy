import React, { useRef } from 'react';
import styled from 'styled-components/native';
import { ScrollView, View } from 'react-native';
import { themes } from '../styles';
import FontSizes from '../../assets/fonts/fontSizes';
import { useFontSize } from '../../assets/fonts/FontSizeContext';

const size = {
  small: {
    fontFamily: 'Pretendard-SemiBold',
    padding: '4px 7px',
  },
  large: {
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
    color: themes.light.textColor.textPrimary,
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

// 일립시스 모드를 위한 고정 너비 컨테이너
const FixedWidthContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  border-radius: 5px;
  background-color: ${props =>
    props.colorType
      ? color[props.colorType].bgColor
      : props.bgColor || themes.light.boxColor.tagDetailPrimary};
  padding: ${props =>
    props.sizeType === 'small' ? size.small.padding : size.large.padding};
  max-width: ${props => props.maxWidth || 'auto'};
`;

// 스크롤 모드를 위한 유연한 너비 컨테이너
const FlexibleWidthContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background-color: ${props =>
    props.colorType
      ? color[props.colorType].bgColor
      : props.bgColor || themes.light.boxColor.tagDetailPrimary};
  padding: ${props =>
    props.sizeType === 'small' ? size.small.padding : size.large.padding};
  max-width: ${props => props.maxWidth || 'auto'};
`;

const TagText = styled.Text`
  color: ${props =>
    props.colorType
      ? color[props.colorType].color
      : props.color || themes.light.textColor.buttonText};
  font-size: ${props => 
  props.sizeType === 'small' 
    ? FontSizes.caption[props.fontSizeMode]
    : FontSizes.body[props.fontSizeMode]};
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
  overflowMode = 'scroll', // 'ellipsis' 또는 'scroll'
  maxWidth, // 선택적 최대 너비 (예: '100%', '150px' 등)
  ...rest
}) => {
  const { fontSizeMode } = useFontSize();
  const containerRef = useRef(null);

  if (typeof children !== 'string') {
    return (
      <FixedWidthContainer
        sizeType={sizeType}
        colorType={colorType}
        bgColor={bgColor}
        style={style}
        maxWidth={maxWidth}
        {...rest}
      >
        {children}
      </FixedWidthContainer>
    );
  }

  // ellipsis 모드일 때는 기존처럼 고정 너비 사용
  if (overflowMode === 'ellipsis') {
    return (
      <FixedWidthContainer
        ref={containerRef}
        sizeType={sizeType}
        colorType={colorType}
        bgColor={bgColor}
        style={style}
        maxWidth={maxWidth}
        {...rest}
      >
        <TagText
          sizeType={sizeType}
          colorType={colorType}
          color={color}
          numberOfLines={1}
          ellipsizeMode="tail"
          fontSizeMode={fontSizeMode}
        >
          {children}
        </TagText>
      </FixedWidthContainer>
    );
  }

  // scroll 모드일 때는 유연한 너비를 사용하되, ScrollView의 최대 너비 제한
  return (
    <View style={{ maxWidth }}>
      <FlexibleWidthContainer
        ref={containerRef}
        sizeType={sizeType}
        colorType={colorType}
        bgColor={bgColor}
        style={[{ alignSelf: 'flex-start' }, style]}
        {...rest}
      >
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 0 }}
        >
          <TagText
            sizeType={sizeType}
            colorType={colorType}
            color={color}
            fontSizeMode={fontSizeMode}
          >
            {children}
          </TagText>
        </ScrollView>
      </FlexibleWidthContainer>
    </View>
  );
};

export { Tag };