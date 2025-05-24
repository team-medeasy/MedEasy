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
  
  // 음성 인식 지연 처리를 위한 추가 타이머들
  const silenceTimer = useRef(null);
  const lastSpeechTime = useRef(null);
  const hasReceivedSpeech = useRef(false);

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
      clearAllTimers();

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
      hasReceivedSpeech.current = false;
      lastSpeechTime.current = null;

      // 상태 업데이트 하나로 통합하여 렌더링 줄이기
      setStatus('listening');
      setStatusMessage('듣는 중...');

      console.log('[VOICE] 음성 인식 시작 직전', voiceMessageId);

      // 음성 인식 시작 - 옵션 간소화
      await Voice.start('ko-KR');

      // 전체 타임아웃 설정 (20초로 증가)
      recognitionTimeout.current = setTimeout(() => {
        console.log('[VOICE] 음성 인식 타임아웃');
        if (recognizedText) {
          finalizeRecognition(recognizedText);
        } else {
          reset('인식 시간 초과');
        }
      }, 20000);

    } catch (error) {
      console.error('[VOICE] 음성 인식 초기화 오류:', error);
      reset('시작 오류');
      throw error;
    }
  };

  // 모든 타이머를 정리하는 함수
  const clearAllTimers = () => {
    clearTimeout(debounceTimer.current);
    clearTimeout(resetTimer.current);
    clearTimeout(recognitionTimeout.current);
    clearTimeout(silenceTimer.current);
  };

  // 음성 인식 결과 처리 함수 - 수정된 버전
  const finalizeRecognition = (text) => {
    // 타이머 정리
    clearAllTimers();

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

  // 음성 감지 시간 업데이트 함수
  const updateLastSpeechTime = () => {
    lastSpeechTime.current = Date.now();
    hasReceivedSpeech.current = true;
  };

  // 침묵 감지 후 종료 처리 함수
  const handleSilenceDetection = () => {
    // 음성이 한 번도 감지되지 않았으면 계속 대기
    if (!hasReceivedSpeech.current) {
      return;
    }

    const now = Date.now();
    const silenceDuration = now - (lastSpeechTime.current || now);
    
    // 2.5초 이상 침묵이 지속되면 종료
    if (silenceDuration >= 2500) {
      console.log('[VOICE] 침묵 감지로 인한 종료, 침묵 시간:', silenceDuration);
      if (recognizedText) {
        finalizeRecognition(recognizedText);
      } else {
        reset('음성이 감지되지 않았습니다');
      }
    }
  };

  // 이벤트 핸들러들
  const handleSpeechStart = (e) => {
    console.log('[VOICE] 음성 인식 시작됨:', e);
    setStatus('listening');
    setStatusMessage('듣는 중...');
    recognitionAttempts.current = 0;
    updateLastSpeechTime();
  };

  const handleSpeechPartial = ({ value }) => {
    if (value && value.length > 0) {
      const partialText = value[0];
      console.log('[VOICE] 부분 인식 결과:', partialText);
      setRecognizedText(partialText);
      updateLastSpeechTime(); // 부분 인식 시에도 시간 업데이트

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
      updateLastSpeechTime();

      // 음성 인식 종료 처리 - 디바운스 시간을 1.5초로 증가
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        finalizeRecognition(text);
      }, 1500);
    } else {
      // 결과가 없어도 바로 종료하지 않고 잠시 대기
      clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        handleSilenceDetection();
      }, 1000);
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

    // 인식 결과가 없는 경우 (오류 코드 7)
    if (error.error?.code === '7' || error.error?.code === 7) {
      recognitionAttempts.current += 1;

      // 재시도 횟수를 5회로 증가하고, 음성이 감지된 경우에만 재시도
      if (recognitionAttempts.current < 5 && hasReceivedSpeech.current) {
        console.log('[VOICE] 다시 시도 중...', recognitionAttempts.current);
        setStatusMessage('다시 듣는 중...');
        
        setTimeout(() => {
          Voice.start('ko-KR').catch(() => reset('재시도 오류'));
        }, 500);
        return;
      } else if (!hasReceivedSpeech.current) {
        // 음성이 감지되지 않은 상태에서 오류가 발생하면 계속 대기
        console.log('[VOICE] 음성 미감지 상태에서 오류 발생, 재시도');
        setTimeout(() => {
          Voice.start('ko-KR').catch(() => reset('재시도 오류'));
        }, 1000);
        return;
      }
    }

    // 그 외 오류 - 인식된 텍스트가 있으면 사용
    if (recognizedText) {
      finalizeRecognition(recognizedText);
    } else {
      reset('음성 인식 오류');
    }
  };

  const handleSpeechEnd = () => {
    console.log('[VOICE] 음성 인식 종료 이벤트');

    // 이미 최종 결과가 처리되었거나 처리 중이면 무시
    if (status === 'processing' || status === 'idle') {
      return;
    }

    // 음성이 감지되지 않았으면 더 오래 대기
    if (!hasReceivedSpeech.current) {
      console.log('[VOICE] 음성 미감지 상태, 계속 대기');
      return;
    }

    // 음성 인식 종료 후 더 긴 지연 시간을 두고 종료 처리 (2초로 증가)
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (recognizedText) {
        finalizeRecognition(recognizedText);
      } else {
        // 텍스트가 없어도 침묵 감지 로직 사용
        handleSilenceDetection();
      }
    }, 2000);
  };

  const handleVolumeChanged = (e) => {
    // 음성 볼륨이 감지되면 시간 업데이트
    const volume = e.value;
    if (volume > 0.1) { // 볼륨 임계값을 낮춤
      updateLastSpeechTime();
    }
  };

  // 상태 초기화 함수
  const reset = (message = '준비 중...') => {
    clearAllTimers();

    Voice.stop().catch(() => { });

    setStatus('idle');
    setVoiceActive(false);
    setStatusMessage(message);
    setRecognizedText('');

    activeVoiceMessageId.current = null;
    partialTextUpdateCallback.current = null;
    finalResultCallback.current = null;
    recognitionAttempts.current = 0;
    hasReceivedSpeech.current = false;
    lastSpeechTime.current = null;
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
      clearAllTimers();

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
    setStatusMessage
  };
}