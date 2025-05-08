// MedicineWarning.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { fetchAllWarnings } from '../../api/dur';
import { getUserMedicinesCurrent } from '../../api/user';
import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { OtherIcons } from '../../../assets/icons';

// 유틸 함수 제거

const MedicineWarning = ({ item }) => {
  const { fontSizeMode } = useFontSize();
  const [warningData, setWarningData] = useState(null);
  const [currentMedicines, setCurrentMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    pregnancy: false,
    elderly: false,
    interaction: false
  });

  // 섹션 확장/축소 토글 함수
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 데이터 로딩
  useEffect(() => {
    const loadWarningData = async () => {
      if (!item?.item_seq) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 1. 현재 복용 중인 약품 목록 가져오기
        const medicinesResponse = await getUserMedicinesCurrent();
        const currentMeds = medicinesResponse?.data?.body || [];
        setCurrentMedicines(currentMeds);
        
        console.log('현재 복용 중인 약품:', currentMeds.length);
        
        // 2. 약품 금기 정보 및 상호작용 검사
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

  if (loading) {
    return (
      <WarningContainer>
        <ActivityIndicator size="small" color={themes.light.textColor.Primary50} />
        <LoadingText fontSizeMode={fontSizeMode}>금기 정보를 불러오는 중...</LoadingText>
      </WarningContainer>
    );
  }

  if (error) {
    return (
      <WarningContainer>
        <ErrorText fontSizeMode={fontSizeMode}>{error}</ErrorText>
      </WarningContainer>
    );
  }

  // 금기 정보가 없는 경우
  if (!warningData || !warningData.hasWarning) {
    return (
      <WarningContainer>
        <NoWarningText fontSizeMode={fontSizeMode}>
          이 약품에는 특별한 금기 사항이 없습니다.
        </NoWarningText>
      </WarningContainer>
    );
  }

  // 임부금기 정보 표시
  const renderPregnancyWarning = () => {
    const { pregnancy } = warningData;
    if (!pregnancy.hasWarning) return null;
    
    const isExpanded = expandedSections.pregnancy;
    const content = pregnancy.content;
    
    return (
      <WarningSection>
        <WarningHeaderRow onPress={() => toggleSection('pregnancy')}>
          <WarningTitleText fontSizeMode={fontSizeMode}>
            🤰 임부금기
          </WarningTitleText>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => toggleSection('pregnancy')}>
            <OtherIcons.chevronDown
              width={17}
              height={17}
              style={{
                color: themes.light.textColor.Primary30,
                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
              }}
            />
          </TouchableOpacity>
        </WarningHeaderRow>
        
        {isExpanded ? (
          <WarningContentContainer>
            <WarningContentText fontSizeMode={fontSizeMode}>
              {content}
            </WarningContentText>
          </WarningContentContainer>
        ) : (
          <WarningPreviewText fontSizeMode={fontSizeMode}>
            {content?.substring(0, 50)}...
          </WarningPreviewText>
        )}
      </WarningSection>
    );
  };
  
  // 노인주의 정보 표시
  const renderElderlyWarning = () => {
    const { elderly } = warningData;
    if (!elderly.hasWarning) return null;
    
    const isExpanded = expandedSections.elderly;
    const content = elderly.content;
    
    return (
      <WarningSection>
        <WarningHeaderRow onPress={() => toggleSection('elderly')}>
          <WarningTitleText fontSizeMode={fontSizeMode}>
            👵 노인주의
          </WarningTitleText>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => toggleSection('elderly')}>
            <OtherIcons.chevronDown
              width={17}
              height={17}
              style={{
                color: themes.light.textColor.Primary30,
                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
              }}
            />
          </TouchableOpacity>
        </WarningHeaderRow>
        
        {isExpanded ? (
          <WarningContentContainer>
            <WarningContentText fontSizeMode={fontSizeMode}>
              {content}
            </WarningContentText>
          </WarningContentContainer>
        ) : (
          <WarningPreviewText fontSizeMode={fontSizeMode}>
            {content?.substring(0, 50)}...
          </WarningPreviewText>
        )}
      </WarningSection>
    );
  };
  
  // 병용금기 정보 표시
  const renderInteractionWarning = () => {
    // interactions 필드가 있고 충돌이 있는 경우
    if (warningData.interactions?.hasConflict) {
      const isExpanded = expandedSections.interaction;
      const { conflictCount, conflictItems } = warningData.interactions;
      
      return (
        <WarningSection style={{ borderBottomWidth: 0 }}>
          <WarningHeaderRow onPress={() => toggleSection('interaction')}>
            <WarningTitleText fontSizeMode={fontSizeMode} warning={true}>
              ⚠️ 현재 복용 중인 약과 함께 복용 금지 ({conflictCount}개)
            </WarningTitleText>
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => toggleSection('interaction')}>
              <OtherIcons.chevronDown
                width={17}
                height={17}
                style={{
                  color: themes.light.textColor.Primary30,
                  transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                }}
              />
            </TouchableOpacity>
          </WarningHeaderRow>
          
          {isExpanded ? (
            <WarningContentContainer>
              {conflictItems.map((conflict, index) => (
                <ConflictItem key={index}>
                  <ConflictMedicineName fontSizeMode={fontSizeMode}>
                    {conflict.currentMedicine.medicine_name}
                  </ConflictMedicineName>
                  <ConflictContent fontSizeMode={fontSizeMode}>
                    금기 사유: {conflict.warningInfo.PROHBT_CONTENT || '정보 없음'}
                  </ConflictContent>
                  {conflict.warningInfo.REMARK && (
                    <ConflictRemark fontSizeMode={fontSizeMode}>
                      주의사항: {conflict.warningInfo.REMARK}
                    </ConflictRemark>
                  )}
                </ConflictItem>
              ))}
            </WarningContentContainer>
          ) : (
            <WarningPreviewText fontSizeMode={fontSizeMode} warning={true}>
              {currentMedicines.length > 0 
                ? `현재 복용 중인 약물 중 ${conflictCount}개와 함께 복용하면 안됩니다.`
                : '복용 중인 약물과의 병용금기 정보가 있습니다.'}
            </WarningPreviewText>
          )}
        </WarningSection>
      );
    } 
    
    // 병용금기 정보는 있지만 현재 복용 중인 약과 충돌이 없는 경우
    else if (warningData.combination?.hasWarning) {
      return (
        <WarningSection style={{ borderBottomWidth: 0 }}>
          <WarningInfoText fontSizeMode={fontSizeMode}>
            이 약은 다른 특정 약물과 함께 복용하면 안 되는 병용금기 정보가 있으나, 
            현재 복용 중인 약물과는 충돌이 없습니다.
          </WarningInfoText>
        </WarningSection>
      );
    }
    
    return null;
  };
  
  // 금기 정보 표시 - 순서: 병용금기 > 임부금기 > 노인주의
  return (
    <WarningContainer>
      <HeadingText fontSizeMode={fontSizeMode}>
        💊 약품 금기 정보
      </HeadingText>
      
      {/* 병용금기 정보 (가장 중요하므로 먼저 표시) */}
      {renderInteractionWarning()}
      
      {/* 임부금기 정보 */}
      {renderPregnancyWarning()}
      
      {/* 노인주의 정보 */}
      {renderElderlyWarning()}
    </WarningContainer>
  );
};

