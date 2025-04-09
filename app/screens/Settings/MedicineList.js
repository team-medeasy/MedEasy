import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, View, Text, ActivityIndicator } from 'react-native';
import { Header, MedicineListItem } from '../../components';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';

import { getMedicineById } from '../../api/medicine';
import { getUserMedicinesCurrent, getUserMedicinesPast } from '../../api/user';

const MedicineList = () => {
    const [activeTab, setActiveTab] = useState('current'); // 'current' or 'previous'
    const [medicineCount, setMedicineCount] = useState(0);
    const [currentMedicines, setCurrentMedicines] = useState([]);
    const [previousMedicines, setPreviousMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicineData();
    }, []);

    const fetchMedicineData = async () => {
        try {
            setLoading(true);
            
            // 1. 현재 복용 중인 약 데이터 가져오기
            const currentResponse = await getUserMedicinesCurrent();
            const currentRoutines = currentResponse.data?.body || [];
            
            // 2. 이전에 복용한 약 데이터 가져오기
            const pastResponse = await getUserMedicinesPast();
            const pastRoutines = pastResponse.data?.body || [];
            
            // 3. 모든 약 ID 목록 추출
            const allMedicineIds = [
                ...new Set([
                    ...currentRoutines.map(item => item.medicine_id),
                    ...pastRoutines.map(item => item.medicine_id)
                ])
            ];
            
            // 4. 약 개수 업데이트
            setMedicineCount(allMedicineIds.length);
            
            // 5. 각 약의 상세 정보 가져오기
            const medicineDataPromises = allMedicineIds.map(id => getMedicineById(id));
            const medicineResponses = await Promise.all(medicineDataPromises);
            const medicinesMap = {};
            
            medicineResponses.forEach(response => {
                const medicine = response.data?.body || response.data;
                if (medicine && medicine.id) {
                    medicinesMap[medicine.id] = medicine;
                }
            });
            
            // 6. 현재 복용 중인 약과 이전에 복용한 약 목록 생성
            const current = currentRoutines.map(routine => ({
                ...medicinesMap[routine.medicine_id],
                routineInfo: routine
            })).filter(item => item.id); // id가 있는 항목만 필터링
            
            const previous = pastRoutines.map(routine => ({
                ...medicinesMap[routine.medicine_id],
                routineInfo: routine
            })).filter(item => item.id); // id가 있는 항목만 필터링
            
            setCurrentMedicines(current);
            setPreviousMedicines(previous);
            console.log('현재 복용 중인 약:', current.length);
            console.log('이전에 복용한 약:', previous.length);
            
        } catch (error) {
            console.error('약 데이터 불러오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        const data = activeTab === 'current' ? currentMedicines : previousMedicines;
        const emptyMessage = activeTab === 'current' 
            ? '현재 복용 중인 약이 없습니다.' 
            : '이전에 복용한 약이 없습니다.';

        if (loading) {
            return (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20}}>
                <ActivityIndicator
                  size="medium"
                  color={themes.light.pointColor.Primary}
                />
                <Text style={{
                  marginTop: 10,
                  fontSize: FontSizes.caption.default,
                  color: themes.light.textColor.Primary50,
                  fontFamily: 'Pretendard-Medium'
                }}>검색 중...</Text>
              </View>
            );
        }
            
        return (
            <FlatList
                data={data}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                renderItem={({ item }) => <MedicineListItem item={item} routineInfo={item.routineInfo} />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <NoResultContainer>
                        <NoResultText>{emptyMessage}</NoResultText>
                    </NoResultContainer>
                }
            />
        );
    };

    return (
        <Container>
            <Header>약 목록</Header>
            
            {/* 탭 영역 */}
            <TabContainer>
                <TabButton 
                    active={activeTab === 'current'}
                    onPress={() => setActiveTab('current')}
                >
                    <TabText active={activeTab === 'current'}>현재 복용중인 약</TabText>
                </TabButton>
                <TabButton 
                    active={activeTab === 'previous'}
                    onPress={() => setActiveTab('previous')}
                >
                    <TabText active={activeTab === 'previous'}>이전에 복용한 약</TabText>
                </TabButton>
            </TabContainer>
            
            {/* 선택된 탭에 따른 콘텐츠 */}
            <ListContainer>
                {renderTabContent()}
            </ListContainer>
        </Container>
    );
};

const Container = styled.View`
    flex: 1;
    background-color: ${themes.light.bgColor.bgPrimary};
`;

const TabContainer = styled.View`
    flex-direction: row;
    background-color: ${themes.light.bgColor.bgPrimary};
`;

const TabButton = styled.TouchableOpacity`
    flex: 1;
    padding: 16px 0;
    align-items: center;
    border-bottom-width: 2px;
    border-bottom-color: ${props => props.active ? themes.light.textColor.textPrimary : 'transparent'};
`;

const TabText = styled.Text`
    font-family: 'Pretendard-SemiBold';
    font-size: ${FontSizes.body.default};
    color: ${props => props.active ? themes.light.textColor.textPrimary : themes.light.textColor.Primary30};
`;

const ListContainer = styled.View`
    flex: 1;
    background-color: ${themes.light.bgColor.bgPrimary};
    padding: 15px;
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
    font-size: ${FontSizes.body.default};
    color: ${themes.light.textColor.Primary50};
`;

export default MedicineList;