import React from 'react';
import styled from 'styled-components/native';
import {themes} from './../../styles';
import {LogoIcons} from '../../../assets/icons';

export const PlaceholderImage = ({}) => {
  return (
    <Placeholder>
      <LogoIcons.logo
        height="50%"
        style={{color: themes.light.textColor.Primary20}}
      />
    </Placeholder>
  );
};

const Placeholder = styled.View`
  background-color: ${themes.light.boxColor.placeholder};
  width: 100%;
  height: 100%;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;
