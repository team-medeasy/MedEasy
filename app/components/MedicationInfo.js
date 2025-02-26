import React from 'react';
import styled from 'styled-components/native';
import {pointColor, themes} from '../styles';
import KarteIcon from '../../assets/icons/karte.svg';
import LogoIcon from '../../assets/icons/logo/logo.svg';

const MedicationInfo = ({days, medicationCount}) => {
  return (
    <Container>
      <DaysSinceMedication>
        <WithMedeasy>메디지와 함께</WithMedeasy>
        <InfoText>약 챙겨먹은지 </InfoText>
        <InfoNum>{days}일째</InfoNum>
        <IconWrapper>
          <KarteIcon
            width={90}
            height={90}
            style={{color: themes.light.boxColor.tagDetailPrimary}}
          />
        </IconWrapper>
      </DaysSinceMedication>
      <MedicationCount>
        <WithMedeasy>메디지와 함께</WithMedeasy>
        <InfoText>복용중인 약 </InfoText>
        <InfoNum>{medicationCount}개</InfoNum>
        <IconWrapper>
          <LogoIcon style={{color: themes.light.boxColor.tagDetailPrimary}} />
        </IconWrapper>
      </MedicationCount>
    </Container>
  );
};

const Container = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: ${themes.light.boxColor.buttonPrimary};
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
  font-size: 12px;
  font-family: 'Pretendard-Regular';
  color: ${themes.light.textColor.buttonText};
  padding-bottom: 10px;
`;

const InfoText = styled.Text`
  font-size: 18px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText70};
`;

const InfoNum = styled.Text`
  font-size: 18px;
  font-family: 'KimjungchulGothic-Bold';
  color: ${themes.light.textColor.buttonText};
`;

export default MedicationInfo;
