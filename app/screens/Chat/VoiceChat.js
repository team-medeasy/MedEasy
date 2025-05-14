import React, {useEffect, useRef, useState} from 'react';
import {Animated, PermissionsAndroid, Platform, Alert} from 'react-native';
import SoundLevel from 'react-native-sound-level';
import styled from 'styled-components/native';
import {themes} from '../../styles';
import {Header} from '../../components';
import Voice from '@react-native-voice/voice';

export default function VoiceCircle() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // 권한 요청 함수
  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '마이크 권한 필요',
            message: '음성 인식을 위해 마이크 접근 권한이 필요합니다',
            buttonPositive: '확인',
            buttonNegative: '취소',
          },
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('마이크 권한 허용됨');
          setHasPermission(true);
          return true;
        } else {
          console.log('마이크 권한 거부됨');
          Alert.alert(
            '권한 필요',
            '음성 인식을 위해서는 마이크 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
            [{text: '확인', onPress: () => console.log('확인 누름')}],
          );
          setHasPermission(false);
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // iOS는 Info.plist에서 설정했으므로 여기서는 항상 true를 반환
      setHasPermission(true);
      return true;
    }
  };

  // 음성 레벨 모니터링 설정
  useEffect(() => {
    const setupSoundLevel = async () => {
      if (await requestMicrophonePermission()) {
        SoundLevel.start();
        SoundLevel.onNewFrame = data => {
          const volume = Math.max(-160, data.value);
          const normalized = 1 + (Math.abs(volume) / 160) * 4;

          Animated.spring(scaleAnim, {
            toValue: normalized,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
          }).start();
        };
      }
    };

    setupSoundLevel();

    return () => {
      SoundLevel.stop();
    };
  }, []);

  // Voice 라이브러리 설정
  useEffect(() => {
    // 이벤트 핸들러 설정
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    // 권한이 있으면 자동으로 음성 인식 시작
    if (hasPermission) {
      startListening();
    }

    // 정리 함수
    return () => {
      stopListening();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [hasPermission]);

  // 음성 인식 이벤트 핸들러
  const onSpeechStart = e => {
    console.log('음성 인식 시작됨', e);
  };

  const onSpeechRecognized = e => {
    console.log('음성 인식됨', e);
  };

  const onSpeechEnd = e => {
    console.log('음성 인식 종료됨', e);
    // 인식이 끝나면 다시 시작 (연속 모드)
    if (hasPermission) {
      setTimeout(() => {
        startListening();
      }, 1000);
    }
  };

  const onSpeechError = e => {
    console.error('음성 인식 오류', e);
    setIsListening(false);
    // 오류 발생 시 일정 시간 후 다시 시도
    if (hasPermission) {
      setTimeout(() => {
        startListening();
      }, 3000);
    }
  };

  const onSpeechResults = e => {
    console.log('음성 인식 결과', e);
    if (e.value && e.value.length > 0) {
      // 최종 음성 인식 결과 콘솔에 출력
      console.log('최종 인식된 텍스트:', e.value[0]);
      
      // 여기서 MCP 모델로 결과를 전송하는 로직을 추가할 수 있습니다
      // 예: sendToMCPModel(e.value[0])
    }
  };

  const onSpeechPartialResults = e => {
    if (e.value && e.value.length > 0) {
      // 부분 인식 결과 콘솔에 출력
      console.log('부분 인식 결과:', e.value[0]);
    }
  };

  // 음성 인식 시작 함수
  const startListening = async () => {
    try {
      if (!isListening) {
        await Voice.start('ko-KR'); // 한국어로 설정
        setIsListening(true);
        console.log('음성 인식 시작');
      }
    } catch (e) {
      console.error('음성 인식 시작 오류', e);
    }
  };

  // 음성 인식 중지 함수
  const stopListening = async () => {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
        console.log('음성 인식 중지');
      }
    } catch (e) {
      console.error('음성 인식 중지 오류', e);
    }
  };

  return (
    <Container>
      <Header>보이스 채팅</Header>
      <CircleContainer>
        <AnimatedCircle 
          style={{transform: [{scale: scaleAnim}]}}
          active={isListening}
        />
        <StatusText>{isListening ? '듣는 중...' : '준비 중...'}</StatusText>
      </CircleContainer>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${themes.light.bgColor.bgPrimary};
`;

const CircleContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const AnimatedCircle = styled(Animated.View)`
  width: 100px;
  height: 100px;
  background-color: ${props => 
    props.active 
      ? themes.light.pointColor.Primary 
      : themes.light.pointColor.Secondary};
  border-radius: 50px;
`;

const StatusText = styled.Text`
  margin-top: 20px;
  font-size: 18px;
  color: ${themes.light.textColor.Primary};
`;