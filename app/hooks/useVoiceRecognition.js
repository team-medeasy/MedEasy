import { useState, useRef, useEffect } from 'react';
import Voice from '@react-native-voice/voice';
import { PermissionsAndroid, Platform } from 'react-native';

export default function useVoiceRecognition() {
  const [status, setStatus] = useState('idle');
  const [hasPermission, setHasPermission] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [statusMessage, setStatusMessage] = useState('준비 중...');
  const [voiceActive, setVoiceActive] = useState(false);

  const recognitionAttempts = useRef(0);
  const activeVoiceMessageId = useRef(null);
  const debounceTimer = useRef(null);
  const resetTimer = useRef(null);
  const recognitionTimeout = useRef(null);
  const partialTextUpdateCallback = useRef(null);
  const finalResultCallback = useRef(null);

  // 권한 요청 함수
  const requestMicPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '음성 인식 권한',
            message: '음성 인식을 위해 마이크 접근 권한이 필요합니다.',
            buttonNeutral: '나중에 묻기',
            buttonNegative: '거부',
            buttonPositive: '허용',
          },
        );

        const permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasPermission(permissionGranted);

        if (!permissionGranted) {
          setStatusMessage('마이크 권한이 필요합니다');
        }

        console.log('[VOICE] 안드로이드 권한 상태:', permissionGranted);
        return permissionGranted;
      } else {
        // iOS는 자동으로 권한 요청
        setHasPermission(true);
        return true;
      }
    } catch (err) {
      console.error('[VOICE] 권한 요청 오류:', err);
      setHasPermission(false);
      setStatusMessage('권한 요청 오류');
      return false;
    }
  };

  // 음성 인식 시작 함수
  const startListening = async (voiceMessageId, onTextUpdate, onFinalResult) => {
    try {
      if (!hasPermission) {
        const granted = await requestMicPermission();
        if (!granted) {
          console.log('[VOICE] 권한 없음, 음성 인식 중단');
          return;
        }
      }

      // 이전 음성 인식 세션 정리
      clearTimeout(debounceTimer.current);
      clearTimeout(resetTimer.current);
      clearTimeout(recognitionTimeout.current);

      try {
        await Voice.stop();
      } catch (e) {
        console.log('[VOICE] 이전 세션 정지 오류(무시):', e);
      }

      // 콜백 저장
      activeVoiceMessageId.current = voiceMessageId;
      partialTextUpdateCallback.current = onTextUpdate;
      finalResultCallback.current = onFinalResult;

      // 상태 초기화 및 설정
      setRecognizedText('');
      setVoiceActive(true);

      // 상태 업데이트 하나로 통합하여 렌더링 줄이기
      setStatus('listening');
      setStatusMessage('듣는 중...');

      console.log('[VOICE] 음성 인식 시작 직전', voiceMessageId);

      // 음성 인식 시작 - 옵션 간소화
      await Voice.start('ko-KR');

      // 타임아웃 설정 (15초로 늘림)
      recognitionTimeout.current = setTimeout(() => {
        console.log('[VOICE] 음성 인식 타임아웃');
        if (recognizedText) {
          finalizeRecognition(recognizedText);
        } else {
          reset('인식 시간 초과');
        }
      }, 15000);

    } catch (error) {
      console.error('[VOICE] 음성 인식 초기화 오류:', error);
      reset('시작 오류');
      throw error; // 에러를 상위로 전파하여 적절히 처리
    }
  };

  // 음성 인식 결과 처리 함수
  const finalizeRecognition = (text) => {
    // 타이머 정리
    clearTimeout(recognitionTimeout.current);

    console.log('[VOICE] 음성 인식 완료:', text);

    // 상태 업데이트
    setStatus('processing');
    setVoiceActive(false);
    setStatusMessage('처리 중...');

    // 콜백 함수 호출
    if (finalResultCallback.current) {
      finalResultCallback.current(text);
      finalResultCallback.current = null;
    }

    // 상태 리셋 타이머 설정
    resetTimer.current = setTimeout(() => {
      setStatus('idle');
      setStatusMessage('준비 완료');
    }, 1500);
  };

  // 이벤트 핸들러들
  const handleSpeechStart = (e) => {
    console.log('[VOICE] 음성 인식 시작됨:', e);
    setStatus('listening');
    setStatusMessage('듣는 중...');
    recognitionAttempts.current = 0;
  };

  const handleSpeechPartial = ({ value }) => {
    if (value && value.length > 0) {
      const partialText = value[0];
      console.log('[VOICE] 부분 인식 결과:', partialText);
      setRecognizedText(partialText);

      // 부분 인식 결과 콜백 호출
      if (partialTextUpdateCallback.current) {
        partialTextUpdateCallback.current(partialText);
      }
    }
  };

  const handleSpeechResults = ({ value }) => {
    if (value && value.length > 0) {
      const text = value[0];
      console.log('[VOICE] 최종 인식 결과:', text);

      // 음성 인식 종료 처리
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        finalizeRecognition(text);
      }, 500);
    } else {
      reset('인식된 텍스트 없음');
    }
  };

  const handleSpeechError = (error) => {
    console.error('[VOICE] 음성 인식 오류:', error);

    // 네트워크 오류인 경우
    if (error.error?.message?.includes('network')) {
      setStatusMessage('네트워크 오류');
      reset('네트워크 오류');
      return;
    }

    // 인식 결과가 없는 경우
    if (error.error?.code === '7' || error.error?.code === 7) {
      recognitionAttempts.current += 1;

      if (recognitionAttempts.current < 3) {
        console.log('[VOICE] 다시 시도 중...');
        setStatusMessage('다시 듣는 중...');
        Voice.start('ko-KR').catch(() => reset('재시도 오류'));
        return;
      }
    }

    // 그 외 오류
    finalizeRecognition(recognizedText || '');
    setStatus('error');
    setStatusMessage('오류 발생');
  };

  const handleSpeechEnd = () => {
    console.log('[VOICE] 음성 인식 종료');

    // 이미 최종 결과가 처리되었거나 처리 중이면 무시
    if (status === 'processing' || status === 'idle') {
      return;
    }

    // 음성 인식 종료 후 짧은 지연 시간을 두고 종료 처리
    // (부분 인식 결과가 추가로 들어올 수 있음)
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      finalizeRecognition(recognizedText || '');
    }, 500);
  };

  const handleVolumeChanged = (e) => {
    // 음성 볼륨 변화는 UI 상태 변경에만 사용 (옵션)
    const volume = e.value;
    if (volume > 0.8) {
      // 볼륨이 큰 경우 UI 효과를 위한 설정 가능
    }
  };

  // 상태 초기화 함수
  const reset = (message = '준비 중...') => {
    clearTimeout(debounceTimer.current);
    clearTimeout(resetTimer.current);
    clearTimeout(recognitionTimeout.current);

    Voice.stop().catch(() => { });

    setStatus('idle');
    setVoiceActive(false);
    setStatusMessage(message);
    setRecognizedText('');

    activeVoiceMessageId.current = null;
    partialTextUpdateCallback.current = null;
    finalResultCallback.current = null;
    recognitionAttempts.current = 0;
  };

  // 훅 초기화 로직
  useEffect(() => {
    requestMicPermission();

    // 이벤트 리스너는 한 번만 등록
    const setupVoiceListeners = async () => {
      // 먼저 기존 리스너 정리
      try {
        await Voice.destroy();
      } catch (e) {
        console.log('Voice cleanup error (ignored):', e);
      }

      Voice.onSpeechStart = handleSpeechStart;
      Voice.onSpeechPartialResults = handleSpeechPartial;
      Voice.onSpeechResults = handleSpeechResults;
      Voice.onSpeechError = handleSpeechError;
      Voice.onSpeechEnd = handleSpeechEnd;
      Voice.onSpeechVolumeChanged = handleVolumeChanged;

      console.log('[VOICE] 이벤트 리스너 등록 완료');
    };

    setupVoiceListeners();

    return () => {
      // 타이머 정리
      clearTimeout(debounceTimer.current);
      clearTimeout(resetTimer.current);
      clearTimeout(recognitionTimeout.current);

      // Voice 정리
      const cleanup = async () => {
        try {
          await Voice.destroy();
        } catch (e) {
          console.log('Voice cleanup error (ignored):', e);
        }
      };
      cleanup();
    };
  }, []);

  return {
    status,
    hasPermission,
    recognizedText,
    statusMessage,
    voiceActive,
    activeVoiceMessageId,
    startListening,
    finalizeRecognition,
    reset,
    setVoiceActive,
    setStatus,
    setStatusMessage  // 이 부분이 추가됨
  };
}