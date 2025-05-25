import RNFS from 'react-native-fs';
import {DEFAULT_BOT_OPTIONS} from '../../assets/data/utils';

export default function useImageAnalysis({
  addMessage,
  startTypingMessage,
  removeActiveVoiceMessage,
  playAudioFile,
  cleanupAudio,
  setAudioPlaybackInProgress,
  setIsImageAnalysisInProgress,
  setStatus,
  chatMode,
}) {
  const playAudioWithImageAnalysisCompletion = filePath => {
    if (!filePath) {
      setIsImageAnalysisInProgress(false);
      setAudioPlaybackInProgress(false);
      return;
    }

    cleanupAudio();

    playAudioFile(filePath, () => {
      setTimeout(() => {
        setIsImageAnalysisInProgress(false);
        setAudioPlaybackInProgress(false);
        if (chatMode === 'voice') {
          setTimeout(() => setStatus('idle'), 500);
        }
      }, 2000);
    });
  };

  const handleImageUpload = async ({
    base64Image,
    actionType,
    uploadPrescriptionPhoto,
    uploadPillsPhoto,
    navigation,
    voiceControls,
  }) => {
    try {
      const typingMsgId = startTypingMessage();
      let response =
        actionType === 'PRESCRIPTION'
          ? await uploadPrescriptionPhoto(base64Image)
          : await uploadPillsPhoto(base64Image);

      removeActiveVoiceMessage(typingMsgId);

      const {text, filePath, action, data} = response;

      addMessage(text, 'bot', DEFAULT_BOT_OPTIONS);

      if (filePath) {
        playAudioWithImageAnalysisCompletion(filePath);
      } else {
        setIsImageAnalysisInProgress(false);
        setAudioPlaybackInProgress(false);
      }

      if (action) {
        setTimeout(
          () => {
            voiceControls?.handleClientAction?.(action, navigation, {
              data,
              voiceControls,
            });
          },
          filePath ? 5000 : 1000,
        );
      }
    } catch (e) {
      console.error('[IMAGE] 업로드 오류:', e);
      addMessage('이미지 처리 중 오류가 발생했습니다', 'bot');
      setIsImageAnalysisInProgress(false);
      setAudioPlaybackInProgress(false);
    }
  };

  return {
    playAudioWithImageAnalysisCompletion,
    handleImageUpload,
  };
}
