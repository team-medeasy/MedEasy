import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import {getContraindicationInfo} from '../../api/dur';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {RoutineIcons, OtherIcons} from '../../../assets/icons';

const MedicineWarning = ({item}) => {
  const {fontSizeMode} = useFontSize();
  const [warningData, setWarningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadWarningData = async () => {
      if (!item?.item_seq) {
        setLoading(false);
        return;
      }

      console.log(`[MedicineWarning] item_seq: ${item.item_seq}`);

      try {
        setLoading(true);
        const result = await getContraindicationInfo(item.item_seq);

        if (result.success) {
          console.log('[MedicineWarning] 금기 정보 조회 성공:', result.data);
          setWarningData(result.data.body);
        } else {
          console.error('[MedicineWarning] 금기 정보 조회 실패:', result.error);
          // 404 에러인 경우 (금기정보가 없는 경우)
          if (result.status === 404) {
            // 빈 데이터 설정 - 이렇게 하면 각 섹션이 "현재 확인된 주의사항이 없어요"를 표시함
            setWarningData({
              combination_contraindications: [],
              elderly_precaution: '',
              pregnancy_contraindication: '',
            });
          } else {
            throw new Error(result.error);
          }
        }
      } catch (err) {
        console.error('금기 정보 로딩 실패:', err);
        setError('금기 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWarningData();
  }, [item?.item_seq]);

  const blueColor = themes.light.pointColor?.Primary || '#007AFF';
  const redColor = themes.light.pointColor?.Secondary || '#FF3B30';

  const sections = [
    {
      key: 'interaction',
      title: '병용금기',
      hasWarning: warningData?.combination_contraindications?.length > 0,
      isBlue: false,
      description:
        warningData?.combination_contraindications?.length > 0
          ? `다음 약물과 병용 시 충돌이 있습니다:\n` +
            warningData.combination_contraindications
              .map(item => `- ${item.item_name}`)
              .join('\n')
          : '현재 확인된 주의사항이 없어요.',
    },
    {
      key: 'elderly',
      title: '노인주의',
      hasWarning: !!warningData?.elderly_precaution,
      isBlue: false,
      description:
        warningData?.elderly_precaution || '현재 확인된 주의사항이 없어요.',
    },
    {
      key: 'pregnancy',
      title: '임부금기',
      hasWarning: !!warningData?.pregnancy_contraindication,
      isBlue: false,
      description:
        warningData?.pregnancy_contraindication ||
        '현재 확인된 주의사항이 없어요.',
    },
  ];

  return (
    <WarningContainer>
      <ToggleContainer>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setExpanded(!expanded)}
          style={{width: '100%'}}>
          <ToggleButton>
            <ToggleTextContainer>
              <WarningIcon>🚫</WarningIcon>
              <ToggleText fontSizeMode={fontSizeMode}>
                약품 금기 정보 확인하기
              </ToggleText>
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
              <ActivityIndicator
                size="small"
                color={themes.light.textColor.Primary50}
              />
              <LoadingText fontSizeMode={fontSizeMode}>
                안전 정보를 불러오는 중...
              </LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <ErrorText fontSizeMode={fontSizeMode}>{error}</ErrorText>
            </ErrorContainer>
          ) : (
            sections.map(
              ({key, title, hasWarning, isBlue, description}, index) => {
                const iconColor = hasWarning
                  ? isBlue
                    ? blueColor
                    : redColor
                  : blueColor;

                const backgroundColor = hasWarning
                  ? isBlue
                    ? themes.light.pointColor.Primary10
                    : themes.light.pointColor.Secondary20
                  : themes.light.pointColor.Primary10;

                return (
                  <CautionItem
                    key={key}
                    isLastItem={index === sections.length - 1}>
                    <SquareIconWrapper backgroundColor={backgroundColor}>
                      <RoutineIcons.medicine
                        width={18}
                        height={18}
                        color={iconColor}
                      />
                    </SquareIconWrapper>
                    <TextContainer>
                      <CautionTitle fontSizeMode={fontSizeMode}>
                        {title}
                      </CautionTitle>
                      <CautionDescription fontSizeMode={fontSizeMode}>
                        {description}
                      </CautionDescription>
                    </TextContainer>
                  </CautionItem>
                );
              },
            )
          )}
        </>
      )}
    </WarningContainer>
  );
};

export default MedicineWarning;

// 아래는 기존 스타일 정의 - 추가된 스타일
const WarningContainer = styled.View`
  padding: 20px 20px 8px 20px;
`;

const SectionTitle = styled.Text`
  color: ${themes.light.textColor.textPrimary};
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]};
`;

const CautionItem = styled.View`
  flex-direction: row;
  gap: 16px;
  padding: 12px 0;
`;

const SquareIconWrapper = styled.View`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: ${({backgroundColor}) => backgroundColor || '#E6F2FF'};
  align-items: center;
  justify-content: center;
`;

const TextContainer = styled.View`
  flex: 1;
  padding: 4px 0;
  gap: 6px;
`;

const CautionTitle = styled.Text`
  font-family: 'Pretendard-Bold';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode] + 2};
  color: ${themes.light.textColor.textPrimary};
`;

const CautionDescription = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.Primary70};
  line-height: 22px;
`;

const LoadingText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.Primary50};
  margin-top: 10px;
  text-align: center;
`;

const ErrorText = styled.Text`
  font-family: 'Pretendard-Medium';
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
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
  font-size: ${({fontSizeMode}) => FontSizes.heading[fontSizeMode]};
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

// 금기정보가 없는 경우를 위한 새로운 스타일 추가 (삭제된 부분)
