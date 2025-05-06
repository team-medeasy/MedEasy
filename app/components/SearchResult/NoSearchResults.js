import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {Images} from '../../../assets/icons';

const NoSearchResults = () => {
  return (
    <Container>
      <Images.emptySearchResult style={{marginBottom: 48}} />
      <NoResultTitle>검색 결과가 없습니다.</NoResultTitle>
      <NoResultText>검색어를 다시 한 번{'\n'}확인해 주세요.</NoResultText>
    </Container>
  );
};

const Container = styled.View`
  justify-content: center;
  align-items: center;
  flex: 1;
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
`;

export {NoSearchResults};
