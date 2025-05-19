import { useRef, useState } from 'react';
import Sound from 'react-native-sound';

export default function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const currentSound = useRef(null);
  const onPlaybackCompleteCallback = useRef(null);

  // 오디오 파일 재생 함수
  const playAudioFile = (filePath, onPlaybackComplete = null) => {
    // 콜백 저장
    onPlaybackCompleteCallback.current = onPlaybackComplete;

    // 이전 음성 정리
    cleanupAudio();

    // 소리 설정
    Sound.setCategory('Playback');

    // 새 사운드 생성
    const sound = new Sound(filePath, '', (error) => {
      if (error) {
        console.error('오디오 로드 실패:', error);
        // 오류 시 콜백 호출
        if (onPlaybackCompleteCallback.current) {
          onPlaybackCompleteCallback.current();
          onPlaybackCompleteCallback.current = null;
        }
        return;
      }

      // 재생 시작
      setIsPlaying(true);
      sound.play((success) => {
        setIsPlaying(false);

        if (success) {
          console.log('오디오 재생 완료');

          // 재생 완료 콜백 호출
          if (onPlaybackCompleteCallback.current) {
            // 즉시 호출하지 않고 잠시 지연 - iOS에서 중복 재생 방지
            setTimeout(() => {
              const callback = onPlaybackCompleteCallback.current;
              onPlaybackCompleteCallback.current = null;
              if (callback) callback();
            }, 100);
          }
        } else {
          console.log('오디오 재생 실패');
          // 실패해도 콜백 호출
          if (onPlaybackCompleteCallback.current) {
            onPlaybackCompleteCallback.current();
            onPlaybackCompleteCallback.current = null;
          }
        }
      });
    });

    currentSound.current = sound;
  };

  // 오디오 정리 함수
  const cleanupAudio = () => {
    if (currentSound.current) {
      currentSound.current.stop();
      currentSound.current.release();
      currentSound.current = null;
    }
    setIsPlaying(false);
  };

  return {
    isPlaying,
    playAudioFile,
    cleanupAudio
  };
}