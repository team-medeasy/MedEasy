// MedicineWarning.js - 단순화된 버전
import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchAllWarnings } from '../../api/dur';
import { getUserMedicinesCurrent } from '../../api/user';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { RoutineIcons, OtherIcons } from '../../../assets/icons';

const MedicineWarning = ({ item }) => {
  const { fontSizeMode } = useFontSize();
  const [warningData, setWarningData] = useState(null);
  const [currentMedicines, setCurrentMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadWarningData = async () => {
      if (!item?.item_seq) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const medicinesResponse = await getUserMedicinesCurrent();
        const currentMeds = medicinesResponse?.data?.body || [];
        setCurrentMedicines(currentMeds);
        const warnings = await fetchAllWarnings(item.item_seq, currentMeds);
        setWarningData(warnings);
      } catch (err) {
        console.error('금기 정보 로딩 실패:', err);
        setError('금기 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWarningData();
  }, [item?.item_seq]);

  // 기본 색상 정의 - 테마에서 가져오거나 기본값 사용
  const blueColor = themes.light.pointColor?.Primary || '#007AFF'; // 파란색 (금기사항 없음)
  const redColor = themes.light.pointColor?.Secondary || '#FF3B30'; // 빨간색 (금기사항 있음)

  const sections = [
    {
      key: 'interaction',
      title: '병용금기',
      hasWarning: warningData?.interactions?.hasConflict || warningData?.combination?.hasWarning,
      isBlue: warningData?.combination?.hasWarning && !warningData?.interactions?.hasConflict,
      description:
        warningData?.interactions?.hasConflict && warningData?.interactions?.conflictItems?.length > 0
          ? `다음 약물과 병용 시 충돌이 있습니다:\n` +
            warningData.interactions.conflictItems
              .map(item => `- ${item.currentMedicine.medicine_name}`)
              .join('\n')
          : warningData?.combination?.hasWarning
          ? '이 약은 다른 특정 약물과 함께 복용하면 안 되는 병용 금기 정보가 있으나, 현재 복용 중인 약과는 충돌이 없습니다.'
          : '현재 확인된 주의사항이 없어요.'
    },
    {
      key: 'elderly',
      title: '노인주의',
      hasWarning: warningData?.elderly?.hasWarning,
      isBlue: false,
      description:
        warningData?.elderly?.hasWarning
          ? warningData.elderly.content
          : '현재 확인된 주의사항이 없어요.'
    },
    {
      key: 'pregnancy',
      title: '임부금기',
      hasWarning: warningData?.pregnancy?.hasWarning,
      isBlue: false,
      description:
        warningData?.pregnancy?.hasWarning
          ? warningData.pregnancy.content
          : '현재 확인된 주의사항이 없어요.'
    }
  ];

  return (
    <WarningContainer>
      <ToggleContainer>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => setExpanded(!expanded)}
          style={{ width: '100%' }}
        >
          <ToggleButton>
            <ToggleTextContainer>
              <WarningIcon>🚫</WarningIcon>
              <ToggleText fontSizeMode={fontSizeMode}>약품 금기 정보 확인하기</ToggleText>
            </ToggleTextContainer>
            {expanded ? (
              <OtherIcons.chevronDown
                width={17}
                height={17}
                style={{
                  color: themes.light.pointColor.Primary,
                  transform: [{rotate: '180deg'}],
                }}
              />
            ) : (
              <OtherIcons.chevronDown
                width={17}
                height={17}
                style={{color: themes.light.pointColor.Primary}}
              />
            )}
          </ToggleButton>
        </TouchableOpacity>
      </ToggleContainer>

      {expanded && (
        <>
          {loading ? (
            <LoadingContainer>
              <ActivityIndicator size="small" color={themes.light.textColor.Primary50} />
              <LoadingText fontSizeMode={fontSizeMode}>안전 정보를 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <ErrorText fontSizeMode={fontSizeMode}>{error}</ErrorText>
            </ErrorContainer>
          ) : (
            sections.map(({ key, title, hasWarning, isBlue, description }, index) => (
              <CautionItem key={key} isLastItem={index === sections.length - 1}>
                <RoutineIcons.medicine
                  width={18}
                  height={18}
                  color={
                    hasWarning
                      ? isBlue ? blueColor : redColor  // 금기사항 있음: 파란색 또는 빨간색
                      : blueColor  // 금기사항 없음: 항상 파란색
                  }
                />
                <TextContainer>
                  <CautionTitle fontSizeMode={fontSizeMode}>{title}</CautionTitle>
                  <CautionDescription fontSizeMode={fontSizeMode}>{description}</CautionDescription>
                </TextContainer>
              </CautionItem>
            ))
          )}
        </>
      )}
    </WarningContainer>
  );
};

export default MedicineWarning;

const WarningContainer = styled.View`
  padding: 20px;
  gap: 12px;
`;

const SectionTitle = styled.Text`
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]}px;
`;

const CautionItem = styled.View`
  flex-direction: row;
  gap: 12px;
  padding-top: 10px;
  padding-bottom: 15px;
  border-bottom-width: ${props => props.isLastItem ? '0' : '1px'};
  border-bottom-color: ${themes.light.borderColor.borderSecondary};
`;

const SquareIconWrapper = styled.View`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: ${themes.light.pointColor?.Primary10 || '#E6F2FF'};
  align-items: center;
  justify-content: center;
`;

const TextContainer = styled.View`
  flex: 1;
`;

const CautionTitle = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 2}px;
  color: ${themes.light.textColor.textPrimary};
  margin-bottom: 4px;
`;

const CautionDescription = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.Primary70};
  line-height: 22px;
`;

const LoadingText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.Primary50};
  margin-top: 10px;
  text-align: center;
`;

const ErrorText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.pointColor.Secondary};
  margin-top: 10px;
  text-align: center;
`;

const ToggleContainer = styled.View`
  margin-bottom: 16px;
`;

const ToggleButton = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${themes.light.pointColor.Primary10};
  border-radius: 12px;
`;

const ToggleTextContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const WarningIcon = styled.Text`
  margin-right: 8px;
  font-size: 16px;
`;

const ToggleText = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]}px;
  color: ${themes.light.pointColor.Primary};
`;

const LoadingContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

const ErrorContainer = styled.View`
  padding: 20px;
  align-items: center;
`;