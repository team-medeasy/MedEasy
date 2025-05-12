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
        <LoadingText fontSizeMode={fontSizeMode}>
          안전 정보를 불러오는 중...
        </LoadingText>
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
        <HeadingText fontSizeMode={fontSizeMode}>
          💊 이 약의 안전 사용 정보예요
        </HeadingText>
        <NoWarningContent>
          <NoWarningText fontSizeMode={fontSizeMode}>
            이 약품은 특별한 안전 주의사항이 없어요.
          </NoWarningText>
          <SimpleTag 
            bgColor={themes.light.pointColor.Primary10} 
            textColor={themes.light.pointColor.Primary}
            size="large">
            안전 사용 가능
          </SimpleTag>
        </NoWarningContent>
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
            🤰 임산부 주의사항
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
          <WarningPreviewRow>
            <WarningPreviewText fontSizeMode={fontSizeMode}>
              {content?.substring(0, 50)}...
            </WarningPreviewText>
            <SimpleTag 
              bgColor={themes.light.pointColor.Primary10} 
              textColor={themes.light.pointColor.Primary}>
              주의 필요
            </SimpleTag>
          </WarningPreviewRow>
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
            👵 고령자 주의사항
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
          <WarningPreviewRow>
            <WarningPreviewText fontSizeMode={fontSizeMode}>
              {content?.substring(0, 50)}...
            </WarningPreviewText>
            <SimpleTag 
              bgColor={themes.light.pointColor.Primary10} 
              textColor={themes.light.pointColor.Primary}>
              주의 필요
            </SimpleTag>
          </WarningPreviewRow>
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
              ⚠️ 현재 복용 중인 약과의 충돌 ({conflictCount}개)
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ConflictMedicineName fontSizeMode={fontSizeMode}>
                      {conflict.currentMedicine.medicine_name}
                    </ConflictMedicineName>
                    <SimpleTag 
                      bgColor={themes.light.pointColor.Secondary} 
                      textColor={themes.light.textColor.buttonText}>
                      함께 복용 금지
                    </SimpleTag>
                  </View>
                  <ConflictContent fontSizeMode={fontSizeMode}>
                    {conflict.warningInfo.PROHBT_CONTENT || '정보 없음'}
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
            <WarningPreviewRow>
              <WarningPreviewText fontSizeMode={fontSizeMode} warning={true}>
                {currentMedicines.length > 0 
                  ? `현재 복용 중인 약물 중 ${conflictCount}개와 함께 복용하면 안됩니다.`
                  : '복용 중인 약물과의 병용금기 정보가 있습니다.'}
              </WarningPreviewText>
              <SimpleTag 
                bgColor={themes.light.pointColor.Secondary} 
                textColor={themes.light.textColor.buttonText}>
                위험
              </SimpleTag>
            </WarningPreviewRow>
          )}
        </WarningSection>
      );
    } 
    
    // 병용금기 정보는 있지만 현재 복용 중인 약과 충돌이 없는 경우
    else if (warningData.combination?.hasWarning) {
      return (
        <WarningSection style={{ borderBottomWidth: 0 }}>
          <WarningInfoRow>
            <WarningInfoText fontSizeMode={fontSizeMode}>
              이 약은 특정 약물과 함께 복용하면 안 되는 병용금기 정보가 있으나, 
              현재 복용 중인 약물과는 충돌이 없습니다.
            </WarningInfoText>
            <SimpleTag 
              bgColor={themes.light.boxColor.inputSecondary} 
              textColor={themes.light.textColor.Primary70}>
              정보 제공
            </SimpleTag>
          </WarningInfoRow>
        </WarningSection>
      );
    }
    
    return null;
  };
  
  // 금기 정보 표시 - 순서: 병용금기 > 임부금기 > 노인주의
  return (
    <WarningContainer>
      <HeadingText fontSizeMode={fontSizeMode}>
        💊 이 약의 안전 사용 정보예요
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

// 태그를 인라인으로 직접 구현
const SimpleTag = ({ children, bgColor, textColor, size = 'small' }) => {
  const { fontSizeMode } = useFontSize();
  return (
    <SimpleTagContainer bgColor={bgColor} size={size}>
      <SimpleTagText fontSizeMode={fontSizeMode} textColor={textColor} size={size}>
        {children}
      </SimpleTagText>
    </SimpleTagContainer>
  );
};

const SimpleTagContainer = styled.View`
  background-color: ${props => props.bgColor};
  padding: ${props => props.size === 'small' ? '4px 8px' : '6px 10px'};
  border-radius: 5px;
  align-self: flex-start;
`;

const SimpleTagText = styled.Text`
  color: ${props => props.textColor};
  font-family: ${props => props.size === 'small' ? 'Pretendard-SemiBold' : 'Pretendard-Bold'};
  font-size: ${props => props.size === 'small' 
    ? FontSizes.caption[props.fontSizeMode] + 1
    : FontSizes.body[props.fontSizeMode]
  }px;
`;

// 스타일 컴포넌트
const WarningContainer = styled.View`
  background-color: ${themes.light.bgColor.bgPrimary};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  elevation: 2;
  border-width: 1px;
  border-color: ${themes.light.borderColor.borderSecondary};
`;

const HeadingText = styled.Text`
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode] + 2}px;
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

const WarningPreviewRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const WarningInfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 15px;
  border-radius: 10px;
`;

const WarningTitleText = styled.Text`
  color: ${({warning}) => warning ? themes.light.pointColor.Secondary : themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 1}px;
`;

const WarningPreviewText = styled.Text`
  color: ${({warning}) => warning ? themes.light.pointColor.Secondary : themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode] + 1}px;
  flex: 1;
  margin-right: 10px;
`;

const WarningContentContainer = styled.View`
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 15px;
  border-radius: 10px;
  margin-top: 5px;
`;

const WarningContentText = styled.Text`
  color: ${themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 1}px;
  line-height: 26px;
`;

const WarningInfoText = styled.Text`
  color: ${themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 1}px;
  line-height: 24px;
  flex: 1;
  margin-right: 10px;
`;

const ConflictItem = styled.View`
  margin-bottom: 15px;
  padding: 12px;
  background-color: ${themes.light.pointColor.Primary10};
  border-radius: 8px;
  border-left-width: 3px;
  border-left-color: ${themes.light.pointColor.Secondary};
`;

const ConflictMedicineName = styled.Text`
  color: ${themes.light.pointColor.Secondary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 1}px;
  margin-bottom: 5px;
`;

const ConflictContent = styled.Text`
  color: ${themes.light.textColor.Primary70};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 1}px;
  margin-vertical: 5px;
`;

const ConflictRemark = styled.Text`
  color: ${themes.light.textColor.Primary50};
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.caption[fontSizeMode] + 1}px;
`;

const LoadingText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 1}px;
  color: ${themes.light.textColor.Primary50};
  margin-top: 10px;
  text-align: center;
`;

const ErrorText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 1}px;
  color: ${themes.light.pointColor.Secondary};
  margin-top: 10px;
  text-align: center;
`;

const NoWarningContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${themes.light.boxColor.inputPrimary};
  padding: 15px;
  border-radius: 10px;
  border-left-width: 3px;
  border-left-color: ${themes.light.pointColor.Primary};
`;

const NoWarningText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 1}px;
  color: ${themes.light.textColor.Primary70};
  flex: 1;
  margin-right: 10px;
`;

export default MedicineWarning;