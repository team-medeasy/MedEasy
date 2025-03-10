import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import {Tag, Button, Header, MedicineAppearance} from './../../components';
import { FlatList, View } from 'react-native';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useNavigation } from '@react-navigation/native';

import { dummyMedicineData } from '../../../assets/data/data';

const MedicineItem = ({ item }) => {
  const navigation = useNavigation();

  // 임시로 item_seq 값 넘김
  const handleMedicineConfirm = itemSeq => {
    navigation.navigate('MedicineDetail', {itemSeq});
  };

  return (
    <ItemContainer>
      <ImageContainer>
        <TopHalfContainer>
          <LeftHalfImage 
            source={{ uri: item.item_image }} 
            resizeMode="cover"
          />
        </TopHalfContainer>
        <BottomHalfContainer>
          <RightHalfImage 
            source={{ uri: item.item_image }} 
            resizeMode="cover"
          />
        </BottomHalfContainer>
      </ImageContainer>
      
      <InfoContainer>
        <View style={{
          flexDirection: 'row',
          gap: 11,
          marginBottom: 9,
        }}>
          <Tag sizeType='small' colorType='resultPrimary'>{item.etc_otc_name}</Tag>
          <Tag sizeType='small' colorType='resultSecondary'>{item.class_name}</Tag>
        </View>
        
        <View style={{
          gap: 13
        }}>
          <View style={{
            gap: 5
          }}>
            <MedicineName numberOfLines={1} ellipsizeMode="tail">
              {item.item_name}
            </MedicineName>    
            <Description numberOfLines={2} ellipsizeMode="tail">
              {item.chart}
            </Description>
          </View>

          <MedicineAppearance item={item}/>
          
          <Button 
            title='이 약이 맞아요' 
            fontSize='15' 
            height='40'
            onPress={() => handleMedicineConfirm(item.item_seq)} />
        </View>
      </InfoContainer>
    </ItemContainer>
  );
};

const CameraSearchResultsScreen = () => {
  const [medicine, setMedicine] = useState(null);
  
  useEffect(() => {
    setMedicine(dummyMedicineData);
  });

  if (!medicine) { // 렌더링 전 error 방지
    return (
      <Container>
        <Header>약 정보를 불러오는 중...</Header>
      </Container>
    );
  }
  return (
    <Container>
      <Header>약 검색 결과</Header>
      
      <ResultsContainer>
        <FlatList
          data={medicine}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MedicineItem item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </ResultsContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const ResultsContainer = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 15px;
`;

const ItemContainer = styled.View`
  flex-direction: row;
  margin-bottom: 20px;
  gap: 20px;
`;

const ImageContainer = styled.View`
  width: 117px;
  height: 250px;
  flex-direction: column;
`;

const HalfImageContainer = styled.View`
  width: 117px;
  height: 125px;
  flex-shrink: 0;
  overflow: hidden;
`;

const LeftHalfImage = styled.Image`
  width: 234px; 
  height: 125px;
  position: absolute;
  left: 0;
  border-radius: 10px 10px 0px 0px;
`;

const RightHalfImage = styled.Image`
  width: 234px; 
  height: 125px;
  position: absolute;
  left: -117px; 
  border-radius: 0px 0px 10px 10px;
`;

const TopHalfContainer = styled(HalfImageContainer)`
  border-radius: 10px 10px 0 0; 
`;

const BottomHalfContainer = styled(HalfImageContainer)`
  border-radius: 0 0 10px 10px; 
`;

const InfoContainer = styled.View`
  flex: 1;
`;

const MedicineName = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'Pretendard-bold';
  color: ${themes.light.textColor.textPrimary};
`;

const Description = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-medium';
  color: ${themes.light.textColor.Primary50};
`;

export default CameraSearchResultsScreen;