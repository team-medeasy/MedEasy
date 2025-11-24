import {useRef, useState} from 'react';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

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
    const sound = new Sound(filePath, '', error => {
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
      sound.play(success => {
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
    return new Promise(resolve => {
      if (currentSound.current) {
        currentSound.current.stop(() => {
          setIsPlaying(false);
          console.log('[AUDIO] 재생 강제 종료 완료');
          resolve(); // 여기서 비로소 종료 완료
        });
      } else {
        setIsPlaying(false);
        resolve(); // 재생 중이 아니어도 즉시 resolve
      }
    });
  };

  // 오디오 파일 존재 여부 확인 후 재생 (추가)
  const playAudioWithCompletion = async (filePath, fallbackCallback = null) => {
    if (!filePath) {
      console.warn('[AUDIO] 경로 없음: 오디오 재생 불가');
      if (fallbackCallback) fallbackCallback();
      return;
    }

    const exists = await RNFS.exists(filePath);
    if (!exists) {
      console.warn('[AUDIO] 파일이 존재하지 않음:', filePath);
      if (fallbackCallback) fallbackCallback();
      return;
    }

    // 정상 경로일 경우 재생
    playAudioFile(filePath, fallbackCallback);
  };

  return {
    isPlaying,
    playAudioFile,
    cleanupAudio,
    playAudioWithCompletion,
  };
}
