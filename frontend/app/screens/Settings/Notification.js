import React, {useState, useEffect} from 'react';
import {Switch, View, Alert} from 'react-native';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import {Header} from '../../components';
import {LogoIcons} from '../../../assets/icons';
import {BlurView} from '@react-native-community/blur';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {
  getNotificationAgreed,
  updateNotificationAgreement
} from '../../api/storage';

const Notification = () => {
  const [isEnabled, setIsEnabled] = useState(true); // 기본값은 true
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const {fontSizeMode} = useFontSize();
  
  // 컴포넌트 마운트 시 알림 동의 상태 로드
  useEffect(() => {
    const loadNotificationState = async () => {
      try {
        // 로컬 저장소에서 알림 상태 가져오기
        const agreed = await getNotificationAgreed();
        setIsEnabled(agreed);
      } catch (error) {
        console.error('알림 상태 로딩 오류:', error);
      }
    };
    
    loadNotificationState();
  }, []);

  // 알림 토글 처리
  const toggleSwitch = async () => {
    if (isLoading) return; // 로딩 중에는 토글 방지
    
    const newState = !isEnabled;
    setIsLoading(true); // 로딩 상태 시작
    
    try {
      // UI 상태 낙관적 업데이트
      setIsEnabled(newState);
      
      // API 및 로컬 저장소 업데이트
      const success = await updateNotificationAgreement(newState);
      
      // 실패 시 UI 상태 되돌리기 및 오류 표시
      if (!success) {
        setIsEnabled(isEnabled);
        throw new Error('알림 설정을 저장하지 못했습니다.');
      }
    } catch (error) {
      console.error('알림 설정 변경 오류:', error);
      
      // UI 상태 복원
      setIsEnabled(isEnabled);
      
      // 오류 알림
      Alert.alert(
        '알림 설정 실패',
        '알림 설정을 변경하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        [{text: '확인'}]
      );
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  const MockNotification = ({title, sub}) => {
    return (
      <NotificationWrapper>
        <BackgroundBlur
          blurType="light"
          blurAmount={20}
          reducedTransparencyFallbackColor="white"
        />
        <WhiteOverlay />
        <ForegroundContent>
          <LogoIcons.app
            width={48}
            height={48}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
            }}
          />
          <TextContainer>
            <NotificationTitle>{title}</NotificationTitle>
            <NotificationSub>{sub}</NotificationSub>
          </TextContainer>
        </ForegroundContent>
      </NotificationWrapper>
    );
  };

  return (
    <Container>
      <Header>알림 설정</Header>
      <TitleContainer>
        <LargeText fontSizeMode={fontSizeMode}>복약 알림 설정</LargeText>
        <SmallText fontSizeMode={fontSizeMode}>약을 잊지 않도록 정해진 시간에 알려드릴게요.</SmallText>
      </TitleContainer>
      <MockImageArea>
        <PhoneMockup />
        <NotificationContainer>
          <View height={50} />
          <MockNotification
            title="아침에 복용하지 않은 약이 있어요."
            sub="혈압약, 두통약 외 1건"
          />
          <MockNotification
            title="아침에 복용해야 하는 약이 있어요."
            sub="혈압약, 두통약 외 1건"
          />
        </NotificationContainer>
      </MockImageArea>
      <SwitchWrapper>
        <Label fontSizeMode={fontSizeMode}>복약 알림</Label>
        <StyledSwitch
          onValueChange={toggleSwitch}
          value={isEnabled}
          disabled={isLoading}
          trackColor={{false: '#ccc', true: themes.light.pointColor.Primary}}
          thumbColor={themes.light.bgColor.bgPrimary}
        />
      </SwitchWrapper>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const TitleContainer = styled.View`
  padding: 35px 30px 0;
  gap: 10px;
`;

const LargeText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.title[fontSizeMode]};
  font-family: KimjungchulGothic-Bold;
  color: ${themes.light.textColor.textPrimary};
`;

const SmallText = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: Pretendard-Medium;
  color: ${themes.light.textColor.Primary50};
`;

const MockImageArea = styled.View`
  margin: 36px 20px;
  padding: 30px 30px 0 30px;
  align-items: center;
  justify-content: center;
  background-color: ${themes.light.pointColor.Primary20};
  border-radius: 8px;
`;

const PhoneMockup = styled.View`
  background-color: white;
  border: 6px solid black;
  border-bottom-width: 0;
  border-radius: 32px 32px 0 0;
  width: 70%;
  height: 240px;
`;

const NotificationContainer = styled.View`
  position: absolute;
`;

const TextContainer = styled.View`
  gap: 2px;
`;

const NotificationWrapper = styled.View`
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const BackgroundBlur = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const WhiteOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
`;

const ForegroundContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-right: 24px;
  gap: 12px;
`;

const NotificationTitle = styled.Text`
  font-size: 16px;
  font-family: Pretendard-SemiBold;
  color: ${themes.light.textColor.textPrimary};
  margin-bottom: 4px;
`;

const NotificationSub = styled.Text`
  font-size: 14px;
  font-family: Pretendard-Regular;
  color: ${themes.light.textColor.Primary70};
`;

const SwitchWrapper = styled.View`
  padding: 0 30px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.Text`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  font-family: Pretendard-Medium;
  color: ${themes.light.textColor.textPrimary};
`;

const StyledSwitch = styled(Switch)`
  transform: scale(1.1);
  opacity: ${({disabled}) => (disabled ? 0.7 : 1)};
`;

export default Notification;