# 음성 채팅 리팩터링 가이드

## 개요

음성 채팅 시스템의 상태 관리를 개선하기 위해 다음 훅들을 새로 만들었습니다:

1. **useChatStateMachine** - 상태 머신 패턴 기반 상태 관리
2. **usePermissionManager** - 마이크 권한 관리
3. **useErrorRecovery** - 에러 처리 및 복구
4. **useVoiceRecognition** (개선) - 위 훅들을 통합한 음성 인식

## 주요 개선사항

### 1. 명확한 상태 정의
- 기존: `status`, `voiceActive`, `hasPermission`, `audioPlaybackInProgress` 등 10개 이상의 상태 변수
- 개선: 하나의 상태 머신으로 통합 (`idle`, `listening`, `processing_message`, `playing_audio` 등)

### 2. 권한 관리 개선
- 권한 상태를 명확하게 관리 (`granted`, `denied`, `blocked`)
- 권한 없을 때 자동 재시작 방지
- 설정 화면 안내 자동화

### 3. 에러 복구 전략
- 에러 타입별 재시도 횟수 관리
- 자동 복구 로직
- 에러 히스토리 추적

## VoiceChat.js 수정 가이드

### Step 1: useVoiceRecognition에서 상태 머신 가져오기

```javascript
// 기존
const {
  status,
  hasPermission,
  statusMessage,
  voiceActive,
  startListening,
  reset,
  setVoiceActive,
  setStatus,
  activeVoiceMessageId,
  setStatusMessage,
} = useVoiceRecognition();

// 개선
const {
  status,  // 이제 CHAT_STATES 값
  statusMessage,
  voiceActive,
  hasPermission,
  startListening,
  reset,
  stateMachine,          // 🆕 상태 머신 직접 접근
  permissionManager,     // 🆕 권한 관리자 접근
} = useVoiceRecognition();

// 에러 복구 훅 추가
const errorRecovery = useErrorRecovery(
  useVoiceRecognition().stateMachine,
  useVoiceRecognition().permissionManager
);
```

### Step 2: 자동 재시작 로직 개선

```javascript
// 기존 (VoiceChat.js 라인 759-823)
useEffect(() => {
  let timeoutId;

  if (
    chatMode === 'voice' &&
    !isTyping &&
    !voiceActive &&
    status === 'idle' &&
    hasPermission &&
    !audioPlaybackInProgress &&
    !isNavigatingAway &&
    !isImageAnalysisInProgress
  ) {
    // 자동 재시작...
  }
}, [/* 많은 의존성 */]);

// 개선
useEffect(() => {
  let timeoutId;

  // 상태 머신의 shouldAutoRestart 사용
  const shouldRestart = (
    chatMode === 'voice' &&
    stateMachine.shouldAutoRestart() &&  // 🆕 상태 머신이 조건 체크
    !isTyping &&
    !audioPlaybackInProgress
  );

  if (shouldRestart) {
    console.log('[VOICE] 자동 재시작 예약');
    timeoutId = setTimeout(() => {
      if (stateMachine.shouldAutoRestart()) {
        handleStartListening();
      }
    }, 1500);
  }

  return () => clearTimeout(timeoutId);
}, [chatMode, stateMachine.state, isTyping, audioPlaybackInProgress]);
```

### Step 3: 오디오 재생 후 상태 전환 개선

```javascript
// 기존 (VoiceChat.js playAudioWithCompletion 함수)
setTimeout(() => {
  setAudioPlaybackInProgress(false);
  if (chatMode === 'voice') {
    setTimeout(() => {
      setStatus('idle');
    }, 100);
  }
}, 300);

// 개선
setTimeout(() => {
  setAudioPlaybackInProgress(false);
  if (chatMode === 'voice') {
    // 상태 머신을 통한 전환
    stateMachine.transition(CHAT_STATES.IDLE, 'audio_playback_complete');
  }
}, 300);
```

### Step 4: 이미지 분석 상태 관리 개선

