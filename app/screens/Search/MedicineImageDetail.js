import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {Header, ModalHeader} from '../../components';
import {themes} from '../../styles';

import { dummyMedicineData } from '../../../assets/data/data';

const MedicineImageDetailScreen = ({route}) => {
  const { item, isModal = false } = route.params;
  const [medicine, setMedicine] = useState(null);

  useEffect(() => {
      if (item) {
        // API 응답 데이터 필드를 기존 앱 구조에 맞게 매핑
        const mappedMedicine = {
          item_name: item.item_name,
          item_image: item.item_image,
        };
        
        setMedicine(mappedMedicine);
      } else {
        console.error('약 정보를 찾을 수 없습니다.');
      }
    }, [item]);

  const HeaderComponent = ({ isModal = false, ...props }) => {
    if (isModal) {
      return <ModalHeader {...props} />;
    }
    return <Header {...props} />;
  };

  if (!medicine) { // 렌더링 전 error 방지
    return (
      <Container>
        <HeaderComponent
          isModal={isModal}
        >약 정보를 불러오는 중...
        </HeaderComponent>
      </Container>
    );
  }
  return (
    <Container>
      <HeaderComponent
        isModal={isModal}
      >{medicine.item_name}
      </HeaderComponent>

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
  height: 403px;
  transform: rotate(-90deg);
  flex-shrink: 0;
`;

export default MedicineImageDetailScreen;
