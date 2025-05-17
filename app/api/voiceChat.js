import axios from 'axios';
import { Buffer } from 'buffer';
import { getAccessToken } from './storage';
import RNFS from 'react-native-fs';

/**
 * 음성 메시지를 전송하고, 서버로부터 받은 오디오 바이너리를 임시 파일로 저장 후 경로를 반환합니다.
 * @param {string} message - 전송할 텍스트 메시지
 * @returns {Promise<string>} - 임시 파일 경로
 */
export const sendVoiceMessage = async (message) => {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    const response = await axios.post(
      'https://ai.medeasy.dev/v2/chat/message/voice',
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );

    // ArrayBuffer를 base64 문자열로 변환
    const base64 = Buffer.from(response.data, 'binary').toString('base64');

    // 임시 파일 경로 생성
    const timestamp = Date.now();
    const tempFilePath = `${RNFS.CachesDirectoryPath}/voice_response_${timestamp}.mp3`;

    // base64 데이터를 파일로 저장
    await RNFS.writeFile(tempFilePath, base64, 'base64');
    console.log('음성 응답을 임시 파일에 저장:', tempFilePath);

    return tempFilePath;
  } catch (error) {
    console.error('[Voice API] 음성 메시지 전송 실패:', error);
    throw error;
  }
};

/**
 * 캐시 디렉터리 내 임시 음성 파일(voice_response_*.mp3)을 조회,
 * 24시간 이상 지난 파일을 삭제합니다.
 */
export const cleanupTempAudioFiles = async () => {
  try {
    const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
    const now = Date.now();
    const expireTime = 24 * 60 * 60 * 1000; // 24시간

    for (const file of files) {
      if (file.name.startsWith('voice_response_') && file.name.endsWith('.mp3')) {
        const timestamp = Number(
          file.name
            .replace('voice_response_', '')
            .replace('.mp3', '')
        );
        if (now - timestamp > expireTime) {
          await RNFS.unlink(file.path);
          console.log('오래된 임시 오디오 파일 삭제:', file.name);
        }
      }
    }
  } catch (error) {
    console.error('임시 파일 정리 중 오류:', error);
  }
};

/**
 * 복약 일정 텍스트 + 음성 응답을 가져와 mp3로 저장 후 반환합니다.
 * @returns {Promise<{ text: string, filePath: string, action: string }>}
 */
export const getRoutineVoice = async () => {
  try {
    const token = await getAccessToken();
    console.log('[DEBUG] getRoutineVoice에서 사용하는 토큰:', token);

    if (!token) throw new Error('인증 토큰이 없습니다.');

    const response = await axios.get('https://ai.medeasy.dev/v2/chat/message/routine', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { text_response, audio_base64, audio_format = 'mp3', action } = response.data;

    const timestamp = Date.now();
    const filePath = `${RNFS.CachesDirectoryPath}/routine_voice_${timestamp}.${audio_format}`;
    const base64Stripped = audio_base64.replace(/^data:audio\/\w+;base64,/, '');
    await RNFS.writeFile(filePath, base64Stripped, 'base64');

    console.log('복약 일정 응답 저장 완료:', filePath);

    return {
      text: text_response,
      filePath,
      action,
    };
  } catch (err) {
    console.error('[Voice API] 복약 일정 조회 실패:', err);
    throw err;
  }
};


export default {
  sendVoiceMessage,
  cleanupTempAudioFiles,
  getRoutineVoice
};
