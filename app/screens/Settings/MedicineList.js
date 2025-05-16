import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FlatList, ActivityIndicator, Platform} from 'react-native';
import {Header, MedicineListItem} from '../../components';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {useNavigation} from '@react-navigation/native';

import {getUserMedicinesCurrent, getUserMedicinesPast} from '../../api/user';
import EmptyState from '../../components/EmptyState';
import {Images} from '../../../assets/icons';

const MedicineList = () => {
  const navigation = useNavigation();
  const {fontSizeMode} = useFontSize();
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'previous'
  const [medicineCount, setMedicineCount] = useState(0);
  const [currentMedicines, setCurrentMedicines] = useState([]);
  const [previousMedicines, setPreviousMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets(); // SafeArea 인셋 가져오기

  useEffect(() => {
    fetchMedicineData();
  }, []);

  const fetchMedicineData = async () => {
    try {
      setLoading(true);

      // 1. 현재 복용 중인 약 데이터 가져오기
      const currentResponse = await getUserMedicinesCurrent();
      const currentMedicines = currentResponse.data?.body || [];

      // 2. 이전에 복용한 약 데이터 가져오기
      const pastResponse = await getUserMedicinesPast();
      const pastMedicines = pastResponse.data?.body || [];

      // 3. 약 개수 계산
      const uniqueMedicineIds = new Set([
        ...currentMedicines.map(item => item.medicine_id),
        ...pastMedicines.map(item => item.medicine_id),
      ]);
      setMedicineCount(uniqueMedicineIds.size);

      // 4. 각각 설정
      setCurrentMedicines(currentMedicines);
      setPreviousMedicines(pastMedicines);

      console.log('현재 복용 중인 약:', currentMedicines.length);
      console.log('이전에 복용한 약:', pastMedicines.length);
    } catch (error) {
      console.error('약 데이터 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupMedicines = medicines => {
    const grouped = {};

    medicines.forEach(item => {
      const key = item.medicine_id;
      if (!grouped[key]) {
        grouped[key] = {
          ...item, // 대표 약 정보
          routines: [],
        };
      }

      grouped[key].routines.push({
        routine_start_date: item.routine_start_date,
        routine_end_date: item.routine_end_date,
        schedule_size: item.schedule_size,
        dose: item.dose,
        interval_days: item.interval_days,
      });
    });

    return Object.values(grouped);
  };

  const renderTabContent = () => {
    const rawData =
      activeTab === 'current' ? currentMedicines : previousMedicines;
    const data = groupMedicines(rawData);

    const emptyMessage =
      activeTab === 'current'
        ? '현재 복용 중인 약이 없습니다.'
        : '이전에 복용한 약이 없습니다.';

    if (loading) {
      return <ActivityIndicator fontSizeMode={fontSizeMode} />;
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.medicine_id}-${index}`}
        renderItem={({item}) => (
          <MedicineListItem
            item={item}
            onPress={() =>
              navigation.navigate('MedicineDetail', {
                medicineId: item.medicine_id,
                title: item.medicine_name,
                basicInfo: {
                  item_name: item.medicine_name,
                  entp_name: item.entp_name,
                  class_name: item.class_name,
                  etc_otc_name: item.etc_otc_name,
                  item_image: item.medicine_image,
                },
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom:
            Platform.OS === 'android'
              ? insets.bottom + 10
              : insets.bottom
          }}
        ListEmptyComponent={
          <EmptyContainer>
            <EmptyState
              image={<Images.emptyRoutine style={{marginBottom: 32}} />}
              title={emptyMessage}
              description={
                activeTab === 'current'
                  ? `약을 검색해\n복용 루틴을 추가해 보세요.`
                  : `약을 검색해\n복용 루틴을 추가해 보세요.`
              }
            />
          </EmptyContainer>
        }
      />
    );
  };

  return (
    <Container>
      <Header hideBorder>약 목록</Header>

      {/* 탭 영역 */}
      <TabContainer>
        <TabButton
          active={activeTab === 'current'}
          onPress={() => setActiveTab('current')}>
          <TabText active={activeTab === 'current'} fontSizeMode={fontSizeMode}>
            현재 복용중인 약
          </TabText>
        </TabButton>
        <TabButton
          active={activeTab === 'previous'}
          onPress={() => setActiveTab('previous')}>
          <TabText
            active={activeTab === 'previous'}
            fontSizeMode={fontSizeMode}>
            이전에 복용한 약
          </TabText>
        </TabButton>
      </TabContainer>

      {/* 선택된 탭에 따른 콘텐츠 */}
      <ListContainer>{renderTabContent()}</ListContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const EmptyContainer = styled.View`
  margin-top: 100px;
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const TabButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px 0;
  align-items: center;
  border-bottom-width: ${props => (props.active ? '2px' : '1px')};
  border-bottom-color: ${props =>
    props.active
      ? themes.light.textColor.textPrimary
      : themes.light.borderColor.borderSecondary};
`;

const TabText = styled.Text`
  font-family: 'Pretendard-SemiBold';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${props =>
    props.active
      ? themes.light.textColor.textPrimary
      : themes.light.textColor.Primary30};
`;

const ListContainer = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
  padding-right: 16px;
`;

const NoResultContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
`;

const NoResultText = styled.Text`
  text-align: center;
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.Primary50};
`;

export default MedicineList;