// 스타일 컴포넌트
const WarningContainer = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 20px;
`;

const HeadingText = styled.Text`
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]}px;
  margin-bottom: 20px;
`;

const WarningSection = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${themes.light.borderColor.borderSecondary};
  padding-bottom: 15px;
  margin-bottom: 15px;
`;

const WarningHeaderRow = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const WarningTitleText = styled.Text`
  color: ${({warning}) => warning ? themes.light.pointColor.Error : themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
`;

const WarningPreviewText = styled.Text`
  color: ${({warning}) => warning ? themes.light.pointColor.Error : themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode]}px;
`;

const WarningContentContainer = styled.View`
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 15px;
  border-radius: 10px;
`;

const WarningContentText = styled.Text`
  color: ${themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  line-height: 24px;
`;

// 고시일 텍스트 스타일 제거

const WarningInfoText = styled.Text`
  color: ${themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  line-height: 24px;
`;

const ConflictItem = styled.View`
  margin-bottom: 15px;
`;

const ConflictMedicineName = styled.Text`
  color: ${themes.light.pointColor.Error};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  margin-bottom: 5px;
`;

const ConflictContent = styled.Text`
  color: ${themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  margin-bottom: 5px;
`;

const ConflictRemark = styled.Text`
  color: ${themes.light.textColor.Primary50};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode]}px;
`;

const LoadingText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.Primary50};
  margin-top: 10px;
`;

const ErrorText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.pointColor.Error};
  margin-top: 10px;
`;

const NoWarningText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]}px;
  color: ${themes.light.textColor.Primary70};
`;

export default MedicineWarning;