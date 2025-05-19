import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import Voice from '@react-native-voice/voice';
import Sound from 'react-native-sound';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';

import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { Header } from '../../components';
import ChatInfoModal from '../../components/Chat/ChatInfoModal';
import MessageBubble from '../../components/Chat/MessageBubble';
import MessageInput from '../../components/Chat/MessageInput';
import { OtherIcons } from '../../../assets/icons';

import WebSocketManager from '../../api/WebSocketManager';
import { capturePillsPhoto, cleanupTempAudioFiles, getRoutineVoice, registerPrescription } from '../../api/voiceChat';
import { getUser } from '../../api/user';
import { DEFAULT_BOT_OPTIONS } from '../../../assets/data/utils';
import { useNavigation } from '@react-navigation/native';

// 음성 인식 옵션 - 플랫폼별 설정
const recognizerOptions = Platform.OS === 'android' ? {
  REQUEST_PERMISSIONS_AUTO: true,
  EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1500,
  EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 1500,
  EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 500,
  EXTRA_PARTIAL_RESULTS: true,
} : {};

export default function VoiceChat() {
  const {fontSizeMode} = useFontSize();
  const navigation = useNavigation();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const audioPlayer = useRef(null);
  const debounceTimer = useRef(null);
  const resetTimer = useRef(null);
  const flatListRef = useRef(null);
  const wsManager = useRef(null);
  const pulseAnimation = useRef(null);
  const recognitionAttempts = useRef(0); // 음성 인식 시도 횟수 추적
  const activeVoiceMessageId = useRef(null); // 현재 업데이트 중인 음성 메시지 ID

  const [status, setStatus] = useState('idle');
  const [hasPermission, setHasPermission] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [recognizedText, setRecognizedText] = useState('');
  const [statusMessage, setStatusMessage] = useState('준비 중...');
  
  const [chatMode, setChatMode] = useState('text'); // 'text' 또는 'voice'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [initialWelcomeMessage, setInitialWelcomeMessage] = useState(null);
  const [initialWelcomeAudio, setInitialWelcomeAudio] = useState(null);
  const [userName, setUserName] = useState('');
  const [voiceActive, setVoiceActive] = useState(false); // 음성 인식 활성화 상태

  // 시간 포맷팅 함수
  const formatTimeString = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period} ${formattedHours}:${minutes}`;
  };

  // 웹소켓 매니저 초기화 및 웰컴 메시지 처리
  useEffect(() => {
    wsManager.current = WebSocketManager.getInstance();
    
    // 초기 메시지 수신을 위한 콜백 설정
    wsManager.current.setInitialMessageCallback((response) => {
      try {
        // 서버로부터 초기 메시지 수신
        if (response && response.text_message) {
          console.log('초기 메시지 수신:', response.text_message);
          
          setInitialWelcomeMessage({
            id: Date.now(),
            type: 'bot',
            text: response.text_message,
            time: formatTimeString(),
            options: DEFAULT_BOT_OPTIONS,
            isInitialMessage: true, // 초기 메시지임을 표시하는 플래그
          });
          
          // 음성 데이터가 있으면 저장
          if (response.audio_base64) {
            try {
              const timestamp = Date.now();
              const filePath = `${RNFS.CachesDirectoryPath}/welcome_${timestamp}.${response.audio_format || 'mp3'}`;
              
              RNFS.writeFile(filePath, response.audio_base64, 'base64')
                .then(() => {
                  console.log('초기 음성 파일 저장 완료:', filePath);
                  setInitialWelcomeAudio(filePath);
                })
                .catch(err => {
                  console.error('초기 음성 파일 저장 실패:', err);
                });
            } catch (error) {
              console.error('음성 파일 처리 오류:', error);
            }
          }
        }
      } catch (error) {
        console.error('초기 메시지 처리 오류:', error);
      }
    });
    
    // 웹소켓 연결
    wsManager.current.connect().catch(err => {
      console.error('[VoiceChat] WebSocket 연결 실패:', err);
    });
    
    // 사용자 정보 가져오기
    fetchUserInfo();
    
    // 컴포넌트 언마운트 시 자원 해제
    return () => {
      if (wsManager.current) {
        wsManager.current.disconnect();
      }
      
      if (audioPlayer.current) {
        audioPlayer.current.release();
        audioPlayer.current = null;
      }
      
      if (pulseAnimation.current) {
        pulseAnimation.current.stop();
      }
      
      clearTimeout(debounceTimer.current);
      clearTimeout(resetTimer.current);
      
      // 음성 인식 완전 정리
      Voice.destroy().then(() => {
        console.log('[VOICE] 음성 인식 자원 해제 완료');
      }).catch(err => {
        console.error('[VOICE] 음성 인식 자원 해제 오류:', err);
      });
    };
  }, []);
  
  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const { data } = await getUser();
      const name = data?.body?.name || '사용자';
      setUserName(name);
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
      setUserName('사용자');
    }
  };

  // 초기 메시지 표시 (웹소켓으로부터 받은 메시지가 있으면 사용, 없으면 기본 메시지)
  useEffect(() => {
    // 모달이 닫혀있고 메시지가 없는 경우에만 메시지 설정
    if (!showInfoModal && messages.length === 0) {
      if (initialWelcomeMessage) {
        // 서버에서 받은 초기 메시지 사용 (옵션 유지)
        setMessages([initialWelcomeMessage]);
        
        // 저장된 음성이 있으면 재생
        if (initialWelcomeAudio) {
          playAudioFile(initialWelcomeAudio);
        }
      } else {
        // 서버 메시지가 없으면 기본 메시지 사용 (옵션 유지)
        setMessages([
          {
            id: Date.now(),
            type: 'bot',
            text: `${userName || '사용자'}님, 안녕하세요☺️\n어떤 도움이 필요하신가요?`,
            time: formatTimeString(),
            options: ['약 검색', '루틴 등록', '처방전 촬영', '의약품 촬영', '오늘 복용 일정 확인'],
            isInitialMessage: true, // 초기 메시지임을 표시하는 플래그 추가
          },
        ]);
      }
    }
  }, [showInfoModal, initialWelcomeMessage, messages.length, userName]);

  // 오디오 파일 재생 함수
  const playAudioFile = (filePath) => {
    if (!filePath) return;
    
    if (audioPlayer.current) {
      audioPlayer.current.stop();
      audioPlayer.current.release();
      audioPlayer.current = null;
    }
    
    audioPlayer.current = new Sound(filePath, '', error => {
      if (error) {
        console.error('오디오 로드 오류:', error);
        return;
      }
      
      audioPlayer.current.play(success => {
        if (!success) {
          console.error('오디오 재생 실패');
        }
      });
    });
  };

  // 마이크 권한 및 음성 인식 초기화
  useEffect(() => {
    // 초기화 시 이전 Voice 세션 정리
    Voice.destroy().then(() => {
      console.log('[VOICE] 이전 Voice 세션 정리 완료');
      
      requestMicPermission();

      Voice.onSpeechStart = handleSpeechStart;
      Voice.onSpeechPartialResults = handleSpeechPartial;
      Voice.onSpeechResults = handleSpeechResults;
      Voice.onSpeechError = handleSpeechError;
      Voice.onSpeechEnd = handleSpeechEnd;
      Voice.onSpeechVolumeChanged = handleVolumeChanged;
    }).catch(err => {
      console.error('[VOICE] 이전 Voice 세션 정리 실패:', err);
      
      // 오류 발생 시에도 이벤트 핸들러는 등록
      requestMicPermission();
      
      Voice.onSpeechStart = handleSpeechStart;
      Voice.onSpeechPartialResults = handleSpeechPartial;
      Voice.onSpeechResults = handleSpeechResults;
      Voice.onSpeechError = handleSpeechError;
      Voice.onSpeechEnd = handleSpeechEnd;
      Voice.onSpeechVolumeChanged = handleVolumeChanged;
    });

    return () => {
      clearTimeout(debounceTimer.current);
      clearTimeout(resetTimer.current);
      
      // 안전하게 음성 인식 종료
      Voice.stop().catch(() => {});
      Voice.cancel().catch(() => {});
      Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
      
      if (audioPlayer.current) {
        audioPlayer.current.release();
        audioPlayer.current = null;
      }
    };
  }, []);

  // 상태와 권한이 idle + true일 때 자동 재시작 (음성 모드일 때만)
  useEffect(() => {
    let timeoutId;
    
    if (status === 'idle' && hasPermission && chatMode === 'voice' && !isTyping && !voiceActive) {
      console.log('[VOICE] Auto-startListening 예약됨, 1초 후 시작');
      // 상태 변경 후 약간의 지연을 두고 시작
      timeoutId = setTimeout(() => {
        startListening();
      }, 1000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [status, hasPermission, chatMode, isTyping, voiceActive]);

  // 인식된 텍스트가 있으면 자동 제출 타이머 설정
  useEffect(() => {
    if (status === 'listening' && recognizedText) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        console.log('[VOICE] Debounce timeout, finalizing:', recognizedText);
        finalizeRecognition(recognizedText);
      }, 2500); // 2.5초 동안 새 입력이 없으면 자동 전송
    }
    return () => clearTimeout(debounceTimer.current);
  }, [recognizedText, status]);

  // 새 메시지가 추가될 때마다 스크롤 맨 아래로 이동
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  async function requestMicPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "마이크 사용 권한 필요",
            message: "음성 인식을 위해 마이크 사용 권한이 필요합니다.",
            buttonNeutral: "나중에 묻기",
            buttonNegative: "거부",
            buttonPositive: "허용"
          }
        );
        
        const permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('[VOICE] 마이크 권한 상태:', permissionGranted);
        setHasPermission(permissionGranted);
        
        if (!permissionGranted) {
          setStatusMessage('마이크 권한이 필요합니다');
        }
      } else {
        // iOS의 경우 권한 요청은 Voice.start()에서 자동으로 처리됨
        setHasPermission(true);
      }
    } catch (err) {
      console.error('[VOICE] 권한 요청 오류:', err);
      setHasPermission(false);
      setStatusMessage('권한 요청 실패');
    }
  }

  async function startListening() {
    if (!hasPermission || isTyping || voiceActive) {
      console.log('[VOICE] 음성 인식 시작 불가:', { hasPermission, status, isTyping, voiceActive });
      return;
    }
    
    try {
      // 진행 중인 음성 인식이 있는지 확인하고 정리
      setVoiceActive(true);
      
      // 음성 인식 시작 전 항상 이전 인스턴스 정리
      try {
        await Voice.cancel();
        await Voice.stop();
      } catch (e) {
        // 오류 무시 - 이미 멈춰있거나 취소되었을 수 있음
        console.log('[VOICE] 이전 인스턴스 정리 중 무시된 오류:', e.message);
      }
      
      // 약간의 지연 추가
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 기존 음성 재생 중단
      if (audioPlayer.current) {
        audioPlayer.current.stop();
      }
      
      setStatus('listening');
      setStatusMessage('듣는 중...');
      setRecognizedText('');
      
      // 언어 설정 확인
      const available = await Voice.isAvailable();
      console.log('[VOICE] 음성 인식 가능 여부:', available);
      
      if (!available) {
        throw new Error('음성 인식을 사용할 수 없습니다');
      }
      
      // 현재 시도 횟수 증가
      recognitionAttempts.current += 1;
      
      // 인식 옵션 업데이트 - 시도 횟수에 따라 타임아웃 값 조정
      const updatedOptions = Platform.OS === 'android' ? {
        ...recognizerOptions,
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 500,
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 
          Math.min(1500 + (recognitionAttempts.current * 100), 2500), // 시도 횟수에 따라 점진적으로 증가
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 
          Math.min(1500 + (recognitionAttempts.current * 100), 2500),
      } : {};
      
      // 음성 인식 시작 전에 임시 사용자 메시지 버블 추가
      const voiceMessageId = Date.now();
      activeVoiceMessageId.current = voiceMessageId;
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: voiceMessageId,
          type: 'user',
          text: '듣는 중...',
          time: formatTimeString(),
          isVoiceRecognizing: true, // 음성 인식 중인 메시지임을 표시
        }
      ]);
      
      await Voice.start('ko-KR', updatedOptions);
      startPulseAnimation();
    } catch (error) {
      console.error('[VOICE] 음성 인식 시작 오류:', error);
      // 오류 처리 및 재시도 로직
      setVoiceActive(false);
      
      // 임시 메시지 제거
      if (activeVoiceMessageId.current) {
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== activeVoiceMessageId.current)
        );
        activeVoiceMessageId.current = null;
      }
      
      // 오류 발생 시 2초 후에 재시도
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        reset('인식 오류 - 재시작');
      }, 2000);
    }
  }

  function handleSpeechStart(e) {
    console.log('[VOICE] onSpeechStart', e);
    setStatus('listening');
    setStatusMessage('듣는 중...');
    startPulseAnimation();
  }

  function handleSpeechPartial({ value }) {
    if (value && value.length > 0) {
      const text = value[0].trim();
      if (text) {
        setRecognizedText(text);
        
        // 현재 음성 인식 중인 메시지 버블 업데이트
        if (activeVoiceMessageId.current) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === activeVoiceMessageId.current 
                ? { ...msg, text: text, isVoiceRecognizing: false } 
                : msg
            )
          );
        }
      }
    }
  }

  function handleSpeechResults({ value }) {
    if (value && value.length > 0) {
      const text = value[0].trim();
      console.log('[VOICE] onSpeechResults, text:', text);
      
      if (text && status === 'listening') {
        finalizeRecognition(text);
      }
    }
  }

  function handleSpeechError(error) {
    console.error('[VOICE] 음성 인식 오류:', error);
    
    // 오류 코드별 처리
    if (error.error) {
      if (error.error.message === 'Speech recognition already started!') {
        console.log('[VOICE] 이미 시작된 인식 세션 발견, 재설정 중...');
        Voice.cancel().then(() => {
          setVoiceActive(false);
          setTimeout(() => {
            reset('재설정 중...');
          }, 500);
        }).catch(() => {
          setVoiceActive(false);
          reset('재설정 중...');
        });
        return;
      }
      
      if (error.error.code === 'recognition_fail' || error.error.code === '7' || error.error.code === '5') {
        // 네트워크 오류 또는 권한 문제
        setStatusMessage('연결 오류 - 잠시 후 재시도...');
      } else if (error.error.code === '6' || error.error.message?.includes('No speech detected')) {
        // 타임아웃 - 말을 하지 않음
        setStatusMessage('음성이 감지되지 않았습니다');
      } else {
        setStatusMessage('인식 오류 - 재시도');
      }
    } else {
      setStatusMessage('인식 오류 - 재시도');
    }
    
    stopPulseAnimation();
    setVoiceActive(false);
    
    // 음성 인식 중 오류 발생 시 임시 메시지 제거
    if (activeVoiceMessageId.current) {
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== activeVoiceMessageId.current)
      );
      activeVoiceMessageId.current = null;
    }
    
    // 오류 후 잠시 지연시간을 두고 재설정
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      reset();
    }, 2000);
  }

  function handleSpeechEnd() {
    console.log('[VOICE] onSpeechEnd');
    // 종료 이벤트는 무시하고 debounce 타이머에 맡김
  }

  function handleVolumeChanged(e) {
    // 볼륨 변화에 따라 애니메이션 강도 조절 가능
    // console.log('[VOICE] Volume:', e.value);
  }

  const handleApiError = (error, typingMsgId, fallbackText = '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.') => {
    console.error('[VoiceChat] API 오류:', error);
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === typingMsgId
          ? { ...msg, text: fallbackText, isTyping: false }
          : msg
      )
    );
    setIsTyping(false);
    reset('오류 발생 - 재시도');
  };

  function finalizeRecognition(text) {
    clearTimeout(debounceTimer.current);
    Voice.stop().catch(() => {});
    
    stopPulseAnimation();
    setStatus('processing');
    setStatusMessage('메시지 처리 중...');
    setVoiceActive(false);
    
    // 시도 횟수 초기화 (음성 인식 성공)
    recognitionAttempts.current = 0;
    
    // 임시 음성 인식 메시지를 정식 메시지로 변경
    if (activeVoiceMessageId.current) {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === activeVoiceMessageId.current 
            ? { ...msg, text, isVoiceRecognizing: false } 
            : msg
        )
      );
      activeVoiceMessageId.current = null;
    } else {
      // 만약 임시 메시지가 없었다면 새로 추가
      addMessage(text, 'user');
    }
    
    // 로봇이 입력 중인 메시지 표시
    const typingMsgId = Date.now() + 100; // 고유한 ID 보장
    setTypingMessageId(typingMsgId);
    setIsTyping(true);
    
    setMessages(prevMessages => [
      ...prevMessages,
      {id: typingMsgId, type: 'bot', text: '...', time: formatTimeString(), isTyping: true},
    ]);
    
    processRecognizedText(text, typingMsgId);
  }

  async function processRecognizedText(text, typingMsgId) {
    try {
      await cleanupTempAudioFiles();
      
      // WebSocketManager를 통해 메시지 전송
      const response = await wsManager.current.sendMessage(text);
      
      // 응답에서 텍스트와 파일 경로 추출
      const { text: responseText, filePath, action } = response;
      
      // 응답 음성 재생 및 메시지 표시
      playBotResponse(filePath, typingMsgId, responseText, action);

      // 액션 처리
      handleAction(action);
    } catch (error) {
      handleApiError(error, typingMsgId, '죄송합니다. 응답을 받아오는 데 실패했습니다.');
    }
  }

  function playBotResponse(path, typingMsgId, responseText, action) {
    console.log('[VOICE] playBotResponse:', path);
    Voice.cancel().catch(() => {});

    setStatus('playing');
    setStatusMessage('응답 듣는 중...');

    if (audioPlayer.current) {
      audioPlayer.current.stop();
      audioPlayer.current.release();
      audioPlayer.current = null;
    }

    if (!path) {
      console.log('[VOICE] 음성 파일 없음, 텍스트만 표시');
      // 타이핑 메시지를 실제 메시지로 교체 (음성 파일이 없는 경우)
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === typingMsgId 
            ? {...msg, text: responseText, isTyping: false} 
            : msg
        )
      );
      
      setIsTyping(false);
      reset();
      return;
    }

    // 음성 재생
    audioPlayer.current = new Sound(path, '', error => {
      if (error) {
        console.error('[VoiceChat] 음성 파일 로드 오류:', error);
        
        // 타이핑 메시지를 실제 메시지로 교체 (오류 발생해도 텍스트는 표시)
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === typingMsgId 
              ? {...msg, text: responseText, isTyping: false} 
              : msg
          )
        );
        
        setIsTyping(false);
        reset();
        return;
      }
      
      audioPlayer.current.play(success => {
        console.log('[VOICE] 음성 재생 완료:', success);
        
        // 타이핑 메시지를 실제 메시지로 교체
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === typingMsgId 
              ? {...msg, text: responseText, isTyping: false} 
              : msg
          )
        );
        
        setIsTyping(false);
        reset(); // 이 시점에서 idle로 돌아감
      });
    });
  }

  function reset(message = '준비 중...') {
    console.log('[VOICE] reset -> idle:', message);
    Voice.cancel().catch(() => {});
    setStatus('idle');
    setStatusMessage(message);
    setRecognizedText('');
    setVoiceActive(false);
    
    // 음성 인식 중인 임시 메시지가 남아있다면 제거
    if (activeVoiceMessageId.current) {
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== activeVoiceMessageId.current)
      );
      activeVoiceMessageId.current = null;
    }
  }

  function startPulseAnimation() {
    stopPulseAnimation();
    
    pulseAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { 
          toValue: 1.2, 
          duration: 800, 
          useNativeDriver: true 
        }),
        Animated.timing(scaleAnim, { 
          toValue: 1.0, 
          duration: 800, 
          useNativeDriver: true 
        }),
      ])
    );
    
    pulseAnimation.current.start();
  }

  function stopPulseAnimation() {
    if (pulseAnimation.current) {
      pulseAnimation.current.stop();
    }
    scaleAnim.setValue(1);
  }

  function getCircleColor() {
    switch (status) {
      case 'listening': return themes.light.textColor.buttonText;
      case 'processing': return themes.light.textColor.Primary50;
      case 'playing': return themes.light.pointColor.Secondary;
      case 'error': return themes.light.pointColor.Secondary;
      default: return themes.light.boxColor.buttonPrimary;
    }
  }

  // 텍스트 채팅 모드에서 메시지 전송
  const sendTextMessage = async () => {
    if (inputText.trim() === '') return;
    
    const userMessage = inputText;
    setInputText(''); // 먼저 입력 필드를 비우기
    
    // 사용자 메시지 추가
    addMessage(userMessage, 'user');

    // 로봇이 입력 중인 메시지 표시
    const typingMsgId = Date.now() + 1; // 사용자 메시지와 구분되는 ID 사용
    setTypingMessageId(typingMsgId);
    setIsTyping(true);
    
    // 타이핑 메시지 추가
    setMessages(prevMessages => [
      ...prevMessages,
      {id: typingMsgId, type: 'bot', text: '...', time: formatTimeString(), isTyping: true},
    ]);

    try {
      // 임시 음성 파일 정리
      await cleanupTempAudioFiles();
      
      // WebSocketManager를 통해 메시지 전송
      const { text: responseText, filePath, action } = await wsManager.current.sendMessage(userMessage);
      
      // 타이핑 메시지를 실제 메시지로 교체
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === typingMsgId 
            ? {...msg, text: responseText, isTyping: false} 
            : msg
        )
      );
      setIsTyping(false);
      
      // 음성 재생
      if (filePath) {
        playAudioFile(filePath);
      }

      // 액션 처리
      handleAction(action);
    } catch (error) {
      handleApiError(error, typingMsgId, '죄송합니다. 응답을 받아오는 데 실패했습니다.');
    }
  };

  // 채팅 모드 전환 (텍스트 <-> 음성)
  const toggleChatMode = () => {
    // 현재 진행 중인 음성 인식 취소
    Voice.cancel().catch(() => {});
    stopPulseAnimation();
    
    if (chatMode === 'text') {
      setChatMode('voice');
      // 음성 모드로 전환 후 지연시간을 두고 리스닝 시작
      setTimeout(() => {
        if (hasPermission && !isTyping) {
          reset('음성 인식 준비 중...'); // 음성 모드 진입 상태 초기화
          setTimeout(() => {
            startListening();
          }, 500);
        }
      }, 300);
    } else {
      // 텍스트 모드로 변경
      setChatMode('text');
      setVoiceActive(false);
      setStatus('idle');
    }
  };

  // 공통 메시지 추가 함수
  const addMessage = (text, type) => {
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    
    setMessages(prevMessages => [
      ...prevMessages,
      {id: uniqueId, type, text, time: formatTimeString()},
    ]);
  };

  // 액션 처리를 위한 별도 함수
  const handleAction = (action) => {
    if (!action) return;
    
    console.log(`[VOICE] 액션 처리: ${action}`);
    
    switch (action) {
      case 'CAPTURE_PRESCRIPTION':
        console.log('[VOICE] client_action: CAPTURE_PRESCRIPTION - 카메라 화면으로 이동합니다.');
        navigation.navigate('Camera');
        break;
        
      case 'CAPTURE_PILLS_PHOTO':
        console.log('[VOICE] client_action: CAPTURE_PILLS_PHOTO - 약 사진 촬영 화면으로 이동합니다.');
        navigation.navigate('Camera');
        break;
        
      // 필요한 다른 액션 케이스 추가 가능
      
      default:
        console.log(`[VOICE] 정의되지 않은 액션: ${action}`);
        break;
    }
  };

  // 봇 옵션 선택 처리
  const handleBotOptionPress = async (option) => {
    // 이전에 재생 중이던 음성 중지
    if (audioPlayer.current) {
      audioPlayer.current.stop();
      audioPlayer.current.release();
      audioPlayer.current = null;
    }

    // 선택한 옵션을 사용자 메시지로 먼저 표시
    addMessage(option, 'user');

    // 처리 중인 상태 설정
    setStatus('processing'); 
    setIsTyping(true);

    // 타이핑 메시지 추가
    const typingMsgId = Date.now();
    setTypingMessageId(typingMsgId);
    setMessages(prev => [
      ...prev,
      { id: typingMsgId, type: 'bot', text: '...', time: formatTimeString(), isTyping: true },
    ]);

    try {
      let response;
      
      if (option === '오늘 복용 일정 확인') {
        await cleanupTempAudioFiles(); 
        response = await getRoutineVoice();
      } else if (option === '처방전 촬영') {
        response = await registerPrescription();
      } else if (option === '의약품 촬영') {
        response = await capturePillsPhoto();
      } else {
        response = await wsManager.current.sendMessage(option);
      }
      
      const { text, filePath, action } = response;
      
      // 응답 메시지 표시
      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMsgId ? { ...msg, text, isTyping: false, options: DEFAULT_BOT_OPTIONS } : msg
        )
      );
      
      // 음성 재생
      if (filePath) {
        playAudioFile(filePath);
      }
      
      // 액션 처리
      handleAction(action);
      
      setIsTyping(false);
      reset();
    } catch (err) {
      handleApiError(err, typingMsgId);
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowInfoModal(false);
    if (hasPermission && chatMode === 'voice') {
      setStatus('idle'); // 음성 인식 트리거를 위한 상태 설정
    }
  };

  const renderMessage = ({ item }) => {
    return <MessageBubble item={item} onOptionPress={handleBotOptionPress} />;
  };

  return (
    <Container>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header 
          hideBorder='true' 
          transparentBg='true' 
          titleColor={themes.light.textColor.buttonText}
          iconColor={themes.light.textColor.buttonText}>
          AI 채팅
        </Header>

        {/* 채팅 이용 안내 모달 */}
        <ChatInfoModal
          visible={showInfoModal}
          onClose={handleCloseModal}
        />

        {/* 채팅 메시지 목록 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: chatMode === 'voice' ? 200 : 16 // 음성 모드일 때 하단 여백 추가
          }}
          showsVerticalScrollIndicator={false} // 스크롤바 숨기기
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }}
          onLayout={() => {
            if (messages.length > 0) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }}
        />

        {/* 음성 모드 UI */}
        {chatMode === 'voice' && (
          <VoiceInputContainer>
            <VoiceCenterContainer>
              <StatusText fontSizeMode={fontSizeMode}>{statusMessage}</StatusText>
              <AnimatedCircleContainer>
                <AnimatedCircle 
                  style={{ transform: [{ scale: scaleAnim }] }} 
                  color={getCircleColor()} 
                />
                <TextModeButton onPress={() => {
                    Voice.cancel();
                    stopPulseAnimation();
                    setStatus('idle');
                    setChatMode('text');
                  }}>
                  <OtherIcons.delete
                    height={20}
                    width={20}
                    style={{color: themes.light.textColor.buttonText}}
                  />
                </TextModeButton>
              </AnimatedCircleContainer>
            </VoiceCenterContainer>
            
            {/* <RecognizedTextContainer>
              <RecognizedText fontSizeMode={fontSizeMode}>
                {recognizedText || '말씀해주세요...'}
              </RecognizedText>
            </RecognizedTextContainer> */}
          </VoiceInputContainer>
        )}

        {/* 텍스트 입력 컴포넌트 */}
        {chatMode === 'text' && (
          <MessageInput
            inputText={inputText}
            setInputText={setInputText}
            sendMessage={sendTextMessage}
            toggleVoiceMode={toggleChatMode}
            isDisabled={isTyping}
          />
        )}
      </KeyboardAvoidingView>
      <View
        style={{
          width: '100%',
          height: 20,
        }}
      />
    </Container>
  );
}

const Container = styled(LinearGradient).attrs({
  colors: [themes.light.pointColor.PrimaryDark, '#000000'],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  flex: 1;
`;

const VoiceInputContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  z-index: 10;
`;

const VoiceCenterContainer = styled.View`
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const AnimatedCircleContainer = styled.View`
  position: relative;
  align-items: center;
  justify-content: center;
`;

const AnimatedCircle = styled(Animated.View)`
  width: 100px;
  height: 100px;
  background-color: ${props => props.color};
  border-radius: 50px;

  /* iOS 그림자 */
  shadow-color: ${props => props.color};
  shadow-offset: 0px 0px;
  shadow-opacity: 0.8;
  shadow-radius: 10px;

  /* Android 그림자 (elevation) */
  elevation: 10;
`;

const StatusText = styled(Text)`
  margin-bottom: 17px;
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.buttonText};
  font-weight: bold;
  text-align: center;
`;

const TextModeButton = styled(TouchableOpacity)`
  position: absolute;
  right: -100px;
  align-items: center;
  justify-content: center;
`;

const RecognizedTextContainer = styled(View)`
  padding: 12px;
  background-color: ${themes.light.boxColor.inputPrimary}50;
  border-radius: 10px;
`;

const RecognizedText = styled(Text)`
  font-size: ${({fontSizeMode}) => FontSizes.body[fontSizeMode]};
  color: ${themes.light.textColor.buttonText};
`;