import {useState, useRef} from 'react';

export default function useChatMessages() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState(null);

  // 시간 포맷팅 함수
  const formatTimeString = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period} ${formattedHours}:${minutes}`;
  };

  // 메시지 추가 함수
  const addMessage = (
    text,
    type,
    options = null,
    isVoiceRecognizing = false,
    isInitialMessage = false,
  ) => {
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: uniqueId,
        type,
        text,
        time: formatTimeString(),
        options,
        isVoiceRecognizing,
        isInitialMessage,
      },
    ]);

    return uniqueId;
  };

  // 음성 인식 중인 메시지 업데이트
  const updateVoiceMessage = (messageId, text) => {
    console.log('[CHAT] 음성 메시지 업데이트:', messageId, text);

    if (!messageId || !text) {
      console.warn('[CHAT] 메시지 업데이트 무시 - 잘못된 파라미터');
      return;
    }

    setMessages(prevMessages => {
      const messageExists = prevMessages.some(msg => msg.id === messageId);
      if (!messageExists) {
        console.warn('[CHAT] 업데이트할 메시지 ID를 찾을 수 없음:', messageId);
        return prevMessages;
      }

      return prevMessages.map(msg =>
        msg.id === messageId ? {...msg, text, isVoiceRecognizing: false} : msg,
      );
    });
  };

  // 타이핑 메시지 시작
  const startTypingMessage = () => {
    const typingMsgId = Date.now() + 100;
    setTypingMessageId(typingMsgId);
    setIsTyping(true);

    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: typingMsgId,
        type: 'bot',
        text: '...',
        time: formatTimeString(),
        isTyping: true,
      },
    ]);

    return typingMsgId;
  };

  // 타이핑 메시지 완료 - 개선된 버전
  const finishTypingMessage = (typingMsgId, text, options = null) => {
    console.log('[CHAT] 타이핑 메시지 완료:', typingMsgId);

    // 1. 메시지 업데이트
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === typingMsgId
          ? {...msg, text, isTyping: false, options, isInitialMessage: false}
          : msg,
      ),
    );

    // 즉시 타이핑 상태 해제 (setTimeout 제거)
    setIsTyping(false);
    setTypingMessageId(null);
    console.log('[CHAT] 타이핑 상태 즉시 해제됨');
  };

  // 강제 타이핑 상태 해제 함수
  const forceStopTyping = () => {
    console.log('[CHAT] 강제 타이핑 상태 해제');

    // 즉시 해제
    setIsTyping(false);
    setTypingMessageId(null);
  };

  // 음성 인식 임시 메시지 제거
  const removeActiveVoiceMessage = messageId => {
    setMessages(prevMessages =>
      prevMessages.filter(msg => msg.id !== messageId),
    );
  };

  // ===== 추가된 함수: 음성 인식 중인 모든 메시지 정리 =====
  const clearVoiceRecognizingMessages = () => {
    console.log('[CHAT] 음성 인식 중인 메시지들 정리');

    setMessages(prevMessages =>
      prevMessages.filter(msg => !msg.isVoiceRecognizing),
    );

    // 타이핑 상태도 함께 해제
    setIsTyping(false);
    setTypingMessageId(null);
  };

  return {
    messages,
    isTyping,
    typingMessageId,
    addMessage,
    updateVoiceMessage,
    startTypingMessage,
    finishTypingMessage,
    removeActiveVoiceMessage,
    forceStopTyping,
    clearVoiceRecognizingMessages,
    formatTimeString,
  };
}
