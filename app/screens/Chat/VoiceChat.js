import React, { useEffect, useRef, useState } from 'react';
import { Animated, PermissionsAndroid, Platform, ScrollView, Text, View } from 'react-native';
import Voice from '@react-native-voice/voice';
import Sound from 'react-native-sound';
import styled from 'styled-components/native';

import { Header } from '../../components';
import ChatInfoModal from '../../components/Chat/ChatInfoModal';
import { themes } from '../../styles';
import { cleanupTempAudioFiles, sendVoiceMessage } from '../../api/voiceChat';

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
  const [conversation, setConversation] = useState([]);

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

  // 상태와 권한이 idle + true일 때 자동 재시작
  useEffect(() => {
    if (status === 'idle' && hasPermission) {
      console.log('[VOICE] Auto-startListening triggered by status change');
      startListening();
    }
  }, [status, hasPermission]);

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
    processRecognizedText(text);
  }

  async function processRecognizedText(text) {
    setConversation(prev => [...prev, { type: 'user', text }]);
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
        setConversation(prev => [...prev, { type: 'bot', text: '[응답 재생 완료]' }]);
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
      case 'listening': return themes.light.pointColor.Primary;
      case 'processing': return themes.light.textColor.Primary50;
      case 'playing': return themes.light.pointColor.Secondary;
      default: return themes.light.boxColor.buttonPrimary;
    }
  }

  return (
    <Container>
      <Header>보이스 채팅</Header>
      <CircleContainer>
        <AnimatedCircle style={{ transform: [{ scale: scaleAnim }] }} color={getCircleColor()} />
        <StatusText>{statusMessage}</StatusText>
        <RecognizedTextContainer>
          <RecognizedText>{recognizedText || '말씀해주세요...'}</RecognizedText>
        </RecognizedTextContainer>
        <ConversationList>
          {conversation.map((msg, idx) => (
            <ConversationItem key={idx} type={msg.type}>
              <ConversationText>{msg.type === 'user' ? '나: ' : '메디지: '}{msg.text}</ConversationText>
            </ConversationItem>
          ))}
        </ConversationList>
      </CircleContainer>
      <ChatInfoModal
        visible={showInfoModal}
        onClose={() => {
          setShowInfoModal(false);
          if (hasPermission) setStatus('idle'); // 트리거용
        }}
      />
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
  background-color: ${props => props.color};
  border-radius: 50px;
`;

const StatusText = styled(Text)`
  margin-top: 20px;
  font-size: 18px;
  color: ${themes.light.textColor.textPrimary};
  font-weight: bold;
`;

const RecognizedTextContainer = styled(View)`
  margin-top: 30px;
  padding: 15px;
  width: 90%;
  background-color: ${themes.light.boxColor.inputPrimary};
  border-radius: 10px;
`;

const RecognizedText = styled(Text)`
  font-size: 16px;
  color: ${themes.light.textColor.textPrimary};
  text-align: center;
`;

const ConversationList = styled(ScrollView)`
  margin-top: 20px;
  width: 90%;
  max-height: 200px;
`;

const ConversationItem = styled(View)`
  margin-bottom: 10px;
  align-self: ${props => (props.type === 'user' ? 'flex-end' : 'flex-start')};
  background-color: ${props =>
    props.type === 'user'
      ? themes.light.pointColor.Primary20
      : themes.light.boxColor.tagResultPrimary};
  padding: 10px;
  border-radius: 8px;
`;

const ConversationText = styled(Text)`
  font-size: 14px;
  color: ${themes.light.textColor.textPrimary};
`;
