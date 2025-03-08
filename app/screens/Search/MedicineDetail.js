import React, {useState} from 'react';
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

const MedicineDetailScreen = ({navigation}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // 임시로 item_seq 값 넘김
  const handlePressEnlarge = itemSeq => {
    navigation.navigate('MedicineImageDetail', {itemSeq});
  };

  // 임시로 medicine 데이터 넘김
  const handleSetMedicineRoutine = () => {
    navigation.navigate('SetMedicineRoutine', { medicine });
  };

  // 임시 데이터
  const medicine = {
    item_name: '지엘타이밍정(카페인무수물)',
    item_seq: '196500051',
    entp_name: '지엘파마(주)',
    entp_seq: '19650018',
    item_image:
      'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1NAT_bwbZd9',
    class_name: '각성제',
    etc_otc_name: '일반의약품',
    chart: '노란색의 팔각형 정제',
    print_front: '마크',
    print_back: 'T1E',
    drug_shape: '팔각형',
    color_class1: '노랑',
    leng_long: '7.9',
    leng_short: '7.9',
    thick: '3.9',
    color_class2: '',
    efcy_qesitm: '졸음',
    use_method_qesitm:
      '성인은 1회 2~6정(100~300 mg)씩, 1일 1~3회 복용합니다.연령, 증상에 따라 적절히 증감할 수 있습니다.',
    atpn_qesitm:
      '갈락토오스 불내성, Lapp 유당분해효소 결핍증 또는 포도당-갈락토오스 흡수장애 등의 유전적인 문제가 있는 환자는 이 약을 복용하지 마십시오.이 약을 복용하기 전에 임부 또는 임신하고 있을 가능성이 있는 여성 및 수유부, 고령자, 위궤양 환자 또는 경험자, 심질환, 녹내장 환자는 의사 또는 약사와 상의하십시오.',
    se_qesitm:
      '만성 녹내장을 악화시킬 경우 복용을 즉각 중지하고 의사 또는 약사와 상의하십시오.',
    deposit_method_qesitm:
      '실온에서 보관하십시오.어린이의 손이 닿지 않는 곳에 보관하십시오.',
  };

  const similarMedicines = [
    {
      id: '1',
      item_name: '베스타제당의정',
      item_image:
        'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1MoApPycZgS',
      entp_name: '동야제약(주)',
      etc_otc_name: '일반의약품',
      class_name: '건위소화제',
    },
    {
      id: '2',
      item_name: '아네모정',
      item_image:
        'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/152035092098000085',
      entp_name: '삼진제약(주)',
      etc_otc_name: '일반의약품',
      class_name: '제산제',
    },
    {
      id: '3',
      item_name: '에바치온캡슐',
      item_image:
        'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/151577167067000087',
      entp_name: '조아제약(주)',
      etc_otc_name: '일반의약품',
      class_name: '해독제',
    },
    {
      id: '4',
      item_name: '삐콤정',
      item_image:
        'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/153495248483300010',
      entp_name: '(주)유한양행',
      etc_otc_name: '일반의약품',
      class_name: '혼합비타민제',
    },
    {
      id: '5',
      item_name: '게루삼정',
      item_image:
        'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/154307400984500104',
      entp_name: '삼남제약(주)',
      etc_otc_name: '일반의약품',
      class_name: '제산제',
    },
    {
      id: '6',
      item_name: '페니라민정(클로르페니라민)',
      item_image:
        'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1Orz9gcUHnw',
      entp_name: '지엘파마(주)',
      etc_otc_name: '일반의약품',
      class_name: '항히스타민제',
    },
  ];

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
                keyExtractor={item => item.id}
                renderItem={({item}) => <SimilarMedicineItem item={item} />} // MedicineItem 컴포넌트 사용
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
