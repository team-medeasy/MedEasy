import React from 'react';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import FontSizes from '../../assets/fonts/fontSizes';
import {themes} from '../styles';
import {RoutineIcons} from '../../assets/icons';

const RoutineCard = ({
  routine,
  index,
  allLength,
  checkedItems,
  toggleTimeCheck,
  toggleHospitalCheck,
  toggleCheck,
  isInModal = false,
  selectedDateString,
}) => {
  const navigation = useNavigation();

  return (
    <RoutineBoxContainer isInModal={isInModal}>
      {!isInModal && (
        <>
          <TimelinePoint
            type={routine.type}
            isFirst={index === 0}
            isLast={index === allLength - 1}
          />
          <TimelineBigPoint
            type={routine.type}
            isFirst={index === 0}
            isLast={index === allLength - 1}
          />
        </>
      )}

      <RoutineContainer isInModal={isInModal}>
        {routine.type === 'medicine' ? (
          <TimeContainer>
            <IconContainer>
              <RoutineIcons.medicine
                width={22}
                height={22}
                style={{color: themes.light.pointColor.Primary}}
              />
            </IconContainer>
            <TextContainer>
              <TypeText>{routine.label}</TypeText>
              <TimeText>{routine.time}</TimeText>
            </TextContainer>
            <CheckBox onPress={() => toggleTimeCheck(routine.timeKey)}>
              {routine.medicines.every(
                medicine =>
                  checkedItems[
                    `${selectedDateString}-${routine.timeKey}-${medicine.medicine_id}`
                  ],
              ) ? (
                <RoutineIcons.checkOn
                  width={26}
                  height={26}
                  style={{color: themes.light.pointColor.Primary}}
                />
              ) : (
                <RoutineIcons.checkOff
                  width={26}
                  height={26}
                  style={{color: themes.light.boxColor.inputSecondary}}
                />
              )}
            </CheckBox>
          </TimeContainer>
        ) : (
          <HospitalTimeContainer>
            <IconContainer>
              <RoutineIcons.hospital
                width={22}
                height={22}
                style={{color: themes.light.pointColor.Secondary}}
              />
            </IconContainer>
            <TextContainer>
              <TypeText>{routine.label}</TypeText>
              <TimeText>{routine.time}</TimeText>
            </TextContainer>
            <CheckBox
              onPress={() => toggleHospitalCheck(routine.hospital.hospital_id)}>
              {checkedItems[`hospital-${routine.hospital.hospital_id}`] ? (
                <RoutineIcons.checkOn
                  width={26}
                  height={26}
                  style={{color: themes.light.pointColor.Primary}}
                />
              ) : (
                <RoutineIcons.checkOff
                  width={26}
                  height={26}
                  style={{color: themes.light.boxColor.inputSecondary}}
                />
              )}
            </CheckBox>
          </HospitalTimeContainer>
        )}

        {routine.type === 'medicine' && (
          <Routines>
            <RoutineList>
              {routine.medicines.map(medicine => (
                <MedicineItem key={medicine.medicine_id}>
                  <MedicineText
                    isChecked={
                      checkedItems[
                        `${selectedDateString}-${routine.timeKey}-${medicine.medicine_id}`
                      ]
                    }
                    onPress={() =>
                      navigation.navigate('SetMedicineRoutine', {
                        medicineId: medicine.medicine_id,
                      })
                    }>
                    {medicine.nickname}
                  </MedicineText>
                  <MedicineCount
                    isChecked={
                      checkedItems[
                        `${selectedDateString}-${routine.timeKey}-${medicine.medicine_id}`
                      ]
                    }>
                    {`${medicine.dose}개`}
                  </MedicineCount>
                  <CheckBox
                    onPress={() =>
                      toggleCheck(medicine.medicine_id, routine.timeKey)
                    }>
                    {checkedItems[
                      `${selectedDateString}-${routine.timeKey}-${medicine.medicine_id}`
                    ] ? (
                      <RoutineIcons.checkOn
                        width={26}
                        height={26}
                        style={{color: themes.light.pointColor.Primary}}
                      />
                    ) : (
                      <RoutineIcons.checkOff
                        width={26}
                        height={26}
                        style={{color: themes.light.boxColor.inputSecondary}}
                      />
                    )}
                  </CheckBox>
                </MedicineItem>
              ))}
            </RoutineList>
          </Routines>
        )}
      </RoutineContainer>
    </RoutineBoxContainer>
  );
};

export default RoutineCard;

const RoutineBoxContainer = styled.View`
  position: relative;
  margin-bottom: 30px;
`;

const TimelineBigPoint = styled.View`
  position: absolute;
  left: -16px;
  top: 15px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: ${themes.light.pointColor.primary30};
  z-index: 2;
`;

const TimelinePoint = styled.View`
  position: absolute;
  left: -12px;
  top: 19px;
  width: 12px;
  height: 12px;
  border-radius: 10px;
  background-color: ${themes.light.pointColor.Primary};
  z-index: 2;
`;

const RoutineContainer = styled.View`
  background-color: ${({isInModal}) =>
    isInModal
      ? themes.light.pointColor.Primary10
      : themes.light.bgColor.bgPrimary};
  padding: 0 20px;
  border-radius: 10px;
  ${({isInModal}) =>
    isInModal
      ? `
    margin-left: 0;
    margin-right: 0;
  `
      : `
    margin-left: 24px;
    margin-right: 20px;
  `};
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
`;

const TimeContainer = styled.View`
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
  padding: 20px 0px;
  align-items: center;
`;

const HospitalTimeContainer = styled.View`
  flex-direction: row;
  padding: 20px 0px;
  align-items: center;
`;

const IconContainer = styled.View`
  padding-right: 15px;
`;

const TextContainer = styled.View``;

const TypeText = styled.Text`
  font-size: ${FontSizes.heading.default};
  font-family: 'Pretendard-ExtraBold';
`;

const TimeText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

const Routines = styled.View``;

const RoutineList = styled.View``;

const MedicineItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const MedicineText = styled.Text`
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  padding: 20px;
  width: 80%;
  overflow: hidden;
  text-decoration-line: ${({isChecked}) =>
    isChecked ? 'line-through' : 'none'};
  color: ${({isChecked}) =>
    isChecked
      ? themes.light.textColor.Primary50
      : themes.light.textColor.textPrimary};
`;

const MedicineCount = styled.Text`
  position: absolute;
  font-size: ${FontSizes.body.default};
  font-family: 'Pretendard-Medium';
  right: 45px;
  text-decoration-line: ${({isChecked}) =>
    isChecked ? 'line-through' : 'none'};
  color: ${({isChecked}) =>
    isChecked
      ? themes.light.textColor.Primary50
      : themes.light.textColor.textPrimary};
`;

const CheckBox = styled.TouchableOpacity`
  position: absolute;
  right: 0;
`;