```javascript
// 기존
setIsImageAnalysisInProgress(true);
// ... 이미지 처리 ...
setIsImageAnalysisInProgress(false);

// 개선
stateMachine.transition(CHAT_STATES.IMAGE_ANALYZING, 'image_upload');
// ... 이미지 처리 ...
stateMachine.transition(CHAT_STATES.PLAYING_AUDIO, 'image_analysis_complete');
// 또는
stateMachine.transition(CHAT_STATES.IDLE, 'image_analysis_complete');
```

### Step 5: 네비게이션 상태 관리 개선

```javascript
// 기존
setIsNavigatingAway(true);
navigation.navigate(...);

// 개선
stateMachine.transition(CHAT_STATES.NAVIGATING, 'screen_transition');
stateMachine.setCanAutoRestart(false);  // 자동 재시작 비활성화
navigation.navigate(...);
```

### Step 6: 에러 처리 개선

```javascript
// 기존
try {
  // ... 작업 ...
} catch (error) {
  console.error('오류:', error);
  // 수동 복구 로직
}

// 개선
try {
  // ... 작업 ...
} catch (error) {
  errorRecovery.handleError(error, 'context_name', () => {
    // 복구 시 실행할 콜백 (선택사항)
    console.log('복구 완료');
  });
}
```

## 마이그레이션 체크리스트

### 필수 변경사항
- [ ] useVoiceRecognition에서 stateMachine 가져오기
- [ ] useErrorRecovery 훅 추가
- [ ] 자동 재시작 로직을 stateMachine.shouldAutoRestart() 사용으로 변경
- [ ] 모든 상태 변경을 stateMachine.transition() 사용으로 변경

### 선택적 개선사항
- [ ] 상태별 디버깅 로그 추가 (stateMachine.logStateInfo())
- [ ] 에러 통계 모니터링 (errorRecovery.getErrorStats())
- [ ] 권한 상태 UI 개선

### 테스트 체크리스트
- [ ] 권한 없을 때 자동 재시작 방지 확인
- [ ] 권한 거부 시 설정 화면 안내 동작 확인
- [ ] 대화 중 상태 동기화 정상 작동 확인
- [ ] 이미지 분석 중 음성 인식 차단 확인
- [ ] 화면 전환 시 음성 인식 정지 확인
- [ ] 에러 발생 시 자동 복구 동작 확인

## 디버깅 도구

### 상태 머신 정보 확인
```javascript
// 언제든지 호출하여 현재 상태 확인
stateMachine.logStateInfo();
```

### 에러 통계 확인
```javascript
const stats = errorRecovery.getErrorStats();
console.log('에러 통계:', stats);
```

### 권한 상태 확인
```javascript
console.log('권한 상태:', permissionManager.permissionStatus);
console.log('권한 있음:', permissionManager.hasPermission);
console.log('영구 거부:', permissionManager.isBlocked);
```

## 문제 해결

### 음성 인식이 시작되지 않음
1. `stateMachine.logStateInfo()` 실행하여 현재 상태 확인
2. 권한 상태 확인: `permissionManager.hasPermission`
3. 차단 상태 확인: `stateMachine.isBlocked()`

### 자동 재시작이 안 됨
1. `stateMachine.shouldAutoRestart()` 결과 확인
2. `stateMachine.canAutoRestart` 값 확인
3. 상태가 IDLE인지 확인: `stateMachine.isIdle`

### 권한 문제
1. 권한 상태 확인: `permissionManager.permissionStatus`
2. 영구 거부 여부: `permissionManager.isBlocked`
3. 수동 재확인: `permissionManager.recheckPermission()`

## 롤백 방법

문제가 발생하면 백업 파일로 롤백:
```bash
cp /Users/moeji/MedEasy/app/hooks/useVoiceRecognition.js.backup /Users/moeji/MedEasy/app/hooks/useVoiceRecognition.js
```

## 추가 자료

- 상태 머신 다이어그램: 각 상태와 허용된 전환을 시각화
- 권한 플로우: 권한 요청 및 처리 흐름도
- 에러 복구 전략: 에러 타입별 복구 방법

---

**작성일**: 2025-01-12
**버전**: 1.0
**작성자**: Claude Code
