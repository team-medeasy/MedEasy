import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {Images} from '../../../assets/icons';
import EmptyState from '../EmptyState';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';

const NoSearchResults = () => {
  const {fontSizeMode} = useFontSize();

  return (
    <EmptyState
      image={<Images.emptySearchResult style={{marginBottom: 32}} />}
      title="검색 결과가 없습니다."
      description={`검색어를 다시 한 번\n확인해 주세요.`}
      fontSizeMode={fontSizeMode}
    />
  );
};

export {NoSearchResults};
