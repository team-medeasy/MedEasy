import React from 'react';
import styled from 'styled-components/native';
import FontSizes from '../../assets/fonts/fontSizes';
import {themes} from '../styles';

const EmptyState = ({image, title, description}) => {
  return (
    <EmptyImageWrapper>
      {image}
      <NoResultTitle>{title}</NoResultTitle>
      <NoResultText>{description}</NoResultText>
    </EmptyImageWrapper>
  );
};

const EmptyImageWrapper = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const NoResultTitle = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

const NoResultText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.Primary30};
  margin-top: 18px;
  text-align: center;
  line-height: 22px;
`;

export default EmptyState;
