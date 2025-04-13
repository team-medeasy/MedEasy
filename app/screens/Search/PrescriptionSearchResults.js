import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';
import styled from 'styled-components/native';
import { themes } from '../../styles';
import {
  Header,
  Button,
  NoSearchResults,
} from '../../components';
import FontSizes from '../../../assets/fonts/fontSizes';
import { searchPrescriptionByImage } from '../../api/prescriptionSearch';

const PrescriptionSearchResultsScreen = ({ route, navigation }) => {
  // 이미지 경로 가져오기
  const { photoUri } = route.params || {};
  
  // 상태 관리
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);
  
  // 처방전 분석 요청
  const analyzePrescription = async () => {
    if (!photoUri) {
      setError('처방전 이미지가 없습니다.');
      setLoading(false);
      setNoResults(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // API 호출
      console.log('처방전 분석 요청:', photoUri);
      const response = await searchPrescriptionByImage(photoUri);
      
      // 응답 데이터 처리
      if (response.body && response.body.length > 0) {
        console.log('처방전 분석 결과:', response.body);
        setPrescriptionData(response.body);
        setNoResults(false);
      } else {
        console.log('처방전에서 약 정보를 찾을 수 없음');
        setNoResults(true);
        setPrescriptionData([]);
      }
    } catch (err) {
      console.error('처방전 분석 오류:', err);
      setError('처방전 분석 중 오류가 발생했습니다.');
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 처방전 분석 실행
  useEffect(() => {
    analyzePrescription();
  }, [photoUri]);
  
  // 약 상세 정보 페이지로 이동
  const handleMedicinePress = (medicine) => {
    navigation.navigate('MedicineDetail', { item: medicine });
  };
  
  // 루틴 등록 처리
  const handleRegisterRoutines = () => {
    if (prescriptionData.length === 0) {
      Alert.alert('알림', '등록할 약 정보가 없습니다.');
      return;
    }
    
    // 루틴 등록 요청 데이터 생성
    const routineRequests = prescriptionData.map(medicine => ({
      medicine_id: medicine.medicine_id,
      nickname: medicine.medicine_name,
      dose: medicine.dose,
      total_quantity: medicine.total_quantity,
      day_of_weeks: medicine.day_of_weeks,
      // 추천된 스케줄만 필터링
      user_schedule_ids: medicine.user_schedules
        .filter(schedule => schedule.recommended)
        .map(schedule => schedule.user_schedule_id)
    }));
    
    // 루틴 등록 화면으로 이동
    navigation.navigate('RoutineRegister', { 
      routineRequests,
      fromPrescription: true
    });
  };
  
  // 처방전 내용 수정 화면으로 이동
  const handleModifyContent = () => {
    navigation.navigate('ModifyPrescription', {
      prescriptionData
    });
  };

  // 요일 표시 헬퍼 함수
  const formatDayOfWeek = (dayNumbers) => {
    if (!dayNumbers || dayNumbers.length === 0) return '매일';
    if (dayNumbers.length === 7) return '매일';
    
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    return dayNumbers.map(day => days[day - 1]).join(', ');
  };
  
  // 시간 포맷팅 함수
  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    
    const hour = String(timeObj.hour).padStart(2, '0');
    const minute = String(timeObj.minute).padStart(2, '0');
    
    return `${hour}:${minute}`;
  };

  // 처방전 검색 결과 렌더링 함수
  const renderPrescriptionItem = ({ item, index }) => {
    return (
      <MedicineItem onPress={() => handleMedicinePress(item)}>
        {/* 약 이미지 */}
        <ImageContainer>
          {item.image_url ? (
            <MedicineImage source={{ uri: item.image_url }} />
          ) : (
            <NoImageContainer>
              <NoImageText>이미지 없음</NoImageText>
            </NoImageContainer>
          )}
        </ImageContainer>
        
        {/* 약 정보 */}
        <InfoContainer>
          <HeaderRow>
            <MedicineName numberOfLines={1} ellipsizeMode="tail">
              {item.medicine_name}
            </MedicineName>
            {item.etc_otc_name && (
              <MedicineType>{item.etc_otc_name}</MedicineType>
            )}
          </HeaderRow>
          
          <CompanyName numberOfLines={1} ellipsizeMode="tail">
            {item.entp_name}
          </CompanyName>
          
          <DetailRow>
            <DetailLabel>용량:</DetailLabel>
            <DetailValue>{item.dose}정</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>총 수량:</DetailLabel>
            <DetailValue>{item.total_quantity}정</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>복용 주기:</DetailLabel>
            <DetailValue>{formatDayOfWeek(item.day_of_weeks)}</DetailValue>
          </DetailRow>
          
          {/* 권장 복용 시간 */}
          {item.user_schedules && item.user_schedules.length > 0 && (
            <ScheduleSection>
              <ScheduleLabel>권장 복용 시간:</ScheduleLabel>
              <ScheduleList>
                {item.user_schedules.map((schedule, idx) => (
                  <ScheduleItem 
                    key={`schedule-${idx}`} 
                    isRecommended={schedule.recommended}
                  >
                    <ScheduleTime>{formatTime(schedule.take_time)}</ScheduleTime>
                    <ScheduleName>{schedule.name}</ScheduleName>
                    {schedule.recommended && (
                      <RecommendBadge>권장</RecommendBadge>
                    )}
                  </ScheduleItem>
                ))}
              </ScheduleList>
            </ScheduleSection>
          )}
        </InfoContainer>
      </MedicineItem>
    );
  };

  return (
    <Container>
      <Header onBackPress={() => navigation.goBack()}>
        처방전 분석 결과
      </Header>
      
      <ContentView>
        <TitleSection>
          <TitleText>이대로 루틴을 등록할까요?</TitleText>
          <SubtitleText>메디지가 일정에 맞춰 복약 알림을 보내드릴게요!</SubtitleText>
        </TitleSection>
        
        <ResultsContainer>
          {loading ? (
            <LoadingView>
              <ActivityIndicator size="large" color={themes.light.pointColor.Primary} />
              <LoadingText>처방전을 분석하고 있어요...</LoadingText>
            </LoadingView>
          ) : error ? (
            <ErrorView>
              <ErrorText>{error}</ErrorText>
              <RetryButton onPress={analyzePrescription}>
                <RetryText>다시 시도</RetryText>
              </RetryButton>
            </ErrorView>
          ) : noResults ? (
            <NoSearchResults 
              message="처방전에서 약 정보를 찾을 수 없습니다."
              subMessage="다른 각도나 밝은 환경에서 다시 촬영해보세요."
            />
          ) : (
            <FlatList
              data={prescriptionData}
              renderItem={renderPrescriptionItem}
              keyExtractor={(item, index) => `prescription-item-${index}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </ResultsContainer>
      </ContentView>
      
      <BottomButtonContainer>
        <Button 
          title="이대로 등록하기" 
          onPress={handleRegisterRoutines}
          disabled={loading || noResults || prescriptionData.length === 0}
        />
        <ModifyButton 
          onPress={handleModifyContent}
          disabled={loading || noResults || prescriptionData.length === 0}
        >
          <ModifyText>내용을 수정하고 싶어요.</ModifyText>
        </ModifyButton>
      </BottomButtonContainer>
    </Container>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 10,
  },
});

// 스타일 컴포넌트
const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const ContentView = styled.View`
  flex: 1;
  padding-top: 20px;
`;

const TitleSection = styled.View`
  padding-horizontal: 30px;
  margin-bottom: 30px;
`;

const TitleText = styled.Text`
  font-family: 'KimjungchulGothic-Bold';
  font-size: ${FontSizes.title.default};
  color: ${themes.light.textColor.textPrimary};
  margin-bottom: 5px;
`;

const SubtitleText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.Primary50};
`;

const ResultsContainer = styled.View`
  flex: 1;
  margin-bottom: 100px;
`;

const LoadingView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoadingText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.textSecondary};
  margin-top: 15px;
`;

const ErrorView = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ErrorText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.textPrimary};
  text-align: center;
  margin-bottom: 20px;
`;

const RetryButton = styled.TouchableOpacity`
  background-color: ${themes.light.pointColor.Primary};
  padding-vertical: 10px;
  padding-horizontal: 20px;
  border-radius: 8px;
`;

const RetryText = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.body.default};
  color: white;
`;

const BottomButtonContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: ${themes.light.bgColor.bgPrimary};
  border-top-width: 1px;
  border-top-color: ${themes.light.borderColor.BorderSecondary};
  align-items: center;
`;

const ModifyButton = styled.TouchableOpacity`
  margin-top: 15px;
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const ModifyText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.Primary50};
  text-decoration: underline;
  text-decoration-color: ${themes.light.textColor.Primary50};
`;

// 약 아이템 스타일 컴포넌트
const MedicineItem = styled.TouchableOpacity`
  flex-direction: row;
  background-color: ${themes.light.bgColor.bgSecondary};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

const ImageContainer = styled.View`
  width: 80px;
  height: 80px;
  margin-right: 16px;
`;

const MedicineImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: #f0f0f0;
`;

const NoImageContainer = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: #f0f0f0;
  justify-content: center;
  align-items: center;
`;

const NoImageText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.caption.small};
  color: ${themes.light.textColor.textTertiary};
  text-align: center;
`;

const InfoContainer = styled.View`
  flex: 1;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const MedicineName = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.body.default};
  color: ${themes.light.textColor.textPrimary};
  flex: 1;
`;

const MedicineType = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.caption.small};
  color: ${themes.light.pointColor.Primary};
  background-color: ${themes.light.bgColor.bgTertiary};
  padding-vertical: 2px;
  padding-horizontal: 6px;
  border-radius: 4px;
  margin-left: 8px;
`;

const CompanyName = styled.Text`
  font-family: 'Pretendard-Regular';
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.textSecondary};
  margin-bottom: 10px;
`;

const DetailRow = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
`;

const DetailLabel = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.textTertiary};
  width: 70px;
`;

const DetailValue = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.textSecondary};
  flex: 1;
`;

const ScheduleSection = styled.View`
  margin-top: 10px;
  padding-top: 10px;
  border-top-width: 1px;
  border-top-color: ${themes.light.borderColor.BorderSecondary};
`;

const ScheduleLabel = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.textTertiary};
  margin-bottom: 8px;
`;

const ScheduleList = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const ScheduleItem = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.isRecommended ? 'rgba(76, 175, 80, 0.1)' : themes.light.bgColor.bgTertiary};
  border-radius: 6px;
  padding: 6px 10px;
  margin-right: 8px;
  margin-bottom: 6px;
  border-width: ${props => props.isRecommended ? '1px' : '0px'};
  border-color: ${themes.light.pointColor.Secondary};
`;

const ScheduleTime = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.textPrimary};
`;

const ScheduleName = styled.Text`
  font-family: 'Pretendard-Regular';
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.textSecondary};
  margin-left: 5px;
`;

const RecommendBadge = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.caption.small};
  color: ${themes.light.pointColor.Secondary};
  margin-left: 5px;
`;

export default PrescriptionSearchResultsScreen;