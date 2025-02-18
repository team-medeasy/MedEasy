import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

import { themes } from './../styles';
import SearchIcon from './../../assets/icons/search.svg';

const SearchBarContainer = styled.View`
  height: 44px;
  flex-direction: row;
  align-items: center;
  border-radius: 10px;
  background-color: ${({ theme }) => themes.light.boxColor.inputSecondary};
  flex: 1;
`;

const SearchInput = styled.TextInput`
  font-size: 14px;
  margin-left: 10px;
  flex: 1;
`;

const SearchButton = styled(TouchableOpacity)`
  width: 15px;
  height: 15px;
  margin-left: 15px;
`;

const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => {
  return (
    <SearchBarContainer>
      <SearchButton onPress={onSearch}>
        <SearchIcon width={15} height={15} />
      </SearchButton>
      <SearchInput
        placeholder="약 이름, 증상을 입력하세요"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </SearchBarContainer>
  );
};

export default SearchBar;