import React from 'react';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import {Tag, Button, Header, MedicineAppearance} from './../../components';
import { FlatList, View } from 'react-native';
import FontSizes from '../../../assets/fonts/fontSizes';

const MedicineItem = ({ item }) => {
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
            <MedicineName numberOfLines={2} ellipsizeMode="tail">
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
            onPress={() => {}} />
        </View>
      </InfoContainer>
    </ItemContainer>
  );
};

const CameraSearchResultsScreen = ({route}) => {
  const dummyData = [
    {
      id: '1',
      item_name: '지엘타이밍정(카페인무수물)',
      item_image: 'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1NAT_bwbZd9',
      etc_otc_name: '일반의약품',
      class_name: '각성제',
      chart: '노란색의 팔각형 정제',
      print_front: '마크',
      print_back: 'T1E',
      drug_shape: '팔각형',
      color_class1: '노랑',
      leng_long: '7.9',
      leng_short: '7.9',
      thick: '3.9',
    },
    {
      id: '2',
      item_name: '베스타제당의정',
      item_image: 'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1MoApPycZgS',
      etc_otc_name: '일반의약품',
      class_name: '건위소화제',
      chart: '분홍색의 원형 당의정이다.',
      print_front: 'BSS',
      print_back: '',
      drug_shape: '원형',
      color_class1: '분홍',
      leng_long: '11.6',
      leng_short: '11.6',
      thick: '4.9',
    },
    {
      id: '3',
      item_name: '아네모정',
      item_image: 'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/152035092098000085',
      etc_otc_name: '일반의약품',
      class_name: '제산제',
      chart: '백색의 원형필름제피정',
      print_front: '',
      print_back: 'SJA',
      drug_shape: '원형',
      color_class1: '하양',
      leng_long: '11',
      leng_short: '11',
      thick: '4.9',
    },
    {
      id: '4',
      item_name: '에바치온캡슐',
      item_image: 'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/151577167067000087',
      etc_otc_name: '일반의약품',
      class_name: '해독제',
      chart: '흰색～회백색의 가루가 든 상 농황색 하 농황색의 경질캡슐제',
      print_front: '마크',
      print_back: 'T1E',
      drug_shape: '팔각형',
      color_class1: '노랑',
      leng_long: '19.10',
      leng_short: '6.63',
      thick: '6.91',
    },
  ];
  
  return (
    <Container>
      <Header>약 검색 결과</Header>
      
      <ResultsContainer>
        <FlatList
          data={dummyData}
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