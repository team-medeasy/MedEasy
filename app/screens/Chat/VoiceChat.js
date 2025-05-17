import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import Voice from '@react-native-voice/voice';
import Sound from 'react-native-sound';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

import { themes } from '../../styles';
import FontSizes from '../../../assets/fonts/fontSizes';
import { useFontSize } from '../../../assets/fonts/FontSizeContext';
import { Header } from '../../components';
import ChatInfoModal from '../../components/Chat/ChatInfoModal';
import MessageBubble from '../../components/Chat/MessageBubble';
import MessageInput from '../../components/Chat/MessageInput';
import { OtherIcons } from '../../../assets/icons';

import { cleanupTempAudioFiles, getRoutineVoice, sendVoiceMessage } from '../../api/voiceChat';
import { getUser } from '../../api/user';

const recognizerOptions = Platform.OS === 'android' ? {
  REQUEST_PERMISSIONS_AUTO: true,
  EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
  EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
  EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 1000,
  EXTRA_PARTIAL_RESULTS: true,
} : {};

export default function VoiceChat() {
  const {fontSizeMode} = useFontSize();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const audioPlayer = useRef(null);
  const debounceTimer = useRef(null);
  const flatListRef = useRef(null);

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

  useEffect(() => {
    const fetchUserName = async () => {
      const { data } = await getUser();
      const userName = data.body.name;

      setMessages([
        {
          id: 1,
          type: 'bot',
          text: `${userName}님, 안녕하세요☺️\n어떤 도움이 필요하신가요?`,
          options: ['약 검색', '루틴 등록', '처방전 촬영', '의약품 촬영', '오늘 복용 일정 확인'],
        },
      ]);
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    requestMicPermission();

    Voice.onSpeechStart = handleSpeechStart;
    Voice.onSpeechPartialResults = handleSpeechPartial;
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechError = handleSpeechError;

    return () => {
      clearTimeout(debounceTimer.current);
      Voice.destroy().then(Voice.removeAllListeners);
      audioPlayer.current?.release();
    };
  }, []);

  // 상태와 권한이 idle + true일 때 자동 재시작 (음성 모드일 때만)
  useEffect(() => {
    if (status === 'idle' && hasPermission && chatMode === 'voice') {
      console.log('[VOICE] Auto-startListening triggered by status change');
      startListening();
    }
  }, [status, hasPermission, chatMode]);

  useEffect(() => {
    if (status === 'listening' && recognizedText) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        console.log('[VOICE] Debounce timeout, finalizing:', recognizedText);
        finalizeRecognition(recognizedText);
      }, 3000);
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
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      const granted = result === PermissionsAndroid.RESULTS.GRANTED;
      setHasPermission(granted);
    } else {
      setHasPermission(true);
    }
  }

  async function startListening() {
    if (!hasPermission || status !== 'idle') return;
    try {
      const available = await Voice.isAvailable();
      console.log('[VOICE] Available:', available);
      setStatus('listening');
      setStatusMessage('듣는 중...');
      await Voice.start('ko-KR', recognizerOptions);
    } catch (error) {
      console.error('[VOICE] startListening error:', error);
      reset('인식 오류 - 재시작');
    }
  }

  function handleSpeechStart() {
    console.log('[VOICE] onSpeechStart');
    setStatus('listening');
    setStatusMessage('듣는 중...');
    setRecognizedText('');
    startPulseAnimation();
  }

  function handleSpeechPartial({ value }) {
    setRecognizedText(value.join(' '));
  }

  function handleSpeechResults({ value }) {
    const text = value?.[0]?.trim() || '';
    if (text && status === 'listening') {
      console.log('[VOICE] onSpeechResults, final text:', text);
      finalizeRecognition(text);
    }
  }

  function handleSpeechError(error) {
    console.error('[VOICE] onSpeechError:', error);
    stopPulseAnimation();
    reset('인식 오류 - 재시도');
  }

  function finalizeRecognition(text) {
    Voice.stop();
    stopPulseAnimation();
    setStatus('processing');
    setStatusMessage('메시지 처리 중...');
    
    // 음성 인식된 텍스트를 메시지로 추가
    addMessage(text, 'user');
    
    // 로봇이 입력 중인 메시지 표시
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const formattedTime = `${period} ${formattedHours}:${minutes}`;
    
    const typingMsgId = Date.now() + 100; // 고유한 ID 보장
    setTypingMessageId(typingMsgId);
    setIsTyping(true);
    
    setMessages(prevMessages => [
      ...prevMessages,
      {id: typingMsgId, type: 'bot', text: '...', time: formattedTime, isTyping: true},
    ]);
    
    processRecognizedText(text, typingMsgId);
  }

  async function processRecognizedText(text, typingMsgId) {
    try {
      await cleanupTempAudioFiles();
      const filePath = await sendVoiceMessage(text);
      playBotResponse(filePath, typingMsgId);
    } catch (error) {
      console.error('[VoiceChat] API error:', error);
      // 타이핑 메시지 제거
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== typingMsgId)
      );
      setIsTyping(false);
      reset('처리 실패 - 재시작');
    }
  }

  function playBotResponse(path, typingMsgId) {
    console.log('[VOICE] playBotResponse:', path);
    Voice.cancel();

    setStatus('playing');
    setStatusMessage('응답 듣는 중...');

    audioPlayer.current?.release();
    audioPlayer.current = new Sound(path, '', error => {
      if (error) {
        console.error('[VoiceChat] Sound load error:', error);
        // 타이핑 메시지 제거
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== typingMsgId)
        );
        setIsTyping(false);
        reset();
        return;
      }
      audioPlayer.current.play(success => {
        console.log('[VOICE] Audio play finished:', success);
        
        // 타이핑 메시지를 실제 메시지로 교체
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === typingMsgId 
              ? {...msg, text: '봇 응답 메시지입니다', isTyping: false} 
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
    Voice.cancel();
    setStatus('idle');
    setStatusMessage(message);
    setRecognizedText('');
  }

  function startPulseAnimation() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }

  function stopPulseAnimation() {
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
  }

  function getCircleColor() {
    switch (status) {
      case 'listening': return themes.light.textColor.buttonText;
      case 'processing': return themes.light.textColor.Primary50;
      case 'playing': return themes.light.pointColor.Secondary;
      default: return themes.light.boxColor.buttonPrimary;
    }
  }

  // 텍스트 채팅 모드에서 메시지 전송
  const sendTextMessage = () => {
    if (inputText.trim() === '') return;
    
    const userMessage = inputText;
    setInputText(''); // 먼저 입력 필드를 비우기
    
    // 사용자 메시지 추가
    addMessage(userMessage, 'user');

    // 로봇이 입력 중인 메시지 표시
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const formattedTime = `${period} ${formattedHours}:${minutes}`;
    
    const typingMsgId = Date.now() + 1; // 사용자 메시지와 구분되는 ID 사용
    setTypingMessageId(typingMsgId);
    setIsTyping(true);
    
    // 타이핑 메시지 추가
    setMessages(prevMessages => [
      ...prevMessages,
      {id: typingMsgId, type: 'bot', text: '...', time: formattedTime, isTyping: true},
    ]);

    setTimeout(() => {
      // 타이핑 메시지를 실제 메시지로 교체
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === typingMsgId 
            ? {...msg, text: '네, 해당 내용에 대해 알려드릴게요!', isTyping: false} 
            : msg
        )
      );
      setIsTyping(false);
    }, 1000);
  };

  // 채팅 모드 전환 (텍스트 <-> 음성)
  const toggleChatMode = () => {
    if (chatMode === 'text') {
      setChatMode('voice');
      // 음성 모드로 전환 후 즉시 리스닝 시작
      setTimeout(() => {
        startListening();
      }, 500);
    } else {
      setChatMode('text');
      Voice.cancel();
      stopPulseAnimation();
      setStatus('idle');
    }
  };

  // 공통 메시지 추가 함수
  const addMessage = (text, type) => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const formattedTime = `${period} ${formattedHours}:${minutes}`;

    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    
    setMessages(prevMessages => [
      ...prevMessages,
      {id: uniqueId, type, text, time: formattedTime},
    ]);
  };

  const handleBotOptionPress = async (option) => {
  // 이전에 재생 중이던 음성 중지
  if (audioPlayer.current) {
    audioPlayer.current.stop(() => {
      audioPlayer.current.release();
      audioPlayer.current = null;
    });
  }

  if (option === '오늘 복용 일정 확인') {
    try {
      await cleanupTempAudioFiles(); 
      const { text, filePath, action } = await getRoutineVoice();

      console.log('[DEBUG] 복약 일정 텍스트:', text);
      console.log('[DEBUG] 음성 파일 경로:', filePath);
      console.log('[DEBUG] 프론트엔드 액션:', action);

      const currentTime = new Date();
      const formattedTime = `${currentTime.getHours()}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

      // 메시지 추가
      const typingMsgId = Date.now();
      setTypingMessageId(typingMsgId);
      setIsTyping(true);
      setMessages(prev => [
        ...prev,
        { id: typingMsgId, type: 'bot', text: '...', time: formattedTime, isTyping: true },
      ]);

      // 새로운 음성 재생
      audioPlayer.current = new Sound(filePath, '', (error) => {
        if (error) {
          console.error('사운드 로딩 실패:', error);
          return;
        }

        audioPlayer.current.play((success) => {
          if (!success) {
            console.error('재생 실패');
          }

          // 재생 끝나면 해제
          audioPlayer.current.release();
          audioPlayer.current = null;
        });
      });

      // 메시지 업데이트
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === typingMsgId ? { ...msg, text, isTyping: false } : msg
          )
        );
        setIsTyping(false);
      }, 1000);
    } catch (err) {
      console.error('[ERROR] 복약 일정 확인 실패:', err);
    }
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
          {/* {chatMode === 'voice' ? '보이스 채팅' : 'AI 챗봇 메디씨'} */}
          보이스 채팅
        </Header>

        {/* 채팅 이용 안내 모달 */}
        <ChatInfoModal
          visible={showInfoModal}
          onClose={() => {
            setShowInfoModal(false);
            if (hasPermission && chatMode === 'voice') setStatus('idle'); // 트리거용
          }}
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
            
            <RecognizedTextContainer>
              <RecognizedText fontSizeMode={fontSizeMode}>
                {recognizedText || '말씀해주세요...'}
              </RecognizedText>
            </RecognizedTextContainer>
          </VoiceInputContainer>
        )}

        {/* 텍스트 입력 컴포넌트 */}
        {chatMode === 'text' && (
          <MessageInput
            inputText={inputText}
            setInputText={setInputText}
            sendMessage={sendTextMessage}
            toggleVoiceMode={toggleChatMode}
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
  width: 80px;
  height: 80px;
  background-color: ${props => props.color};
  border-radius: 40px;

    /* iOS 그림자 */
  shadow-color: ${props => props.color};
  shadow-offset: 0px 0px;
  shadow-opacity: 0.8;
  shadow-radius: 10px;

  /* Android 그림자 (elevation) */
  elevation: 10;
`;

const StatusText = styled(Text)`
  margin-bottom: 15px;
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