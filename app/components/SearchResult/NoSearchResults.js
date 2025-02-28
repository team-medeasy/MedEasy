import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';

const NoSearchResults = () => {
  return (
    <Container>
      <NoResultsText>검색 결과가 없습니다.</NoResultsText>
      <NoResultsSubText>
        검색어를 다시 한 번{'\n'}확인해 주세요.
      </NoResultsSubText>
    </Container>
  );
};

const Container = styled.View`
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const NoResultsText = styled.Text`
  font-size: 18px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.textPrimary};
`;

const NoResultsSubText = styled.Text`
  font-size: 14px;
  font-family: 'Pretendard-SemiBold';
  color: ${themes.light.textColor.Primary30};
  margin-top: 18px;
  text-align: center;
`;

export default NoSearchResults;
