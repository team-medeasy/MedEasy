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
  Easing,
  Animated,
  StyleSheet,
  Platform,
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
import MedicineWarning from '../../components/MedicineInfo/MedicineWarning';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {OtherIcons} from '../../../assets/icons';
import {
  getSimilarMedicines,
  getMedicineById,
  getMedicineAudioUrl,
} from '../../api/medicine';
import {getUserMedicinesCurrent} from '../../api/user';
import Sound from 'react-native-sound';

Sound.setCategory('Playback', true);

const MedicineDetailScreen = ({route, navigation}) => {
  const {medicineId, isModal, basicInfo, item, title} = route.params;
  const {fontSizeMode} = useFontSize();

  const [medicine, setMedicine] = useState(basicInfo || item || null);
  const [similarMedicines, setSimilarMedicines] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);

  const isMounted = useRef(true);

  const safeParse = val => {
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) ? parsed : null;
  };

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
          item_seq: item.item_seq, // 금기정보 조회에 필요
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
            ...basicInfo,
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
            item_seq: medicineData.item_seq, // 금기정보 조회에 필요
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

      const response = await getUserMedicinesCurrent();
      const currentList = response.data?.body || response.data;

      if (Array.isArray(currentList)) {
        const registered = currentList.some(
          med => String(med.medicine_id) === String(medicine.item_id),
        );

        setIsRegistered(registered);
        console.log(
          registered ? '📝 등록된 약입니다.' : '❔ 등록되지 않은 약입니다.',
        );
      } else {
        console.warn('예상과 다른 데이터 형식:', currentList);
        setIsRegistered(false);
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

  const handleAudioPress = async medicineId => {
    if (isPlaying && currentSound) {
      currentSound.stop();
      currentSound.release();
      setCurrentSound(null);
      setIsPlaying(false);
      return;
    }

    try {
      const response = await getMedicineAudioUrl(medicineId);
      const audioUrl = response.data.body;

      if (audioUrl) {
        const sound = new Sound(audioUrl, '', error => {
          if (error) {
            console.error('오디오 로딩 실패:', error);
            Alert.alert('오류', '오디오 파일을 로드하는 데 실패했습니다.');
            setIsPlaying(false);
            return;
          }

          sound.setVolume(1.0);
          setIsPlaying(true);
          setCurrentSound(sound);

          sound.play(success => {
            if (!success) {
              Alert.alert('오류', '오디오 재생에 실패했습니다.');
            }
            setIsPlaying(false);
            setCurrentSound(null);
            sound.release();
          });
        });
      } else {
        Alert.alert('안내', '이 약에 대한 음성 정보가 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '음성 파일을 가져오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.stop();
        currentSound.release();
      }
    };
  }, [currentSound]);

  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bubbleOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(bubbleOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <Container>
        <HeaderComponent isModal={isModal}>
          {title || '약 정보를 불러오는 중...'}
        </HeaderComponent>
        <LoadingContainer>
          <ActivityIndicator
            size="large"
            color={themes.light.pointColor.Primary}
          />
          <EmptyText fontSizeMode={fontSizeMode}>
            약 정보를 불러오는 중입니다...
          </EmptyText>
        </LoadingContainer>
      </Container>
    );
  }
  // 데이터가 없는 경우 처리
  if (!medicine) {
    return (
      <Container>
        <HeaderComponent isModal={isModal}>약 정보</HeaderComponent>
        <LoadingContainer>
          <EmptyText fontSizeMode={fontSizeMode}>
            약 정보를 불러올 수 없습니다.
          </EmptyText>
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

          {/* 약품 금기 정보 컴포넌트 추가 */}
          <MedicineWarning item={medicine} />

          {/* 섹션 분리선 - bgSecondary로 배경색 구분 */}
          <View
            style={{
              height: 10,
              backgroundColor: themes.light.bgColor.bgSecondary,
            }}
          />

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
            <HeadingText
              style={{paddingHorizontal: 20}}
              fontSizeMode={fontSizeMode}>
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
        <VoiceContainer>
          <Animated.View
            style={[styles.bubbleComponent, {opacity: bubbleOpacity}]}>
            <Bubble>
              <BubbleText>음성 안내</BubbleText>
            </Bubble>
            <OtherIcons.ToolTip style={{marginLeft: 40}} />
          </Animated.View>
          <VoiceButton onPress={() => handleAudioPress(medicine.item_id)}>
            <OtherIcons.Speaker
              width={25}
              height={25}
              style={{color: themes.light.pointColor.Primary}}
            />
          </VoiceButton>
        </VoiceContainer>
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
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.Primary50};
`;

const VoiceContainer = styled.View`
  position: absolute;
  justify-content: center;
  align-items: center;
  right: 20px;
  ${Platform.OS === 'ios' &&
  `
      bottom: 130px;
    `}
  ${Platform.OS === 'android' &&
  `
      bottom: 110px;
    `}
`;

const Bubble = styled.View`
  background-color: ${themes.light.boxColor.buttonPrimary};
  border-radius: 8px;
  padding: 8px;
  justify-content: center;
  align-items: center;
`;

const BubbleText = styled.Text`
  color: ${themes.light.textColor.buttonText};
  font-family: 'KimjungchulGothic-Bold';
  font-size: ${FontSizes.caption.large};
`;

const VoiceButton = styled.TouchableOpacity`
  position: absolute;
  right: 0px;
  ${Platform.OS === 'android' && `bottom: 0px;`}
  background-color: ${themes.light.bgColor.bgPrimary};
  width: 50px;
  height: 50px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  /* Android 그림자 */
  elevation: 5;

  /* iOS 그림자 */
  shadow-color: #000;
  shadow-offset: 2px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
`;

const styles = StyleSheet.create({
  bubbleComponent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    right: 0,
    bottom: Platform.OS === 'ios' ? 30 : 60,
  },
});

const Usage = ({label, value='', borderBottomWidth = 1, fontSizeMode}) => {
  const [expanded, setExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const textRef = useRef(null);

  // 컴포넌트 마운트 후 텍스트 길이 예상 계산
  useEffect(() => {
    // 텍스트 길이로 토글 버튼 표시 여부 결정
    // 평균적으로 한 줄에 표시되는 글자 수를 고려하여 계산
    const averageCharsPerLine = 30; // 화면 크기와 폰트에 따라 조정 필요
    const estimatedLines = Math.ceil(value.length / averageCharsPerLine);
    setShouldShowToggle(estimatedLines > 5);

    // 실제 레이아웃 측정 시도 (iOS에서는 더 정확하게 작동)
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        if (textRef.current) {
          textRef.current.measure((x, y, width, height) => {
            const lineHeight = 26; // 라인 높이
            const estimatedLinesFromHeight = Math.floor(height / lineHeight);
            setShouldShowToggle(estimatedLinesFromHeight > 5);
          });
        }
      }, 100);
    }
  }, [value]);

  return (
    <View
      style={{
        paddingVertical: 24,
        paddingHorizontal: 20,
        gap: 12,
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

        {shouldShowToggle && (
          <TouchableOpacity
            style={{paddingVertical: 8, paddingLeft: 8}}
            onPress={() => setExpanded(!expanded)}>
            <OtherIcons.chevronDown
              width={17}
              height={17}
              style={{
                color: themes.light.textColor.Primary30,
                transform: expanded ? [{rotate: '180deg'}] : [],
              }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 실제 표시되는 텍스트 */}
      <Text
        ref={textRef}
        numberOfLines={expanded ? undefined : 5}
        style={{
          color: themes.light.textColor.Primary70,
          fontFamily: 'Pretendard-Medium',
          fontSize: FontSizes.body[fontSizeMode],
          lineHeight: 26,
        }}>
        {value}
      </Text>
    </View>
  );
};

const HeadingText = styled.Text`
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]};
`;

export default MedicineDetailScreen;
