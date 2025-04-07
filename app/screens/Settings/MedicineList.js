import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { Header, MedicineListItem } from '../../components';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';

import { getUserMedicineCount } from '../../api/user';
import { getMedicineById } from '../../api/medicine';

const MedicineList = () => {
    const [activeTab, setActiveTab] = useState('current'); // 'current' or 'previous'
    const [medicineCount, setMedicineCount] = useState(0);
    const [medicineList, setMedicineList] = useState([]);
    const [medicineIds, setMedicineIds] = useState([]);

    useEffect(() => {
        // 사용자 약 개수 및 ID 목록 가져오기
        const fetchUserMedicineData = async () => {
            try {
                const response = await getUserMedicineCount();
                const countData = response.data?.body || response.data;

                if (countData) {
                    // 약 개수 설정
                    if (countData.medicine_count !== undefined) {
                        setMedicineCount(countData.medicine_count);
                    }

                    // medicine_ids 데이터가 있는 경우 상태 업데이트 후 약 정보 가져오기
                    if (countData.medicine_ids && Array.isArray(countData.medicine_ids)) {
                        setMedicineIds(countData.medicine_ids);
                        console.log('사용자 약 ID 목록:', countData.medicine_ids);

                        // 약 ID를 기반으로 약 정보 가져오기
                        fetchMedicineDetails(countData.medicine_ids);
                    }
                }
            } catch (error) {
                console.error('사용자 약 개수 및 ID 가져오기 실패:', error);
            }
        };

        fetchUserMedicineData();
    }, []);

    const fetchMedicineDetails = async (ids) => {
        try {
            const medicineDataPromises = ids.map(id => getMedicineById(id));
            const medicineResponses = await Promise.all(medicineDataPromises);

            const medicines = medicineResponses.map(response => response.data?.body || response.data);
            setMedicineList(medicines);

            console.log('사용자 약 정보:', medicines);
        } catch (error) {
            console.error('사용자 약 정보 가져오기 실패:', error);
        }
    };

    const renderTabContent = () => {
        if (activeTab === 'current') {
            return (
                <FlatList
                    data={medicineList}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={({ item }) => <MedicineListItem item={item} />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <NoResultContainer>
                            <NoResultText>현재 복용 중인 약이 없습니다.</NoResultText>
                        </NoResultContainer>
                    }
                />
            );
        } else {
            return (
                <NoResultContainer>
                    <NoResultText>이전에 복용한 약 기록이 없습니다.</NoResultText>
                </NoResultContainer>
            );
        }
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