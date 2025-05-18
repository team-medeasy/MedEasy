import React from 'react';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import FontSizes from '../../assets/fonts/fontSizes';
import {pointColor, themes} from '../styles';
import {RoutineIcons} from '../../assets/icons';
import {useFontSize} from '../../assets/fonts/FontSizeContext';
import LinearGradient from 'react-native-linear-gradient';

const RoutineCard = ({
  routine,
  index,
  allLength,
  checkedItems,
  toggleTimeCheck,
  toggleCheck,
  isInModal = false,
  selectedDateString,
  backgroundColor,
  routineMode = 'default', // 루틴 모드 prop
}) => {
  const navigation = useNavigation();
  const {fontSizeMode} = useFontSize();

  const handleMedicinePress = medicineId => {
    if (routineMode === 'care') {
      // care 모드일 때 다른 페이지로 네비게이션
      navigation.navigate('MedicineDetail', {
        medicineId: medicineId,
      });
    } else {
      // 기본 모드에서는 기존대로 SetMedicineRoutine 페이지로 이동
      navigation.navigate('SetMedicineRoutine', {
        medicineId: medicineId,
      });
    }
  };

  return (
    <RoutineBoxContainer isInModal={isInModal}>
      {!isInModal && (
        <>
          {/*
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
          {allLength > 1 && index !== allLength - 1 && 
          <TimelineLine 
            colors={[pointColor.primary20, pointColor.pointPrimaryDark]} // 밝은색 → 진한색
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}/>} */}
        </>
      )}

      <RoutineContainer isInModal={isInModal} backgroundColor={backgroundColor}>
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
              <TypeText fontSizeMode={fontSizeMode}>{routine.label}</TypeText>
              <TimeText fontSizeMode={fontSizeMode}>{routine.time}</TimeText>
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
        ) : null}

        {routine.type === 'medicine' && (
          <Routines>
            <RoutineList>
              {routine.medicines.map(medicine => (
                <MedicineItem key={medicine.medicine_id}>
                  <MedicineText
                    fontSizeMode={fontSizeMode}
                    isChecked={
                      checkedItems[
                        `${selectedDateString}-${routine.timeKey}-${medicine.medicine_id}`
                      ]
                    }
                    onPress={() => handleMedicinePress(medicine.medicine_id)}>
                    {medicine.nickname}
                  </MedicineText>
                  <MedicineCount
                    fontSizeMode={fontSizeMode}
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
                        style={{
                          color: themes.light.boxColor.inputSecondary,
                        }}
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

const TimelineLine = styled(LinearGradient)`
  position: absolute;
  left: -9px;
  top: 20px;
  bottom: -50px;
  width: 6px;
  background-color: ${themes.light.pointColor.Primary};
`;

const RoutineContainer = styled.View`
  background-color: ${({isInModal, backgroundColor}) =>
    backgroundColor
      ? backgroundColor
      : isInModal
      ? themes.light.pointColor.Primary10
      : themes.light.bgColor.bgPrimary};
  padding: 0 20px;
  border-radius: 10px;
  /* ${({isInModal}) =>
    isInModal
      ? `
    margin-left: 0;
    margin-right: 0;
  `
      : `
    margin-left: 24px;
    margin-right: 20px;
  `}; */
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
`;

const TimeContainer = styled.View`
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.borderPrimary};
  padding: 20px 0px;
  align-items: center;
`;

const IconContainer = styled.View`
  padding-right: 15px;
`;

const TextContainer = styled.View`
  gap: 5px;
`;

const TypeText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]};
  font-family: 'Pretendard-ExtraBold';
`;

const TimeText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-Medium';
  color: ${themes.light.textColor.Primary50};
`;

const Routines = styled.View``;

const RoutineList = styled.View`
  padding: 16px 0;
  gap: 6px;
`;

const MedicineItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const MedicineText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: 'Pretendard-Medium';
  width: 80%;
  padding: 8px;
  overflow: hidden;
  line-height: 20px;
  text-decoration-line: ${({isChecked}) =>
    isChecked ? 'line-through' : 'none'};
  color: ${({isChecked}) =>
    isChecked
      ? themes.light.textColor.Primary50
      : themes.light.textColor.textPrimary};
`;

const MedicineCount = styled.Text`
  position: absolute;
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
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
