import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {Header} from '../../components/\bHeader/Header';
import {themes} from '../../styles';

import { dummyMedicineData } from '../../../assets/data/data';

const MedicineImageDetailScreen = ({route}) => {
  const { itemSeq } = route.params;
  const [medicine, setMedicine] = useState(null);

  // 컴포넌트 마운트 시 item_seq에 해당하는 약품 데이터 찾기
  useEffect(() => {
    const foundMedicine = dummyMedicineData.find(
      item => item.item_seq === itemSeq
    );
    if (foundMedicine) {
      setMedicine(foundMedicine);
    }
  }, [itemSeq]);

  if (!medicine) { // 렌더링 전 error 방지
    return (
      <Container>
        <Header>약 정보를 불러오는 중...</Header>
      </Container>
    );
  }
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
