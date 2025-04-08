import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { Header, MedicineListItem } from '../../components';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';

import { getUserMedicineCount } from '../../api/user';
import { getMedicineById } from '../../api/medicine';
import { getUserMedicinesCurrent } from '../../api/user';

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
            // 1. 사용자 약 ID 목록 가져오기
            const countResponse = await getUserMedicineCount();
            const countData = countResponse.data?.body || countResponse.data;
            
            if (countData && countData.medicine_ids && Array.isArray(countData.medicine_ids)) {
                if (countData.medicine_count !== undefined) {
                    setMedicineCount(countData.medicine_count);
                }
                
                // 2. 각 약의 상세 정보 가져오기
                const medicineDataPromises = countData.medicine_ids.map(id => getMedicineById(id));
                const medicineResponses = await Promise.all(medicineDataPromises);
                const medicines = medicineResponses.map(response => response.data?.body || response.data);
                
                // 3. 복용 루틴 정보 가져오기
                const routinesResponse = await getUserMedicinesCurrent();
                const routines = routinesResponse.data?.body || [];

                // 4. 약을 현재/이전 카테고리로 분류
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const current = [];
                const previous = [];
                
                // 각 약에 대해 루틴 정보 찾기
                medicines.forEach(medicine => {
                    const matchedRoutine = routines.find(
                        routine => routine.medicine_id === medicine.id
                    );
                    
                    if (matchedRoutine) {
                        // 종료일이 있고 오늘보다 이전인지 확인
                        if (matchedRoutine.routine_end_date) {
                            const endDate = new Date(matchedRoutine.routine_end_date);
                            endDate.setHours(0, 0, 0, 0);
                            
                            if (endDate < today) {
                                // 종료일이 오늘보다 이전이면 이전 약으로 분류
                                previous.push({
                                    ...medicine,
                                    routineInfo: matchedRoutine
                                });
                            } else {
                                // 그 외에는 현재 약으로 분류
                                current.push({
                                    ...medicine,
                                    routineInfo: matchedRoutine
                                });
                            }
                        } else {
                            // 종료일이 없으면 현재 약으로 분류
                            current.push({
                                ...medicine,
                                routineInfo: matchedRoutine
                            });
                        }
                    } else {
                        // 루틴 정보가 없으면 일단 현재 약으로 분류
                        current.push(medicine);
                    }
                });
                
                setCurrentMedicines(current);
                setPreviousMedicines(previous);
                console.log('현재 복용 중인 약:', current.length);
                console.log('이전에 복용한 약:', previous.length);
            }
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
            : '이전에 복용한 약 기록이 없습니다.';
            
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