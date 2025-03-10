import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {
  View,
  Text,
  Image,
} from 'react-native';
import {ScrollView, FlatList} from 'react-native-gesture-handler';
import {themes} from '../../styles';
import {
  Footer, 
  Tag, 
  Header, 
  MedicineOverview,
  MedicineAppearance,
  Button} from './../../components';
import FontSizes from '../../../assets/fonts/fontSizes';

import { dummyMedicineData } from '../../../assets/data/data';

const MedicineDetailScreen = ({route, navigation}) => {
  const { itemSeq } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [medicine, setMedicine] = useState(null);
  const [similarMedicines, setSimilarMedicines] = useState([]);

  // 컴포넌트 마운트 시 item_seq에 해당하는 약품 데이터 찾기
  useEffect(() => {
    const foundMedicine = dummyMedicineData.find(
      item => item.item_seq === itemSeq
    );
    if (foundMedicine) {
      setMedicine(foundMedicine);
    }
  }, [itemSeq]);

  // 임시로 비슷한 약은 class_name가 같은 것 
  useEffect(() => {
    if (medicine) {
      const foundSimilarMedicines = dummyMedicineData.filter(
        item => item.class_name === medicine.class_name
      );
      setSimilarMedicines(foundSimilarMedicines);
    }
  }, [medicine]);

  // 임시로 item_seq 값 넘김
  const handlePressEnlarge = itemSeq => {
    navigation.navigate('MedicineImageDetail', {itemSeq});
  };

  const handleSetMedicineRoutine = () => {
    navigation.navigate('SetMedicineRoutine', {itemSeq});
  };

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

      <ScrollView>
        <MedicineOverview
          medicine={medicine}
          isFavorite={isFavorite}
          setIsFavorite={setIsFavorite}
          onPressEnlarge={handlePressEnlarge}
        />

        <MedicineDetailContainer>
          <MedicineAppearanceContainer>
              <MedicineAppearance item={medicine} size='large'/>
          </MedicineAppearanceContainer>

          <MedicineUsageContainer>
            <View
              style={{
                paddingTop: 10,
              }}>
              <Usage
                label={'💊 이런 증상에 효과가 있어요'}
                value={medicine.efcy_qesitm}
              />
              <Usage
                label={'📋 이렇게 복용하세요'}
                value={medicine.use_method_qesitm}
              />
              <Usage
                label={'🗄️ 이렇게 보관하세요'}
                value={medicine.deposit_method_qesitm}
                borderBottomWidth={10}
              />
            </View>
            <View>
              <Usage
                label={'⚠️ 이런 주의사항이 있어요'}
                value={medicine.atpn_qesitm}
              />
              <Usage
                label={'🤒 이런 부작용이 예상돼요'}
                value={medicine.se_qesitm}
                borderBottomWidth={10}
              />
            </View>
          </MedicineUsageContainer>
          <SimilarMedicinesContainer>
            <HeadingText style={{paddingHorizontal: 20}}>
              비슷한 약 보기
            </HeadingText>
            {similarMedicines.length > 0 ? (
              <FlatList
                data={similarMedicines}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                paddingHorizontal={20}
                keyExtractor={item => item.item_seq}
                renderItem={({item}) => <SimilarMedicineItem item={item} />}
              />
            ) : (
              <Text>비슷한 약이 존재하지 않아요.</Text>
            )}
          </SimilarMedicinesContainer>
        </MedicineDetailContainer>
        <Footer />
      </ScrollView>

      <View style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 30,
        alignItems: 'center',
      }}>
        <Button title='루틴 추가하기' onPress={handleSetMedicineRoutine} ></Button>
      </View>

    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const MedicineDetailContainer = styled.View`
  padding: 20px 0;
`;

const MedicineAppearanceContainer = styled.View`
  padding: 0 20px;
`;

const MedicineUsageContainer = styled.View``;

const SimilarMedicinesContainer = styled.View`
  padding: 30px 0;
  gap: 30px;
`;

const Usage = ({label, value, borderBottomWidth = 1}) => (
  <View
    style={{
      paddingVertical: 25,
      paddingHorizontal: 20,
      gap: 18,
      borderBottomWidth: borderBottomWidth,
      borderBottomColor: themes.light.borderColor.borderSecondary,
    }}>
    <HeadingText>{label}</HeadingText>
    <Text
      style={{
        color: themes.light.textColor.Primary70,
        fontFamily: 'Pretendard-Medium',
        fontSize: FontSizes.body.default,
        lineHeight: 30,
      }}>
      {value}
    </Text>
  </View>
);

const SimilarMedicineItem = ({item}) => (
  <View style={{marginRight: 15, width: 138.75}}>
    <Image
      source={{uri: item.item_image}}
      style={{width: 138.75, height: 74, borderRadius: 10}}
    />
    <View style={{marginTop: 15, gap: 8}}>
      <Text
        style={{
          fontFamily: 'Pretendard-SemiBold',
          fontSize: FontSizes.caption.default,
          color: themes.light.textColor.Primary50,
        }}>
        {item.entp_name}
      </Text>
      <Text
        style={{
          fontFamily: 'Pretendard-Bold',
          fontSize: FontSizes.body.default,
          color: themes.light.textColor.textPrimary,
        }}
        numberOfLines={1} // 한 줄로 제한
        ellipsizeMode="tail">
        {item.item_name}
      </Text>
      <Tag sizeType="small" colorType="resultPrimary">
        {item.class_name}
      </Tag>
    </View>
  </View>
);

const HeadingText = styled.Text`
  color: ${themes.light.textColor.Primary};
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.heading.default};
`;

export default MedicineDetailScreen;
