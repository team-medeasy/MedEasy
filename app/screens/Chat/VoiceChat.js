import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import Voice from '@react-native-voice/voice';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';

import { themes } from '../../styles';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { Header } from '../../components';
import ChatInfoModal from '../../components/Chat/ChatInfoModal';
import MessageBubble from '../../components/Chat/MessageBubble';
import MessageInput from '../../components/Chat/MessageInput';
import VoiceInputUI from '../../components/Chat/VoiceInputUI';

import { getUser } from '../../api/user';
import { handleClientAction } from '../../utils/chatActionHandler';
import { DEFAULT_BOT_OPTIONS } from '../../../assets/data/utils';

// 커스텀 훅 불러오기
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import useChatMessages from '../../hooks/useChatMessages';
import usePulseAnimation from '../../hooks/usePulseAnimation';
import useWebSocketChat from '../../hooks/useWebSocketChat';

export default function VoiceChat() {
  const { fontSizeMode } = useFontSize();
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  // 커스텀 훅 사용
  const {
    status, hasPermission, statusMessage, voiceActive,
    startListening, reset, setVoiceActive, setStatus, activeVoiceMessageId,
    setStatusMessage  // 이 부분을 추가
  } = useVoiceRecognition();

  const { playAudioFile, cleanupAudio, isPlaying } = useAudioPlayer();

  const {
    messages, isTyping, addMessage, startTypingMessage,
    finishTypingMessage, updateVoiceMessage, removeActiveVoiceMessage
  } = useChatMessages();

  const { scaleAnim, startPulseAnimation, stopPulseAnimation } = usePulseAnimation();

  const {
    sendMessage, getRoutineVoice, registerPrescription,
    uploadPrescriptionPhoto, registerRoutineList, capturePillsPhoto,
    uploadPillsPhoto, cleanupTempAudioFiles, setInitialMessageCallback
  } = useWebSocketChat();

  const [showInfoModal, setShowInfoModal] = useState(true);
  const [chatMode, setChatMode] = useState('text');
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('');
  const [initialWelcomeMessage, setInitialWelcomeMessage] = useState(null);
  const [initialWelcomeAudio, setInitialWelcomeAudio] = useState(null);
  const [audioPlaybackInProgress, setAudioPlaybackInProgress] = useState(false);

  // 웰컴 오디오 저장 함수
  const saveWelcomeAudio = async (base64Audio, audioFormat = 'mp3') => {
    try {
      const timestamp = Date.now();
      const filePath = `${RNFS.CachesDirectoryPath}/welcome_${timestamp}.${audioFormat}`;

      await RNFS.writeFile(filePath, base64Audio, 'base64');
      console.log('초기 음성 파일 저장 완료:', filePath);
      return filePath;
    } catch (error) {
      console.error('초기 음성 파일 저장 오류:', error);
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

  // 상태 메시지 관리를 위한 useEffect 추가
  useEffect(() => {
    // 오디오 재생 중일 때 상태 메시지 변경
    if (audioPlaybackInProgress && chatMode === 'voice') {
      setStatus('processing');
      setStatusMessage('응답 듣는 중...');
    } else if (!audioPlaybackInProgress && status === 'processing' && chatMode === 'voice') {
      // 재생 완료 후 idle 상태로 변경되었을 때만 메시지 변경
      setStatusMessage('곧 다시 듣기 시작합니다...');
      // 상태는 그대로 유지 (자동 재시작 타이머가 동작할 수 있도록)
    }
  }, [audioPlaybackInProgress, chatMode]);

  // 오디오 재생 함수 (재생 완료 콜백 추가)
  // playAudioWithCompletion 함수
  const playAudioWithCompletion = (filePath) => {
    if (!filePath) return;

    // 오디오 재생 시작 상태 설정
    setAudioPlaybackInProgress(true);
    // 상태 메시지 즉시 변경 (useEffect가 늦게 실행될 수 있으므로)
    if (chatMode === 'voice') {
      setStatus('processing');
      setStatusMessage('응답 듣는 중...');
    }

    console.log('[AUDIO] 재생 시작:', filePath);

    // 오디오 재생 (재생 완료 콜백 추가)
    playAudioFile(filePath, () => {
      console.log('[AUDIO] 재생 완료, 0.5초 후 음성 인식 재개');

      // 상태 메시지 변경
      if (chatMode === 'voice') {
        setStatusMessage('곧 다시 듣기 시작합니다...');
      }

      // 약간의 지연 후 오디오 재생 완료 상태 설정
      setTimeout(() => {
        setAudioPlaybackInProgress(false);
      }, 500); // 500ms(0.5초) 지연
    });
  };

  // 웹소켓 매니저 초기화 및 웰컴 메시지 처리
  useEffect(() => {
    // 초기 메시지 처리 함수 등록
    setInitialMessageCallback((response) => {
      if (response && response.text_message) {
        console.log('초기 메시지 수신:', response.text_message);

        setInitialWelcomeMessage({
          id: Date.now(),
          type: 'bot',
          text: response.text_message,
          time: formatTimeString(),
          options: DEFAULT_BOT_OPTIONS,
          isInitialMessage: true,
        });

        // 음성 데이터가 있으면 저장 처리
        if (response.audio_base64 && response.audio_format) {
          saveWelcomeAudio(response.audio_base64, response.audio_format)
            .then(filePath => {
              if (filePath) {
                setInitialWelcomeAudio(filePath);
              }
            })
            .catch(err => console.error('초기 음성 저장 실패:', err));
        }
      }
    });

    // 사용자 정보 가져오기
    fetchUserInfo();

    return () => {
      cleanupAudio();
      stopPulseAnimation();
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

  // 상태와 권한이 idle + true일 때 자동 재시작 (음성 모드일 때만)
  useEffect(() => {
    let timeoutId;

    if (chatMode === 'voice' && !isTyping && !voiceActive && status === 'idle'
      && hasPermission && !audioPlaybackInProgress) {
      console.log('[VOICE] 자동 재시작 예약됨 (1초 지연)');

      // 대기 시간 1초로 설정
      timeoutId = setTimeout(() => {
        console.log('[VOICE] 자동 재시작 실행');
        handleStartListening();
      }, 1000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [status, hasPermission, chatMode, isTyping, voiceActive, audioPlaybackInProgress]);

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
          true   // isInitialMessage
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
          true   // isInitialMessage
        );
      }
    }
  }, [showInfoModal, initialWelcomeMessage, messages.length, userName]);

  // 새 메시지가 추가될 때마다 스크롤 맨 아래로 이동
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
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
      const initialVoiceMsgId = addMessage('음성 인식 중...', 'user', null, true);
      console.log('[CHAT] 음성 인식 메시지 생성:', initialVoiceMsgId);

      // 음성 인식 시작 
      await startListening(
        initialVoiceMsgId, // 생성한 메시지 ID 전달
        (partialText) => {
          console.log(`[CHAT] 음성 중간 결과 수신:`, partialText?.substring(0, 20));
          if (partialText && partialText.trim()) {
            updateVoiceMessage(initialVoiceMsgId, partialText);
          }
        },
        (finalText) => {
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
        }
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
      // 임시 음성 파일 정리
      await cleanupTempAudioFiles();

      // 메시지 전송 및 응답 처리
      const response = await sendMessage(text);
      const { text: responseText, filePath, action, data } = response;

      // 응답 메시지 업데이트
      finishTypingMessage(typingMsgId, responseText, DEFAULT_BOT_OPTIONS);

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

      // 액션 처리
      if (action) {
        handleClientAction(action, navigation, { data });
      }

      reset();
    } catch (error) {
      console.error('[VOICE] 메시지 처리 오류:', error);
      finishTypingMessage(
        typingMsgId,
        '죄송합니다. 응답을 받아오는 데 실패했습니다.',
        null
      );
      reset('오류 발생');
      setAudioPlaybackInProgress(false); // 오류 발생 시 재생 상태 초기화
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
      const { text: responseText, filePath, action, data } = response;

      // 타이핑 메시지를 실제 메시지로 교체
      finishTypingMessage(typingMsgId, responseText, DEFAULT_BOT_OPTIONS);

      // 음성 재생 (수정된 함수 사용)
      if (filePath) {
        playAudioWithCompletion(filePath);
      }

      // 액션 처리
      if (action) {
        handleClientAction(action, navigation, { data });
      }
    } catch (error) {
      console.error('[VOICE] 메시지 전송 오류:', error);
      finishTypingMessage(
        typingMsgId,
        '죄송합니다. 응답을 받아오는 데 실패했습니다.',
        null
      );
      setAudioPlaybackInProgress(false); // 오류 발생 시 재생 상태 초기화
    }
  };

  // 채팅 모드 전환 (텍스트 <-> 음성)
  const toggleChatMode = () => {
    Voice.cancel().catch(() => { });
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
      setChatMode('text');
      setVoiceActive(false);
      setAudioPlaybackInProgress(false); // 모드 전환 시 재생 상태 초기화
    }
  };

  // 봇 옵션 선택 처리
  const handleBotOptionPress = async (option) => {
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

      const { text, filePath, action, data } = response;
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
        handleClientAction(action, navigation, { data });
      }

      reset();
    } catch (err) {
      console.error('[VOICE] 옵션 처리 오류:', err);
      finishTypingMessage(
        typingMsgId,
        '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.',
        null
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
  const renderMessage = ({ item }) => {
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
          animated: false
        });

        // 짧은 지연 후 정확한 위치로 조정 (레이아웃 계산을 위해)
        setTimeout(() => {
          flatListRef.current.scrollToOffset({
            offset: 999999 - VOICE_UI_HEIGHT - SCROLL_PADDING,
            animated
          });
        }, 50);
      } else {
        // 일반 텍스트 모드일 때는 완전히 아래로 스크롤
        flatListRef.current.scrollToEnd({ animated });
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
        style={{ flex: 1 }}
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
            paddingBottom: chatMode === 'voice' ? VOICE_UI_HEIGHT + SCROLL_PADDING : 16
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
              Voice.cancel().catch(() => { });
              stopPulseAnimation();
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
          />
        )}
      </KeyboardAvoidingView>
      <View style={{ width: '100%', height: 20 }} />
    </Container>
  );
}

// 스타일 정의
const Container = styled(LinearGradient).attrs({
  colors: [themes.light.pointColor.PrimaryDark, '#000000'],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  flex: 1;
`;