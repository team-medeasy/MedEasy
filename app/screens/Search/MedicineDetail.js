import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import {ScrollView, FlatList} from 'react-native-gesture-handler';
import {themes} from '../../styles';
import {
  Footer,
  Tag,
  Header,
  ModalHeader,
  MedicineOverview,
  MedicineAppearance,
  Button} from './../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import {OtherIcons} from '../../../assets/icons';
import { getSimilarMedicines } from '../../api/medicine';

const MedicineDetailScreen = ({route, navigation}) => {
  const {item, isModal, title} = route.params;
  console.log('전달된 데이터값: ',item); // 전체 데이터 확인
  const [isFavorite, setIsFavorite] = useState(false);
  const [medicine, setMedicine] = useState(null);
  const [similarMedicines, setSimilarMedicines] = useState([]);

  useEffect(() => {
    if (item) {
      const mappedMedicine = {
        // 기본 정보
        item_id: item.id,
        item_name: item.item_name,
        entp_name: item.entp_name,
        class_name: item.class_name,
        etc_otc_name : item.etc_otc_name,
        item_image: item.item_image,
        // 외관 정보
        drug_shape: item.drug_shape,
        color_classes: item.color_classes,
        print_front: item.print_front,
        print_back: item.print_back,
        leng_long: item.leng_long,
        leng_short: item.leng_short,
        thick: item.thick,
        // 사용 정보
        efcy_qesitm: item.indications, // 효능
        use_method_qesitm: item.dosage, // 복용법
        deposit_method_qesitm: item.storage_method, // 보관법
        atpn_qesitm: item.precautions, // 주의사항
        se_qesitm: item.side_effects, // 부작용
      };
      
      setMedicine(mappedMedicine);
    } 
  }, [item]);

  // 비슷한 약 
  useEffect(() => {
    if (medicine) {
      getSimilarMedicines({ 
        medicine_id: medicine.item_id, 
        page: 1, 
        size: 10 
      })
        .then(response => {
          if (response.data && response.data.body) {
            const mappedSimilarMedicines = response.data.body.map(item => ({
              item_id: item.medicine_id,
              entp_name: item.entp_name,
              item_name: item.medicine_name,
              class_name: item.class_name,
              item_image: item.item_image,
            }));
            setSimilarMedicines(mappedSimilarMedicines);
          }
        })
        .catch(error => {
          console.error('비슷한 약 정보 가져오기 실패:', error);
          setSimilarMedicines([]);
        });
    }
  }, [medicine]);

  const HeaderComponent = ({ isModal = false, ...props }) => {
    console.log('isModal:', isModal);
    if (isModal) {
      return <ModalHeader {...props} />;
    }
    return <Header {...props} />;
  };

  const handlePressEnlarge = item => {
    navigation.navigate('MedicineImageDetail', {item: medicine, isModal: isModal});
  };

  const handleSetMedicineRoutine = () => {
    navigation.navigate('SetMedicineName', { 
      item: item
    });
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

  const headerTitle = title || medicine.item_name;
  return (
    <Container>
      <HeaderComponent
        isModal={isModal}
      >{headerTitle}
      </HeaderComponent>

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
                keyExtractor={item => item.item_id}
                renderItem={({item}) => <SimilarMedicineItem item={item} />}
              />
            ) : (
              <Text style={{
                color: themes.light.textColor.Primary30,
                fontFamily: 'Pretendard-semiBold',
                fontSize: FontSizes.caption.large,
                paddingHorizontal: 20
              }}>비슷한 약이 존재하지 않아요.</Text>
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

const Usage = ({label, value, borderBottomWidth = 1}) => {
  const [expanded, setExpanded] = useState(false);
  const textLengthThreshold = 150; // 토글 기능 활성화 길이
  const isLongText = value && value.length > textLengthThreshold;

  // 축소된 텍스트는 처음 70자만 보여주고 '...' 추가
  const shortenedText = isLongText && !expanded
    ? value.substring(0, 100) + '...'
    : value;

  return (
    <View
      style={{
        paddingVertical: 25,
        paddingHorizontal: 20,
        gap: 18,
        borderBottomWidth: borderBottomWidth,
        borderBottomColor: themes.light.borderColor.borderSecondary,
      }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <HeadingText>{label}</HeadingText>

        {isLongText && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            {expanded
              ? <OtherIcons.chevronDown width={17} height={17} style={{color: themes.light.textColor.Primary30, transform: [{ rotate: '180deg' }]}}/>
              : <OtherIcons.chevronDown width={17} height={17} style={{color: themes.light.textColor.Primary30}}/>}
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={{
          color: themes.light.textColor.Primary70,
          fontFamily: 'Pretendard-Medium',
          fontSize: FontSizes.body.default,
          lineHeight: 30,
        }}>
        {shortenedText}
      </Text>
    </View>
  );
};

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
        {item.class_name || '약품 구분'}
      </Tag>
    </View>
  </View>
);

const HeadingText = styled.Text`
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.heading.default};
`;

export default MedicineDetailScreen;