import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { Header } from '../../components';

import { getUserMedicineCount } from '../../api/user';
import { getMedicineById } from '../../api/medicine';


const MedicineList = () => {
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


    return (
        <Container>
            <Header>
                <Title>복용 중인 약 리스트</Title>
            </Header>
            <ListContainer>
                <MedicineCount>총 개수: {medicineCount}개</MedicineCount>
                {medicineList.length > 0 ? (
                    medicineList.map((medicine, index) => (
                        <MedicineName key={medicine.id || index}>
                            {medicine.item_name}
                        </MedicineName>
                    ))
                ) : (
                    <MedicineName>복용 중인 약이 없습니다.</MedicineName>
                )}
            </ListContainer>
        </Container>
    );
};

const Container = styled.View``;

const Title = styled.Text``;

const ListContainer = styled.View``;

const MedicineCount = styled.Text``;

const MedicineName = styled.Text``;


export default MedicineList;