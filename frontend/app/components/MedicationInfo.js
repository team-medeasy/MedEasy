import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components/native';
import { pointColor, themes } from '../styles';
import KarteIcon from '../../assets/icons/karte.svg';
import LogoIcon from '../../assets/icons/logo/logo.svg';
import FontSizes from '../../assets/fonts/fontSizes';
import { useFontSize } from '../../assets/fonts/FontSizeContext';
import { getUserUsageDays } from '../api/user';
import { getUserMedicineCount } from '../api/user';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const MedicationInfo = () => {
  const navigation = useNavigation();
  const {fontSizeMode} = useFontSize();
  const [daysSinceJoin, setDaysSinceJoin] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  
  const fetchData = useCallback(async () => {
    try {
      const [usageResponse, medicineResponse] = await Promise.all([
        getUserUsageDays(),
        getUserMedicineCount()
      ]);

      const usageData = usageResponse.data?.body || usageResponse.data;
      const countData = medicineResponse.data?.body || medicineResponse.data;

      if (usageData?.usage_days !== undefined) {
        setDaysSinceJoin(usageData.usage_days);
      }
      if (countData?.medicine_count !== undefined) {
        setMedicineCount(countData.medicine_count);
      }
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
    }
  }, []);

  // 🔹 화면이 포커스될 때마다 fetchData 실행
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleMedicineList = () => {
    navigation.navigate('MedicineList');
  };
  
  return (
    <Container>
      <BGStyle />
      <DaysSinceMedication>
        <TextContainer>
          <WithMedeasy fontSizeMode={fontSizeMode}>메디지와 함께</WithMedeasy>
          <InfoText fontSizeMode={fontSizeMode}>약 챙겨먹은지 </InfoText>
          <InfoNum fontSizeMode={fontSizeMode}>{daysSinceJoin}일째</InfoNum>
        </TextContainer>
        <IconWrapper>
          <KarteIcon
            width={90}
            height={90}
            style={{ color: themes.light.boxColor.tagDetailPrimary }}
          />
        </IconWrapper>
      </DaysSinceMedication>
      <MedicationCount onPress={handleMedicineList}>
        <TextContainer>
          <WithMedeasy fontSizeMode={fontSizeMode}>메디지와 함께</WithMedeasy>
          <InfoText fontSizeMode={fontSizeMode}>복용중인 약 </InfoText>
          <InfoNum fontSizeMode={fontSizeMode}>{medicineCount}개</InfoNum>
        </TextContainer>
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

const MedicationCount = styled.TouchableOpacity`
  background-color: ${pointColor.pointPrimaryDark};
  padding: 15px;
  width: 49%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
`;

const TextContainer = styled.View`
  position: relative;
  z-index: 1;
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
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode]};
  color: ${themes.light.textColor.buttonText};
  padding-bottom: 10px;
`;

const InfoText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText70};
`;

const InfoNum = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]};
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

export default MedicationInfo;