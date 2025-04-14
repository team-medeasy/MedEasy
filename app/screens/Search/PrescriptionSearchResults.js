import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { View, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { themes } from './../../styles';
import {
  Header,
  PrescriptionSearchResultsList,
  NoSearchResults,
  Button
} from '../../components';
import { searchPrescriptionByImage } from '../../api/prescriptionSearch';
import { getMedicineDetailByMedicineId } from '../../api/search';
import FontSizes from '../../../assets/fonts/fontSizes';

const PrescriptionSearchResultsScreen = ({ navigation, route }) => {
  // route.params에서 photoUri 가져오기
  const { photoUri } = route.params || {};
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);

  // API 응답 데이터를 저장할 상태 변수
  const [originalResponseData, setOriginalResponseData] = useState([]);

  // 처방전 분석 함수
  const analyzePrescription = async () => {
    if (!photoUri) {
      setNoResults(true);
      setLoading(false);
      return;
    }

    try {
      const response = await searchPrescriptionByImage(photoUri);
      console.log('API 응답 전체:', response);

      // API 응답 확인
      if (response && response.body && response.body.length > 0 && response.result && response.result.result_code === 200) {
        // 원본 응답 데이터 저장
        setOriginalResponseData(response.body);

        // API 응답 데이터를 기존 앱 구조에 맞게 변환
        const formattedResults = response.body.map((item, index) => {
          const formatted = {
            // 기본 정보
            item_name: item.medicine_name,
            entp_name: item.entp_name || '정보 없음',
            item_image: item.image_url,
            class_name: item.class_name || '일반의약품',
            etc_otc_name: item.etc_otc_name || '일반의약품',
            // id
            original_id: item.medicine_id,
            uniqueKey: `${item.medicine_id}_${index}`, // 고유 키 생성
            // 복용 정보
            dose: item.dose,
            total_days: item.total_days,
            total_quantity: item.total_quantity,
            day_of_weeks: item.day_of_weeks,
            user_schedules: item.user_schedules
          };
          return formatted;
        });

        console.log('변환된 검색 결과:', formattedResults);

        // 검색 결과 설정
        setSearchResults(formattedResults);
        setNoResults(false);
      } else {
        console.error('API 에러 응답:', response);
        setSearchResults([]);
        setNoResults(true);
      }
    } catch (e) {
      console.error('분석 오류:', e);
      if (e.response) {
        console.error('에러 응답:', e.response.data);
        console.error('에러 상태:', e.response.status);
      } else if (e.request) {
        console.error('요청 에러:', e.request);
      } else {
        console.error('에러 메시지:', e.message);
      }
      setError('처방전 분석 중 오류가 발생했습니다.');
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    analyzePrescription();
  }, [photoUri]);

  // 약 상세 정보로 이동 처리
  const handleSearchResultPress = async (item) => {
    try {
      // 원본 API 응답에서 medicine_id를 기준으로 항목 찾기
      const originalItem = originalResponseData.find(
        original => original.medicine_id === item.original_id
      );
  
      if (!originalItem) {
        console.error('원본 약 데이터를 찾을 수 없습니다.');
        Alert.alert('오류', '약 정보를 불러올 수 없습니다.');
        return;
      }
  
      // 상세 정보 API 호출
      const detailResponse = await getMedicineDetailByMedicineId(originalItem.medicine_id);
      const detail = detailResponse?.body;
  
      if (!detail) {
        console.warn('상세 정보가 없어서 기본 정보만 전달합니다.');
        const fallbackItem = {
          id: originalItem.medicine_id,
          item_id: originalItem.medicine_id,
          item_name: originalItem.medicine_name,
          entp_name: originalItem.entp_name || '정보 없음',
          item_image: originalItem.image_url,
          class_name: originalItem.class_name || '일반의약품',
          etc_otc_name: originalItem.etc_otc_name || '일반의약품',
          dose: originalItem.dose,
          total_days: originalItem.total_days,
          total_quantity: originalItem.total_quantity,
          day_of_weeks: originalItem.day_of_weeks,
          user_schedules: originalItem.user_schedules,
        };
  
        navigation.navigate('MedicineDetail', { item: fallbackItem });
        return;
      }
  
      // 상세 정보가 있을 경우 병합하여 전달
      const fullItem = {
        // 기본 정보
        id: detail.id || originalItem.medicine_id,
        item_id: detail.id || originalItem.medicine_id,
        item_name: detail.item_name || originalItem.medicine_name,
        entp_name: detail.entp_name || originalItem.entp_name || '정보 없음',
        item_image: detail.item_image || originalItem.image_url,
        class_name: detail.class_name || originalItem.class_name || '일반의약품',
        etc_otc_name: detail.etc_otc_name || originalItem.etc_otc_name || '일반의약품',
  
        // 외형 정보
        drug_shape: detail.drug_shape || '',
        color_classes: detail.color_classes || '',
        print_front: detail.print_front || '',
        print_back: detail.print_back || '',
        leng_long: detail.leng_long || '',
        leng_short: detail.leng_short || '',
        thick: detail.thick || '',
        chart: detail.chart || '',
  
        // 복용 정보 (처방전에서 온 것 유지)
        dose: originalItem.dose,
        total_days: originalItem.total_days,
        total_quantity: originalItem.total_quantity,
        day_of_weeks: originalItem.day_of_weeks,
        user_schedules: originalItem.user_schedules,
  
        // 부가 정보
        indications: detail.indications || '',
        dosage: detail.dosage || originalItem.dose || '',
        storage_method: detail.storage_method || '',
        precautions: detail.precautions || '',
        side_effects: detail.side_effects || '',
      };
  
      navigation.navigate('MedicineDetail', { item: fullItem });
    } catch (error) {
      console.error('약 상세 정보 가져오기 실패:', error);
      Alert.alert('오류', '약 정보를 가져오는 중 문제가 발생했습니다.');
  
      // 에러 시 기본 정보만 전달
      const fallbackItem = {
        id: item.original_id,
        item_id: item.original_id,
        item_name: item.item_name,
        entp_name: item.entp_name || '정보 없음',
        item_image: item.item_image,
        class_name: item.class_name || '일반의약품',
        etc_otc_name: item.etc_otc_name || '일반의약품',
      };
  
      navigation.navigate('MedicineDetail', { item: fallbackItem });
    }
  };  

  // 루틴 등록 처리
  const handleRegisterRoutines = () => {
    if (searchResults.length === 0) return;

    const routineRequests = originalResponseData.map(medicine => ({
      medicine_id: medicine.medicine_id,
      nickname: medicine.medicine_name,
      dose: medicine.dose,
      total_days: medicine.total_days || 0,
      total_quantity: medicine.total_quantity || 0,
      day_of_weeks: medicine.day_of_weeks || [1, 2, 3, 4, 5, 6, 7],
      user_schedule_ids: medicine.user_schedules
        .filter(schedule => schedule.recommended === true)
        .map(schedule => schedule.user_schedule_id)
    }));

    navigation.navigate('RoutineRegister', {
      routineRequests,
      fromPrescription: true
    });
  };

  // 내용 수정 처리
  const handleModifyContent = () => {
    navigation.navigate('ModifyPrescription', {
      prescriptionData: originalResponseData
    });
  };

  return (
    <Container>
      <Header 
        onBackPress={() => navigation.goBack()}
      >약 검색 결과</Header>

      <View style={{
        paddingHorizontal: 30,
        paddingTop: 40,
        gap: 7,
      }}>
        <Text style={{
           fontFamily: 'KimjungchulGothic-Bold', 
           fontSize: FontSizes.title.default,
           color: themes.light.textColor.textPrimary
        }}>이대로 루틴을 등록할까요?</Text>
        <Text style={{
            fontFamily: 'Pretendard-Medium',
            fontSize: FontSizes.body.default,
            color: themes.light.textColor.Primary50
        }}>메디지가 일정에 맞춰 복약 알림을 보내드릴게요!</Text>
      </View>

      <SearchResultContainer>
        {loading ? (
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" color={themes.light.pointColor.Primary} />
            <Text>검색 중...</Text>
          </View>
        ) : noResults || searchResults.length === 0 ? (
          <NoSearchResults />
        ) : (
          <PrescriptionSearchResultsList
            searchResults={searchResults}
            handleSearchResultPress={handleSearchResultPress}
            onEndReachedThreshold={0.5}
          />
        )}
      </SearchResultContainer>

      <View style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 30,
        gap: 20,
        alignItems: 'center',
        backgroundColor: themes.light.bgColor.bgPrimary
      }}>
        <Button title='확인' onPress={handleRegisterRoutines} disabled={loading || noResults || searchResults.length === 0} />
        <ModifyButton onPress={handleModifyContent}>
          <ModifyText>내용을 수정하고 싶어요.</ModifyText>
        </ModifyButton>
      </View>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const SearchResultContainer = styled.View`
  flex: 1;
  margin-top: 37px;
  margin-bottom: 120px;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const ModifyButton = styled(TouchableOpacity)`
`;

const ModifyText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.Primary50};
  text-decoration: underline;
  text-decoration-color: ${themes.light.textColor.Primary50}; 
`;

export default PrescriptionSearchResultsScreen;