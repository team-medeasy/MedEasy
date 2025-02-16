import React from 'react';
import styled from 'styled-components/native';
import { pointColor, themes } from '../styles';

const ProgressBarContainer = styled.View`
  width: 100%;
  height: 5px;
  background-color: ${themes.light.borderColor.borderPrimary};
`;

const Progress = styled.View`
  width: ${({ progress }) => progress || '0%'};
  height: 100%;
  background-color: ${pointColor.pointPrimary};
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
`;

const ProgressBar = ({ progress }) => {
  return (
    <ProgressBarContainer>
      <Progress progress={progress} />
    </ProgressBarContainer>
  );
};

export default ProgressBar;
