import React, {useState, useEffect, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import styled from 'styled-components/native';
import {
  View,
  Text,
  TouchableOpacity,
  InteractionManager,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {ScrollView, FlatList} from 'react-native-gesture-handler';
import {themes} from '../../styles';
import {
  Footer,
  Header,
  ModalHeader,
  MedicineOverview,
  MedicineAppearance,
  Button,
  SimilarMedicineItem,
} from './../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {OtherIcons} from '../../../assets/icons';
import {getSimilarMedicines, getMedicineById} from '../../api/medicine';
import {getUserMedicineCount} from '../../api/user';

const MedicineDetailScreen = ({route, navigation}) => {
  const {medicineId, isModal, basicInfo, item, title} = route.params;
  const {fontSizeMode} = useFontSize();
  
  const [medicine, setMedicine] = useState(basicInfo || item || null);
  const [similarMedicines, setSimilarMedicines] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isMounted = useRef(true);

  // medicine_id로 약품 정보 가져오기
  const fetchMedicineData = async () => {
    try {
      setIsLoading(true);
      
      // 기존 item 객체가 전달된 경우
      if (item && !medicineId) {
        // 기본 정보만 먼저 매핑하여 빠르게 렌더링
        const basicMedicine = {
          item_id: item.id,
          item_name: item.item_name,
          entp_name: item.entp_name,
          class_name: item.class_name,
          etc_otc_name: item.etc_otc_name,
          item_image: item.item_image,
        };

        // 기본 정보로 먼저 상태 업데이트
        setMedicine(basicMedicine);

        // 나머지 정보는 별도 스레드에서 처리
        InteractionManager.runAfterInteractions(() => {
          if (isMounted.current) {
            // 전체 정보 매핑
            const fullMappedMedicine = {
              ...basicMedicine,
              // 추가 정보
              chart: item.chart,
              drug_shape: item.drug_shape,
              color_classes: item.color_classes,
              print_front: item.print_front,
              print_back: item.print_back,
              leng_long: item.leng_long,
              leng_short: item.leng_short,
              thick: item.thick,
              efcy_qesitm: item.indications,
              use_method_qesitm: item.dosage,
              deposit_method_qesitm: item.storage_method,
              atpn_qesitm: item.precautions,
              se_qesitm: item.side_effects,
            };

            setMedicine(fullMappedMedicine);
            setIsLoading(false);
          }
        });
      } 
      // medicineId로 API 호출하여 데이터 가져오기
      else if (medicineId) {
        console.log('약품 ID로 상세 정보 가져오기:', medicineId);
        
        // 기본 정보가 전달된 경우 우선 표시
        if (basicInfo) {
          setMedicine({
            item_id: medicineId,
            ...basicInfo
          });
        }
        
        const response = await getMedicineById(medicineId);
        
        if (response.data?.result?.result_code === 200) {
          const medicineData = response.data.body;
          
          // 기본 정보 매핑
          const mappedMedicine = {
            item_id: medicineData.id,
            item_name: medicineData.item_name,
            entp_name: medicineData.entp_name,
            class_name: medicineData.class_name,
            etc_otc_name: medicineData.etc_otc_name,
            item_image: medicineData.item_image,
            // 추가 정보
            chart: medicineData.chart,
            drug_shape: medicineData.drug_shape,
            color_classes: medicineData.color_classes,
            print_front: medicineData.print_front,
            print_back: medicineData.print_back,
            leng_long: medicineData.leng_long,
            leng_short: medicineData.leng_short,
            thick: medicineData.thick,
            efcy_qesitm: medicineData.indications,
            use_method_qesitm: medicineData.dosage,
            deposit_method_qesitm: medicineData.storage_method,
            atpn_qesitm: medicineData.precautions,
            se_qesitm: medicineData.side_effects,
          };
          
          setMedicine(mappedMedicine);
        } else {
          console.error('약품 정보 API 오류:', response);
          Alert.alert('오류', '약품 정보를 불러오는 데 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('약품 정보 불러오기 오류:', error);
      Alert.alert('오류', '약품 정보를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchMedicineData();
    
    return () => {
      isMounted.current = false;
    };
  }, [medicineId]);

  // 비슷한 약
  useEffect(() => {
    if (!medicine || !medicine.item_id) return;

    let isCancelled = false;

    // 비슷한 약 로딩은 UI 렌더링 후에 진행
    const loadSimilarMedicines = async () => {
      try {
        const response = await getSimilarMedicines({
          medicine_id: medicine.item_id,
          page: 1,
          size: 10,
        });

        if (isCancelled) return;

        if (response.data && response.data.body) {
          // 데이터 매핑을 별도 스레드에서 처리
          setTimeout(() => {
            if (isCancelled) return;

            const mappedSimilarMedicines = response.data.body.map(item => ({
              item_id: item.medicine_id,
              entp_name: item.entp_name,
              item_name: item.medicine_name,
              class_name: item.class_name,
              item_image: item.item_image,
            }));

            // UI 업데이트를 requestAnimationFrame으로 래핑
            requestAnimationFrame(() => {
              if (!isCancelled) {
                setSimilarMedicines(mappedSimilarMedicines);
              }
            });
          }, 0);
        }
      } catch (error) {
        console.error('비슷한 약 정보 가져오기 실패:', error);
        if (!isCancelled) {
          setSimilarMedicines([]);
        }
      }
    };

    // 상세 정보가 로드된 후 비슷한 약 정보 로드
    InteractionManager.runAfterInteractions(loadSimilarMedicines);

    return () => {
      isCancelled = true;
    };
  }, [medicine?.item_id]);

  useFocusEffect(
    React.useCallback(() => {
      if (medicine) {
        checkMedicineRegistered();
      }
      return () => {};
    }, [medicine]),
  );

  // 루틴 등록 여부
  const checkMedicineRegistered = async () => {
    try {
      if (!medicine) return;

      const response = await getUserMedicineCount();
      const countData = response.data?.body || response.data;

      if (countData) {
        const {medicine_ids} = countData;

        console.log('💊등록된 약 id 리스트: ', medicine_ids);
        console.log('현재 약 id: ', medicine.item_id);

        if (medicine_ids && medicine_ids.includes(String(medicine.item_id))) {
          setIsRegistered(true);
          console.log('📝 등록된 약입니다.');
        } else {
          setIsRegistered(false);
          console.log('❔ 등록되지 않은 약입니다.');
        }
      } else {
        console.error('API 응답에 유효한 데이터가 없습니다:', response);
      }
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error);
    }
  };

  const HeaderComponent = ({isModal = false, ...props}) => {
    console.log('isModal:', isModal);
    if (isModal) {
      return <ModalHeader {...props} />;
    }
    return <Header {...props} />;
  };

  const handlePressEnlarge = item => {
    navigation.navigate('MedicineImageDetail', {
      item: medicine,
      isModal: isModal,
    });
  };

  const handleSetMedicineRoutine = async () => {
    if (isRegistered) {
      navigation.navigate('SetMedicineRoutine', {medicineId: medicine.item_id});
    } else {
      navigation.navigate('RoutineModal', {
        screen: 'SetMedicineName',
        params: {item: medicine},
      });
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <Container>
        <HeaderComponent isModal={isModal}>
          약 정보를 불러오는 중...
        </HeaderComponent>
        <LoadingContainer>
          <ActivityIndicator size="large" color={themes.light.textColor.Primary50} />
        </LoadingContainer>
      </Container>
    );
  }

  // 데이터가 없는 경우 처리
  if (!medicine) {
    return (
      <Container>
        <HeaderComponent isModal={isModal}>
          약 정보
        </HeaderComponent>
        <LoadingContainer>
          <EmptyText fontSizeMode={fontSizeMode}>약 정보를 불러올 수 없습니다.</EmptyText>
        </LoadingContainer>
      </Container>
    );
  }

  const headerTitle = title || medicine.item_name;
  return (
    <Container>
      <HeaderComponent isModal={isModal}>{headerTitle}</HeaderComponent>

      <ScrollView>
        <MedicineOverview
          medicine={medicine}
          onPressEnlarge={handlePressEnlarge}
        />

        <MedicineDetailContainer>
          <MedicineAppearanceContainer>
            <MedicineAppearance item={medicine} size="large" />
          </MedicineAppearanceContainer>

          <MedicineUsageContainer>
            <View
              style={{
                paddingTop: 10,
              }}>
              <Usage
                label={'💊 이런 증상에 효과가 있어요'}
                value={medicine.efcy_qesitm}
                fontSizeMode={fontSizeMode}
              />
              <Usage
                label={'📋 이렇게 복용하세요'}
                value={medicine.use_method_qesitm}
                fontSizeMode={fontSizeMode}
              />
              <Usage
                label={'🗄️ 이렇게 보관하세요'}
                value={medicine.deposit_method_qesitm}
                borderBottomWidth={10}
                fontSizeMode={fontSizeMode}
              />
            </View>
            <View>
              <Usage
                label={'⚠️ 이런 주의사항이 있어요'}
                value={medicine.atpn_qesitm}
                fontSizeMode={fontSizeMode}
              />
              <Usage
                label={'🤒 이런 부작용이 예상돼요'}
                value={medicine.se_qesitm}
                borderBottomWidth={10}
                fontSizeMode={fontSizeMode}
              />
            </View>
          </MedicineUsageContainer>
          <SimilarMedicinesContainer>
            <HeadingText style={{paddingHorizontal: 20}} fontSizeMode={fontSizeMode}>
              비슷한 약 보기
            </HeadingText>
            {similarMedicines.length > 0 ? (
              <FlatList
                data={similarMedicines}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                paddingHorizontal={20}
                keyExtractor={item => item.item_id}
                renderItem={({item}) => (
                  <SimilarMedicineItem
                    item={item}
                    navigation={navigation}
                    isModal={isModal}
                  />
                )}
              />
            ) : (
              <Text
                style={{
                  color: themes.light.textColor.Primary30,
                  fontFamily: 'Pretendard-semiBold',
                  fontSize: FontSizes.body[fontSizeMode],
                  paddingHorizontal: 20,
                }}>
                비슷한 약이 존재하지 않아요.
              </Text>
            )}
          </SimilarMedicinesContainer>
        </MedicineDetailContainer>
        <Footer />
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 30,
          alignItems: 'center',
        }}>
        {isRegistered ? (
          <Button
            title="루틴 추가 완료!"
            bgColor={themes.light.textColor.Primary50}
            onPress={handleSetMedicineRoutine}
          />
        ) : (
          <Button title="루틴 추가하기" onPress={handleSetMedicineRoutine} />
        )}
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

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.Primary50};
`;

const Usage = ({label, value, borderBottomWidth = 1, fontSizeMode}) => {
  const [expanded, setExpanded] = useState(false);
  const textLengthThreshold = 150; // 토글 기능 활성화 길이
  const isLongText = value && value.length > textLengthThreshold;

  // 축소된 텍스트는 처음 70자만 보여주고 '...' 추가
  const shortenedText =
    isLongText && !expanded ? value.substring(0, 100) + '...' : value;

  return (
    <View
      style={{
        paddingVertical: 25,
        paddingHorizontal: 20,
        gap: 18,
        borderBottomWidth: borderBottomWidth,
        borderBottomColor: themes.light.borderColor.borderSecondary,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <HeadingText fontSizeMode={fontSizeMode}>{label}</HeadingText>

        {isLongText && (
          <TouchableOpacity
            style={{paddingVertical: 8, paddingLeft: 8}}
            onPress={() => setExpanded(!expanded)}>
            {expanded ? (
              <OtherIcons.chevronDown
                width={17}
                height={17}
                style={{
                  color: themes.light.textColor.Primary30,
                  transform: [{rotate: '180deg'}],
                }}
              />
            ) : (
              <OtherIcons.chevronDown
                width={17}
                height={17}
                style={{color: themes.light.textColor.Primary30}}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={{
          color: themes.light.textColor.Primary70,
          fontFamily: 'Pretendard-Medium',
          fontSize: FontSizes.body[fontSizeMode],
          lineHeight: 30,
        }}>
        {shortenedText}
      </Text>
    </View>
  );
};

const HeadingText = styled.Text`
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]}px;
`;

export default MedicineDetailScreen;