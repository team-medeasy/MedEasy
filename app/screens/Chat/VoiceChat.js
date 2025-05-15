import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import Voice from '@react-native-voice/voice';
import Sound from 'react-native-sound';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

import { Header } from '../../components';
import ChatInfoModal from '../../components/Chat/ChatInfoModal';
import { themes } from '../../styles';
import MessageBubble from '../../components/Chat/MessageBubble';
import MessageInput from '../../components/Chat/MessageInput';
import { cleanupTempAudioFiles, sendVoiceMessage } from '../../api/voiceChat';
import { OtherIcons } from '../../../assets/icons';

const recognizerOptions = Platform.OS === 'android' ? {
  REQUEST_PERMISSIONS_AUTO: true,
  EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
  EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
  EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 1000,
  EXTRA_PARTIAL_RESULTS: true,
} : {};

export default function VoiceChat() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const audioPlayer = useRef(null);
  const debounceTimer = useRef(null);

  const [status, setStatus] = useState('idle');
  const [hasPermission, setHasPermission] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [recognizedText, setRecognizedText] = useState('');
  const [statusMessage, setStatusMessage] = useState('준비 중...');
  
  const [chatMode, setChatMode] = useState('text'); // 'text' 또는 'voice'
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '복용하는 약에 대해 궁금하신 점이 있으신가요?',
      options: ['복용 방법', '주의사항', '주변 병원 정보', '그 외 궁금한 점'],
      time: '오전 9:00',
    },
  ]);
  const [inputText, setInputText] = useState('');

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
    processRecognizedText(text);
  }

  async function processRecognizedText(text) {
    try {
      await cleanupTempAudioFiles();
      const filePath = await sendVoiceMessage(text);
      playBotResponse(filePath);
    } catch (error) {
      console.error('[VoiceChat] API error:', error);
      reset('처리 실패 - 재시작');
    }
  }

  function playBotResponse(path) {
    console.log('[VOICE] playBotResponse:', path);
    Voice.cancel();

    setStatus('playing');
    setStatusMessage('응답 듣는 중...');

    audioPlayer.current?.release();
    audioPlayer.current = new Sound(path, '', error => {
      if (error) {
        console.error('[VoiceChat] Sound load error:', error);
        reset();
        return;
      }
      audioPlayer.current.play(success => {
        console.log('[VOICE] Audio play finished:', success);
        addMessage('봇 응답 메시지입니다', 'bot');
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
    
    addMessage(inputText, 'user');

    setTimeout(() => {
      addMessage('네, 해당 내용에 대해 알려드릴게요!', 'bot');
    }, 1000);

    setInputText('');
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

    setMessages(prevMessages => [
      ...prevMessages,
      {id: Date.now(), type, text, time: formattedTime},
    ]);
  };

  const renderMessage = ({item}) => {
    return <MessageBubble item={item} />;
  };

  return (
    <Container>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header hideBorder='true' transparentBg='true'>
          {chatMode === 'voice' ? '보이스 채팅' : 'AI 챗봇 메디씨'}
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
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: chatMode === 'voice' ? 200 : 16 // 음성 모드일 때 하단 여백 추가
          }}
          showsVerticalScrollIndicator={false} // 스크롤바 숨기기
        />

        {/* 음성 모드 UI */}
        {chatMode === 'voice' && (
          <VoiceInputContainer>
            <VoiceCenterContainer>
              <StatusText>{statusMessage}</StatusText>
              <AnimatedCircleContainer>
                <AnimatedCircle 
                  style={{ transform: [{ scale: scaleAnim }] }} 
                  color={getCircleColor()} 
                />
                <TextModeButton onPress={toggleChatMode}>
                  <OtherIcons.delete
                    height={20}
                    width={20}
                    style={{color: themes.light.textColor.buttonText}}
                  />
                </TextModeButton>
              </AnimatedCircleContainer>
            </VoiceCenterContainer>
            
            <RecognizedTextContainer>
              <RecognizedText>{recognizedText || '말씀해주세요...'}</RecognizedText>
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
  colors: [themes.light.pointColor.Primary, '#000000'],
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
  font-size: 16px;
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
  font-size: 16px;
  color: ${themes.light.textColor.buttonText};
`;