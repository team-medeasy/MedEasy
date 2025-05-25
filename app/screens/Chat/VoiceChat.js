import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
  AppState,
  BackHandler,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import RNFS from 'react-native-fs';

import {themes} from '../../styles';
import {useFontSize} from '../../../assets/fonts/FontSizeContext';
import {Header} from '../../components';
import ChatInfoModal from '../../components/Chat/ChatInfoModal';
import MessageBubble from '../../components/Chat/MessageBubble';
import MessageInput from '../../components/Chat/MessageInput';
import VoiceInputUI from '../../components/Chat/VoiceInputUI';

import {getUser} from '../../api/user';
import {
  handleClientAction,
  registerCommonActionHandlers,
} from '../../utils/chatActionHandler';
import {DEFAULT_BOT_OPTIONS} from '../../../assets/data/utils';

// 커스텀 훅 불러오기
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import useChatMessages from '../../hooks/useChatMessages';
import usePulseAnimation from '../../hooks/usePulseAnimation';
import useWebSocketChat from '../../hooks/useWebSocketChat';

export default function VoiceChat() {
  const {fontSizeMode} = useFontSize();
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // 커스텀 훅 사용
  const {
    status,
    hasPermission,
    statusMessage,
    voiceActive,
    startListening,
    reset,
    setVoiceActive,
    setStatus,
    setStatusMessage,
  } = useVoiceRecognition();

  const {playAudioFile, cleanupAudio, isPlaying} = useAudioPlayer();

  const {
    messages,
    isTyping,
    addMessage,
    startTypingMessage,
    finishTypingMessage,
    updateVoiceMessage,
    removeActiveVoiceMessage,
    forceStopTyping,
    clearVoiceRecognizingMessages,
  } = useChatMessages();

  const {scaleAnim, startPulseAnimation, stopPulseAnimation} =
    usePulseAnimation();

  const {
    sendMessage,
    getRoutineVoice,
    registerPrescription,
    uploadPrescriptionPhoto,
    capturePillsPhoto,
    uploadPillsPhoto,
    cleanupTempAudioFiles,
    registerActionHandler,
  } = useWebSocketChat();

  const [showInfoModal, setShowInfoModal] = useState(true);
  const [chatMode, setChatMode] = useState('text');
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [initialWelcomeMessage, setInitialWelcomeMessage] = useState(null);
  const [initialWelcomeAudio, setInitialWelcomeAudio] = useState(null);
  const [audioPlaybackInProgress, setAudioPlaybackInProgress] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [isImageAnalysisInProgress, setIsImageAnalysisInProgress] =
    useState(false);

  // 웰컴 오디오 저장 함수
  const saveWelcomeAudio = async (base64Audio, audioFormat = 'mp3') => {
    try {
      const timestamp = Date.now();
      const filePath = `${RNFS.CachesDirectoryPath}/welcome_${timestamp}.${audioFormat}`;

      await RNFS.writeFile(filePath, base64Audio, 'base64');
      console.log('[AUDIO] 초기 음성 파일 저장 완료:', filePath);
      return filePath;
    } catch (error) {
      console.error('[AUDIO] 초기 음성 파일 저장 오류:', error);
      return null;
    }
  };

  // 시간 포맷팅 함수
  const formatTimeString = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period} ${formattedHours}:${minutes}`;
  };

  // 음성 제어 함수들을 묶은 객체 생성
  const voiceControls = {
    cleanupAudio,
    stopPulseAnimation,
    resetVoiceState: () => {
      reset('준비 중...');
      setVoiceActive(false);
    },
    setAudioPlaybackInProgress,
    setNavigatingAway: setIsNavigatingAway,
    setImageAnalysisInProgress: setIsImageAnalysisInProgress,
  };

  // 앱 상태 변화 감지
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[CHAT] 앱이 포그라운드로 돌아옴');
        // 앱이 백그라운드에서 포그라운드로 돌아올 때
        cleanupTempAudioFiles(); // 임시 파일 정리

        // 음성 모드였다면 상태 초기화
        if (chatMode === 'voice') {
          reset('준비 중...'); // 상태 초기화
          setAudioPlaybackInProgress(false);
        }
      } else if (
        nextAppState.match(/inactive|background/) &&
        appStateRef.current === 'active'
      ) {
        console.log('[CHAT] 앱이 백그라운드로 전환됨');
        // 앱이 포그라운드에서 백그라운드로 갈 때
        cleanupAudio(); // 오디오 재생 중지
        Voice.cancel().catch(() => {}); // 음성 인식 중지
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [chatMode]);

  // 화면 포커스 변화 감지
  useFocusEffect(
    useCallback(() => {
      console.log('[CHAT] 화면 포커스 얻음');

      // 화면으로 돌아왔을 때 네비게이션 플래그 해제
      setIsNavigatingAway(false);

      // 백 버튼 핸들러 (안드로이드)
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          // 오디오 및 음성 인식 정리
          cleanupAudio();
          Voice.cancel().catch(() => {});
          stopPulseAnimation();
          return false; // 기본 뒤로가기 동작 허용
        },
      );

      return () => {
        console.log('[CHAT] 화면 포커스 잃음');
        backHandler.remove();

        // 화면 이탈 시 정리
        cleanupAudio();
        Voice.cancel().catch(() => {});
        stopPulseAnimation();
      };
    }, []),
  );

  // 상태 메시지 관리
  useEffect(() => {
    if (audioPlaybackInProgress && chatMode === 'voice') {
      setStatus('processing');
      setStatusMessage('응답 듣는 중...');
    } else if (
      !audioPlaybackInProgress &&
      status === 'processing' &&
      chatMode === 'voice'
    ) {
      setStatusMessage('곧 다시 듣기 시작합니다...');
    }
  }, [audioPlaybackInProgress, chatMode]);

  // 오디오 재생 함수 (안정성 개선)
  const playAudioWithCompletion = useCallback(
    filePath => {
      if (!filePath) {
        console.log('[AUDIO] 재생할 파일 경로가 없음, 상태 초기화');
        setAudioPlaybackInProgress(true);
        setTimeout(() => {
          setAudioPlaybackInProgress(false);
          if (chatMode === 'voice') {
            setTimeout(() => {
              console.log('[AUDIO] 자동 재시작을 위한 상태 설정');
              setStatus('idle');
            }, 300);
          }
        }, 1000);
        return;
      }

      RNFS.exists(filePath)
        .then(exists => {
          if (!exists) {
            console.log('[AUDIO] 파일이 존재하지 않음:', filePath);
            setAudioPlaybackInProgress(false);
            if (chatMode === 'voice') {
              reset('준비 완료');
            }
            return;
          }

          console.log('[AUDIO] 새 오디오 재생 시작');
          setAudioPlaybackInProgress(true);
          if (chatMode === 'voice') {
            setStatus('processing');
            setStatusMessage('응답 듣는 중...');
          }

          cleanupAudio();

          playAudioFile(filePath, () => {
            console.log('[AUDIO] 재생 완료, 음성 인식 재개 준비');

            if (chatMode === 'voice') {
              setStatusMessage('곧 다시 듣기 시작합니다...');
            }

            setTimeout(() => {
              console.log('[AUDIO] 오디오 재생 완료 후 상태 변경');
              setAudioPlaybackInProgress(false);

              if (chatMode === 'voice') {
                console.log('[AUDIO] 음성 인식 자동 재시작을 위한 상태 설정');

                // 타이핑 상태 한 번 더 확인하고 해제
                setTimeout(() => {
                  if (isTyping) {
                    console.warn(
                      '[AUDIO] 타이핑 상태가 여전히 true - 강제 해제',
                    );
                    forceStopTyping();
                  }

                  setTimeout(() => {
                    setStatus('idle');
                    console.log('[AUDIO] 음성 인식 재시작 상태 설정 완료');
                  }, 100);
                }, 100);
              }
            }, 300); // 지연 시간을 300ms로 줄임
          });
        })
        .catch(error => {
          console.error('[AUDIO] 파일 확인 오류:', error);
          setAudioPlaybackInProgress(false);
          if (chatMode === 'voice') {
            reset('준비 완료');
          }
        });
    },
    [
      chatMode,
      playAudioFile,
      setStatus,
      cleanupAudio,
      setStatusMessage,
      isTyping,
    ],
  );

  const playAudioWithImageAnalysisCompletion = useCallback(
    filePath => {
      if (!filePath) {
        console.log('[AUDIO] 이미지 분석: 재생할 파일 없음, 즉시 상태 해제');
        setIsImageAnalysisInProgress(false);
        setAudioPlaybackInProgress(false);
        return;
      }

      RNFS.exists(filePath)
        .then(exists => {
          if (!exists) {
            console.log('[AUDIO] 이미지 분석: 파일이 존재하지 않음');
            setIsImageAnalysisInProgress(false);
            setAudioPlaybackInProgress(false);
            return;
          }

          console.log('[AUDIO] 이미지 분석 결과 음성 재생 시작');
          setAudioPlaybackInProgress(true);

          cleanupAudio();

          playAudioFile(filePath, () => {
            console.log('[AUDIO] 이미지 분석 결과 음성 재생 완료');

            // 재생 완료 후 2초 딜레이를 두고 상태 해제
            setTimeout(() => {
              console.log('[AUDIO] 이미지 분석 완료 - 음성 인식 재개 허용');
              setIsImageAnalysisInProgress(false);
              setAudioPlaybackInProgress(false);

              // 음성 모드인 경우 추가 딜레이 후 음성 인식 상태 설정
              if (chatMode === 'voice') {
                setTimeout(() => {
                  setStatus('idle');
                  console.log('[AUDIO] 음성 인식 재시작 상태 설정 완료');
                }, 500);
              }
            }, 2000); // 2초 딜레이로 단축
          });
        })
        .catch(error => {
          console.error('[AUDIO] 이미지 분석: 파일 확인 오류:', error);
          setIsImageAnalysisInProgress(false);
          setAudioPlaybackInProgress(false);
        });
    },
    [chatMode, playAudioFile, cleanupAudio, setStatus],
  );

  // 네비게이션 파라미터 감지하여 카메라 결과 처리
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // route.params에서 사진 URI 및 기타 데이터 확인
      const {photoUri, isPrescription, actionType, timestamp, photoProcessed} =
        route.params || {};

      // photoProcessed 플래그가 있는 경우에만 처리
      if (
        photoUri &&
        timestamp &&
        photoProcessed === true &&
        !isProcessingImage
      ) {
        console.log(`[CHAT] 카메라에서 돌아옴, 이미지 처리 시작`);

        // ========== 추가된 부분: 즉시 이미지 분석 상태 설정 ==========
        setIsImageAnalysisInProgress(true);
        console.log('[CHAT] 이미지 분석 상태 설정됨 - 음성 인식 차단');

        // 현재 진행 중인 음성 인식 강제 중지
        Voice.cancel().catch(() => {});
        cleanupAudio();
        stopPulseAnimation();
        reset('이미지 분석 중...');
        setVoiceActive(false);
        // =========================================================

        setIsProcessingImage(true);

        // 사용자 업로드 메시지 추가
        const userMessage = isPrescription
          ? '처방전 사진을 업로드했어요'
          : '알약 사진을 업로드했어요';
        addMessage(userMessage, 'user');

        // 스크롤 처리
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({animated: true});
          }
        }, 50);

        // 이미지를 Base64로 변환
        RNFS.readFile(photoUri, 'base64')
          .then(base64Image => {
            // 액션 타입 결정
            const actionToUse = isPrescription ? 'PRESCRIPTION' : 'PILLS';

            // 처리 중 메시지 시작
            const typingMsgId = startTypingMessage();

            // 이미지 전송 처리 - 이미 사용자 메시지를 추가했으므로 true로 설정
            handleImageUpload(base64Image, actionToUse, typingMsgId, true);

            // 파라미터 초기화
            navigation.setParams({
              photoUri: null,
              isPrescription: null,
              actionType: null,
              timestamp: null,
              photoProcessed: null,
            });
          })
          .catch(error => {
            console.error('[CHAT] 이미지 변환 오류:', error);
            addMessage('이미지 처리 중 오류가 발생했습니다', 'bot');

            // ========== 추가된 부분: 오류 시 이미지 분석 상태 해제 ==========
            setIsImageAnalysisInProgress(false);
            // ===============================================================

            navigation.setParams({
              photoUri: null,
              isPrescription: null,
              actionType: null,
              timestamp: null,
              photoProcessed: null,
            });
          })
          .finally(() => {
            setIsProcessingImage(false);
          });
      }
    });

    return unsubscribe;
  }, [navigation, isProcessingImage, addMessage, startTypingMessage]);

  // 이미지 업로드 핸들러 함수
  const handleImageUpload = async (
    base64Image,
    actionType,
    typingMsgId,
    skipProcessingMessage = false,
  ) => {
    try {
      // 1. 타이핑 메시지 제거 (있는 경우)
      if (typingMsgId) {
        removeActiveVoiceMessage(typingMsgId);
      }

      // 2. 분석 중 메시지는 서버에서 보내주므로 클라이언트에서 추가하지 않음
      // (서버 응답에서 "업로드된 처방전/의약품 사진을 분석 중입니다" 메시지가 온다)

      // 3. API 호출
      let response;
      const startTime = Date.now();

      if (actionType === 'PRESCRIPTION') {
        console.log('[CHAT] 처방전 이미지 업로드 시작');
        response = await uploadPrescriptionPhoto(base64Image);
      } else {
        console.log('[CHAT] 알약 이미지 업로드 시작');
        response = await uploadPillsPhoto(base64Image);
      }

      // 4. 응답 처리
      const {text, filePath, action, data} = response;

      // 5. 최소 대기 시간 설정
      const responseTime = Date.now() - startTime;
      if (responseTime < 1500) {
        await new Promise(resolve => setTimeout(resolve, 1500 - responseTime));
      }

      // 6. 서버에서 받은 메시지 표시 (이미 분석 중 메시지 포함)
      addMessage(text, 'bot', DEFAULT_BOT_OPTIONS);

      // 스크롤 처리
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({animated: true});
        }
      }, 50);

      // 7. 이미지 분석 전용 음성 재생 사용
      if (filePath) {
        playAudioWithImageAnalysisCompletion(filePath);
      } else {
        // 음성 파일이 없는 경우 즉시 상태 해제
        console.log('[CHAT] 이미지 분석 완료 (음성 없음) - 상태 즉시 해제');
        setIsImageAnalysisInProgress(false);
        setAudioPlaybackInProgress(false);
      }

      // 8. 액션 처리는 이미지 분석이 완료된 후 실행
      if (action) {
        // 액션 처리를 지연시켜서 음성 재생이 완료된 후 실행
        setTimeout(
          () => {
            handleClientAction(action, navigation, {data, voiceControls});
          },
          filePath ? 5000 : 1000,
        ); // 음성이 있으면 5초, 없으면 1초 후
      }
    } catch (error) {
      console.error('[CHAT] 이미지 업로드 오류:', error);
      addMessage('죄송합니다. 이미지 처리 중 오류가 발생했습니다.', 'bot');

      // 오류 시에도 이미지 분석 상태 해제
      setIsImageAnalysisInProgress(false);
      setAudioPlaybackInProgress(false);
    }
  };

  useEffect(() => {
    registerCommonActionHandlers({
      registerActionHandler,
      addMessage,
      playAudioWithCompletion,
      navigation,
      voiceControls,
    });
    fetchUserInfo();
  }, []);

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const {data} = await getUser();
      const name = data?.body?.name || '사용자';
      setUserName(name);
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
      setUserName('사용자');
    }
  };

  // 상태와 권한이 idle + true일 때 자동 재시작 (음성 모드일 때만)
  useEffect(() => {
    let timeoutId;

    console.log('[VOICE] 자동 재시작 조건 체크:', {
      chatMode,
      voiceActive,
      status,
      hasPermission,
      audioPlaybackInProgress,
      isNavigatingAway,
      isImageAnalysisInProgress, // 추가된 조건
      isTyping,
    });

    if (
      chatMode === 'voice' &&
      !isTyping &&
      !voiceActive &&
      status === 'idle' &&
      hasPermission &&
      !audioPlaybackInProgress &&
      !isNavigatingAway &&
      !isImageAnalysisInProgress // 이미지 분석 중이 아닐 때만 재시작
    ) {
      console.log('[VOICE] 자동 재시작 예약됨 (1.5초 지연)');

      timeoutId = setTimeout(() => {
        // 재시작 직전에 한 번 더 조건 확인
        if (
          chatMode === 'voice' &&
          !isTyping &&
          !voiceActive &&
          status === 'idle' &&
          hasPermission &&
          !audioPlaybackInProgress &&
          !isNavigatingAway &&
          !isImageAnalysisInProgress // 재시작 직전에도 확인
        ) {
          console.log('[VOICE] 자동 재시작 실행');
          handleStartListening();
        } else {
          console.log('[VOICE] 재시작 직전 조건 변경으로 취소');
        }
      }, 1500);
    } else {
      console.log('[VOICE] 자동 재시작 조건 불만족');
    }

    return () => {
      if (timeoutId) {
        console.log('[VOICE] 자동 재시작 타이머 클리어');
        clearTimeout(timeoutId);
      }
    };
  }, [
    status,
    hasPermission,
    chatMode,
    voiceActive,
    audioPlaybackInProgress,
    isNavigatingAway,
    isImageAnalysisInProgress,
    handleStartListening,
    isTyping,
  ]);

  // 초기 메시지 표시 (웹소켓으로부터 받은 메시지가 있으면 사용, 없으면 기본 메시지)
  useEffect(() => {
    if (!showInfoModal && messages.length === 0) {
      if (initialWelcomeMessage) {
        // 서버에서 받은 초기 메시지 사용 - isInitialMessage 속성 명시적 설정
        addMessage(
          initialWelcomeMessage.text,
          'bot',
          initialWelcomeMessage.options || DEFAULT_BOT_OPTIONS,
          false, // isVoiceRecognizing
          true, // isInitialMessage
        );

        // 저장된 음성이 있으면 재생
        if (initialWelcomeAudio) {
          playAudioWithCompletion(initialWelcomeAudio);
        }
      } else {
        // 서버 메시지가 없을 때 기본 메시지 - isInitialMessage 속성 추가
        addMessage(
          `${userName || '사용자'}님, 안녕하세요☺️\n어떤 도움이 필요하신가요?`,
          'bot',
          DEFAULT_BOT_OPTIONS,
          false, // isVoiceRecognizing
          true, // isInitialMessage
        );
      }
    }
  }, [showInfoModal, initialWelcomeMessage, messages.length, userName]);

  // 새 메시지가 추가될 때마다 스크롤 맨 아래로 이동
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  // 음성 인식 시작 핸들러
  const handleStartListening = async () => {
    try {
      console.log('[CHAT] 음성 인식 시작 함수 호출');

      // 기존 음성 재생 중단
      cleanupAudio();

      // 음성 인식 중인 메시지 표시를 위한 ID 생성
      const voiceMessageId = Date.now();

      // 음성 인식 임시 메시지 추가 - 더 명확한 텍스트로 변경
      const initialVoiceMsgId = addMessage(
        '음성 인식 중...',
        'user',
        null,
        true,
      );
      console.log('[CHAT] 음성 인식 메시지 생성:', initialVoiceMsgId);

      // 음성 인식 시작
      await startListening(
        initialVoiceMsgId, // 생성한 메시지 ID 전달
        partialText => {
          console.log(
            `[CHAT] 음성 중간 결과 수신:`,
            partialText?.substring(0, 20),
          );
          if (partialText && partialText.trim()) {
            updateVoiceMessage(initialVoiceMsgId, partialText);
          }
        },
        finalText => {
          console.log(`[CHAT] 음성 최종 결과:`, finalText?.substring(0, 20));
          if (finalText && finalText.trim()) {
            // 최종 텍스트로 메시지 업데이트
            updateVoiceMessage(initialVoiceMsgId, finalText);

            // 봇 응답 처리
            const typingMsgId = startTypingMessage();
            // 약간의 지연 후 처리
            setTimeout(() => {
              processRecognizedText(finalText, typingMsgId);
            }, 300);
          } else {
            // 인식 실패 시 메시지 제거
            removeActiveVoiceMessage(initialVoiceMsgId);
          }
        },
      );

      // 펄스 애니메이션 시작
      startPulseAnimation();
    } catch (error) {
      console.error('[CHAT] 음성 인식 시작 실패:', error);
      setAudioPlaybackInProgress(false); // 오류 발생 시 재생 상태 초기화
      reset('오류 발생');
    }
  };

  // 음성 인식 결과 처리
  const processRecognizedText = async (text, typingMsgId) => {
    try {
      console.log('[CHAT] 음성 인식 결과 처리 시작:', text);

      // 임시 음성 파일 정리
      await cleanupTempAudioFiles();

      // 메시지 전송 및 응답 처리
      const response = await sendMessage(text);
      const {text: responseText, filePath, action, data} = response;

      // 응답 메시지 업데이트 - 즉시 타이핑 상태 해제
      finishTypingMessage(typingMsgId, responseText, DEFAULT_BOT_OPTIONS);

      // 추가적으로 타이핑 상태를 확실히 해제
      setTimeout(() => {
        console.log('[CHAT] 타이핑 상태 강제 해제 확인');
        // isTyping이 여전히 true라면 강제로 해제
        if (isTyping) {
          console.warn('[CHAT] 타이핑 상태가 여전히 true - 강제 해제');
          forceStopTyping();
        }
      }, 50);

      console.log('[CHAT] 서버 응답 처리 완료, 오디오 재생 준비');

      // 음성 재생
      if (filePath) {
        playAudioWithCompletion(filePath);
      } else {
        // 음성 파일이 없는 경우
        setAudioPlaybackInProgress(true);
        setTimeout(() => {
          console.log('[CHAT] 음성 파일 없음 - 재생 완료 처리');
          setAudioPlaybackInProgress(false);
          if (chatMode === 'voice') {
            setTimeout(() => {
              console.log('[CHAT] 음성 인식 자동 재시작 트리거');
              setStatus('idle');
            }, 500);
          }
        }, 1000);
      }

      // 액션 처리
      if (action) {
        handleClientAction(action, navigation, {data, voiceControls});
      }

      // 상태 초기화
      setTimeout(() => {
        reset();
        console.log('[CHAT] 음성 인식 상태 초기화 완료');
      }, 200);
    } catch (error) {
      console.error('[VOICE] 메시지 처리 오류:', error);
      finishTypingMessage(
        typingMsgId,
        '죄송합니다. 응답을 받아오는 데 실패했습니다.',
        null,
      );
      // 오류 시에도 타이핑 상태 확실히 해제
      forceStopTyping();
      reset('오류 발생');
      setAudioPlaybackInProgress(false);
    }
  };

  // 텍스트 채팅 모드에서 메시지 전송
  const sendTextMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = inputText;
    setInputText(''); // 입력 필드 비우기

    // 사용자 메시지 추가
    addMessage(userMessage, 'user');

    // 봇 타이핑 메시지 시작
    const typingMsgId = startTypingMessage();

    try {
      // 메시지 전송 및 응답 처리
      const response = await sendMessage(userMessage);
      const {text: responseText, filePath, action, data} = response;

      // 타이핑 메시지를 실제 메시지로 교체
      finishTypingMessage(typingMsgId, responseText, DEFAULT_BOT_OPTIONS);

      // 음성 재생 (수정된 함수 사용)
      if (filePath) {
        playAudioWithCompletion(filePath);
      }

      // 액션 처리
      if (action) {
        handleClientAction(action, navigation, {data, voiceControls});
      }
    } catch (error) {
      console.error('[VOICE] 메시지 전송 오류:', error);
      finishTypingMessage(
        typingMsgId,
        '죄송합니다. 응답을 받아오는 데 실패했습니다.',
        null,
      );
      setAudioPlaybackInProgress(false); // 오류 발생 시 재생 상태 초기화
    }
  };

  // 채팅 모드 전환 (텍스트 <-> 음성)
  const toggleChatMode = () => {
    Voice.cancel().catch(() => {});
    stopPulseAnimation();

    if (chatMode === 'text') {
      setChatMode('voice');
      setTimeout(() => {
        if (hasPermission && !isTyping) {
          reset('음성 인식 준비 중...');
          setTimeout(() => {
            handleStartListening();
          }, 500);
        }
      }, 300);
    } else {
      console.log('[CHAT] 음성 → 텍스트 모드 전환: 음성 인식 메시지 정리');

      // 음성 인식 중인 메시지들 제거
      clearVoiceRecognizingMessages();

      setChatMode('text');
      setVoiceActive(false);
      setAudioPlaybackInProgress(false); // 모드 전환 시 재생 상태 초기화
    }
  };

  // 봇 옵션 선택 처리
  const handleBotOptionPress = async option => {
    cleanupAudio();
    addMessage(option, 'user');

    const typingMsgId = startTypingMessage();

    try {
      let response;

      // 옵션별 특수 액션 처리
      if (option === '오늘 복용 일정 확인') {
        await cleanupTempAudioFiles();
        response = await getRoutineVoice();
      } else if (option === '처방전 촬영') {
        response = await registerPrescription();
      } else if (option === '의약품 촬영') {
        response = await capturePillsPhoto();
      } else {
        response = await sendMessage(option);
      }

      const {text, filePath, action, data} = response;
      finishTypingMessage(typingMsgId, text, DEFAULT_BOT_OPTIONS);

      // 음성 재생 (수정된 함수 사용)
      if (filePath) {
        playAudioWithCompletion(filePath);
      } else {
        // 음성 파일이 없는 경우에도 약간의 딜레이를 주어 챗봇이 바로 듣기 시작하지 않도록 함
        setAudioPlaybackInProgress(true);
        setTimeout(() => {
          setAudioPlaybackInProgress(false);
        }, 1000);
      }

      if (action) {
        handleClientAction(action, navigation, {data, voiceControls});
      }

      reset();
    } catch (err) {
      console.error('[VOICE] 옵션 처리 오류:', err);
      finishTypingMessage(
        typingMsgId,
        '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.',
        null,
      );
      setAudioPlaybackInProgress(false); // 오류 발생 시 재생 상태 초기화
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowInfoModal(false);
    if (hasPermission && chatMode === 'voice') {
      setStatus('idle'); // 음성 인식 트리거를 위한 상태 설정
    }
  };

  // 메시지 렌더링 함수
  const renderMessage = ({item}) => {
    return <MessageBubble item={item} onOptionPress={handleBotOptionPress} />;
  };

  // 스크롤 위치 관련 상수
  const VOICE_UI_HEIGHT = 180; // 음성 UI의 대략적인 높이 (조정 필요)
  const SCROLL_PADDING = 20; // 추가 여백

  // FlatList 참조 생성 및 사용자 정의 스크롤 함수
  const scrollToBottom = (animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      // 음성 모드일 때는 마이크 UI 높이를 고려해 더 위로 스크롤
      if (chatMode === 'voice') {
        flatListRef.current.scrollToOffset({
          offset: 999999, // 충분히 큰 값으로 먼저 스크롤
          animated: false,
        });

        // 짧은 지연 후 정확한 위치로 조정 (레이아웃 계산을 위해)
        setTimeout(() => {
          flatListRef.current.scrollToOffset({
            offset: 999999 - VOICE_UI_HEIGHT - SCROLL_PADDING,
            animated,
          });
        }, 50);
      } else {
        // 일반 텍스트 모드일 때는 완전히 아래로 스크롤
        flatListRef.current.scrollToEnd({animated});
      }
    }
  };

  // 메시지 추가, 처리 완료, 채팅 모드 변경 시 스크롤 재조정
  useEffect(() => {
    // 메시지가 추가되거나 타이핑이 완료되었을 때 스크롤
    if (messages.length > 0) {
      // 약간의 지연으로 레이아웃이 업데이트된 후 스크롤
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [messages, chatMode, isTyping]);

  return (
    <Container>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header
          hideBorder="true"
          transparentBg="true"
          titleColor={themes.light.textColor.buttonText}
          iconColor={themes.light.textColor.buttonText}>
          AI 채팅
        </Header>

        {/* 채팅 이용 안내 모달 */}
        <ChatInfoModal visible={showInfoModal} onClose={handleCloseModal} />

        {/* 채팅 메시지 목록 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{
            padding: 16,
            paddingBottom:
              chatMode === 'voice' ? VOICE_UI_HEIGHT + SCROLL_PADDING : 16,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollToBottom(true);
          }}
          onLayout={() => {
            scrollToBottom(false);
          }}
        />

        {/* 음성 모드 UI */}
        {chatMode === 'voice' && (
          <VoiceInputUI
            status={status}
            statusMessage={statusMessage}
            scaleAnim={scaleAnim}
            fontSizeMode={fontSizeMode}
            onSwitchToTextMode={() => {
              Voice.cancel().catch(() => {});
              stopPulseAnimation();
              clearVoiceRecognizingMessages();
              setStatus('idle');
              setChatMode('text');
              setAudioPlaybackInProgress(false); // 모드 전환 시 재생 상태 초기화
            }}
          />
        )}

        {/* 텍스트 입력 컴포넌트 */}
        {chatMode === 'text' && (
          <MessageInput
            inputText={inputText}
            setInputText={setInputText}
            sendMessage={sendTextMessage}
            toggleVoiceMode={toggleChatMode}
            isDisabled={isTyping}
            onVoicePress={forceStopTyping}
          />
        )}
      </KeyboardAvoidingView>
      <View style={{width: '100%', height: 20}} />
    </Container>
  );
}

// 스타일 정의
const Container = styled(LinearGradient).attrs({
  colors: [themes.light.pointColor.PrimaryDark, '#000000'],
  start: {x: 0, y: 0},
  end: {x: 0, y: 1},
})`
  flex: 1;
`;
