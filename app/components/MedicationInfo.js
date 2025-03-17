import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { pointColor, themes } from '../styles';
import KarteIcon from '../../assets/icons/karte.svg';
import LogoIcon from '../../assets/icons/logo/logo.svg';
import FontSizes from '../../assets/fonts/fontSizes';
import { getUser } from '../api/user'; // API import 추가

const MedicationInfo = ({ medicationCount }) => {
  const [joinDate, setJoinDate] = useState('');
  const [daysSinceJoin, setDaysSinceJoin] = useState(0);
  
  useEffect(() => {
    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await getUser();
        const userData = response.data?.data || response.data?.body || response.data;

        const registeredAt = userData.registered_at;
        if (registeredAt) {
          const registeredDate = new Date(registeredAt);
          const today = new Date();
          
          // 날짜 차이 계산 (밀리초 단위)
          const diffTime = Math.abs(today - registeredDate);
          // 일 단위로 변환 (소수점 버림)
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))+1;
          
          setDaysSinceJoin(diffDays);
          
          // 가입 날짜 포맷팅
          const formattedDate = `${registeredDate.getFullYear()}.${(registeredDate.getMonth() + 1).toString().padStart(2, '0')}.${registeredDate.getDate().toString().padStart(2, '0')}`;
          setJoinDate(formattedDate);
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
      }
    };
    
    fetchUserInfo();
  }, []);

  return (
    <Container>
      <BGStyle />
      <DaysSinceMedication>
        <WithMedeasy>메디지와 함께</WithMedeasy>
        <InfoText>약 챙겨먹은지 </InfoText>
        <InfoNum>{daysSinceJoin}일째</InfoNum>
        <IconWrapper>
          <KarteIcon
            width={90}
            height={90}
            style={{ color: themes.light.boxColor.tagDetailPrimary }}
          />
        </IconWrapper>
      </DaysSinceMedication>
      <MedicationCount>
        <WithMedeasy>메디지와 함께</WithMedeasy>
        <InfoText>복용중인 약 </InfoText>
        <InfoNum>{medicationCount}개</InfoNum>
        <IconWrapper>
          <LogoIcon style={{ color: themes.light.boxColor.tagDetailPrimary }} />
        </IconWrapper>
      </MedicationCount>
    </Container>
  );
};

const Container = styled.View`
  flex-direction: row;
  justify-content: center;
  padding: 0px 20px;
  background-color: ${themes.light.bgColor.bgPrimary};
  gap: 10px;
`;

const BGStyle = styled.View`
  position: absolute;
  height: 60%;
  top: -10px;
  right: -28px;
  left: -28px;
  border-radius: 448px;
  background-color: ${themes.light.boxColor.buttonPrimary};
  overflow: hidden;
`;

const DaysSinceMedication = styled.View`
  background-color: ${pointColor.pointPrimary};
  padding: 15px;
  width: 49%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
`;

const MedicationCount = styled.View`
  background-color: ${pointColor.pointPrimaryDark};
  padding: 15px;
  width: 49%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
`;

const IconWrapper = styled.View`
  position: absolute;
  transform: rotate(8deg);
  overflow: hidden;
  bottom: -10px;
  right: 20px;
`;

const WithMedeasy = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${FontSizes.caption.default};
  color: ${themes.light.textColor.buttonText};
  padding-bottom: 10px;
`;

const InfoText = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText70};
`;

const InfoNum = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

export default MedicationInfo;