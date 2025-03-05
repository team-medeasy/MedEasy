import React from 'react';
import styled from 'styled-components/native';
import {Header} from '../../components/\bHeader/Header';
import {themes} from '../../styles';

const MedicineImageDetailScreen = () => {
  const medicine = {
    item_name: '지엘타이밍정(카페인무수물)',
    item_seq: '196500051',
    item_image:
      'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1NAT_bwbZd9',
  };

  return (
    <Container>
      <Header>{medicine.item_name}</Header>

      <ImageContainer>
        <MedicineImage source={{uri: medicine.item_image}} />
      </ImageContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const ImageContainer = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const MedicineImage = styled.Image`
  width: 718px;
  height: 393px;
  transform: rotate(-90deg);
  flex-shrink: 0;
`;

export default MedicineImageDetailScreen;
