import { Buffer } from 'buffer';
import { getAccessToken } from './storage';
import RNFS from 'react-native-fs';

/**
 * 음성 메시지를 WebSocket으로 전송하고, 서버로부터 받은 전체 응답(JSON)을 파싱해
 * 텍스트 메시지, 음성 파일 경로, 클라이언트 액션을 포함한 정보를 반환합니다.
 * @param {string} message - 전송할 텍스트 메시지
 * @returns {Promise<{ text: string, filePath: string, action: string }>}
 */
export const sendVoiceMessage = async (message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');

      const socketUrl = `wss://ai.medeasy.dev/ws/message/voice?jwt_token=Bearer ${token}`;
      const socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        
        console.log('[WebSocket] 연결됨 - sendVoiceMessage');

        const payload = {
          message,
          server_action: null,
          data: null,
        };

        socket.send(JSON.stringify(payload));
      };

      socket.onmessage = async (event) => {
        try {
          const {
            result_code,
            result_message,
            text_message,
            audio_base64,
            audio_format = 'mp3',
            client_action,
          } = JSON.parse(event.data);

          if (result_code !== 200) {
            throw new Error(`서버 응답 실패: ${result_message}`);
          }

          const timestamp = Date.now();
          const filePath = `${RNFS.CachesDirectoryPath}/voice_response_${timestamp}.${audio_format}`;
          await RNFS.writeFile(filePath, audio_base64, 'base64');

          console.log('음성 응답 저장 완료:', filePath);

          socket.close();
          resolve({
            text: text_message,
            filePath,
            action: client_action,
          });
        } catch (err) {
          console.error('[WebSocket] 응답 처리 중 오류:', err);
          socket.close();
          reject(err);
        }
      };

      socket.onerror = (error) => {
        console.error('[WebSocket] 오류 발생:', error);
        socket.close();
        reject(error);
      };

      socket.onclose = () => {
        console.log('[WebSocket] 연결 종료 - sendVoiceMessage');
      };
    } catch (error) {
      console.error('[WebSocket] 음성 메시지 전송 실패:', error);
      reject(error);
    }
  });
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
          file.name.replace('voice_response_', '').replace('.mp3', '')
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
 * 복약 일정 텍스트 + 음성 응답을 WebSocket으로 가져와 mp3로 저장 후 반환합니다.
 * @returns {Promise<{ text: string, filePath: string, action: string }>}
 */
export const getRoutineVoice = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('인증 토큰이 없습니다.');

      const socketUrl = `wss://ai.medeasy.dev/ws/message/voice?jwt_token=Bearer ${token}`;
      const socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        console.log('[WebSocket] 연결됨 - getRoutineVoice');

        const payload = {
          message: '오늘 복약 루틴 조회',
          server_action: 'GET_ROUTINE_LIST_TODAY',
          data: null,
        };

        socket.send(JSON.stringify(payload));
      };

      socket.onmessage = async (event) => {
        try {
          const {
            result_code,
            result_message,
            text_message,
            audio_base64,
            audio_format = 'mp3',
            client_action,
          } = JSON.parse(event.data);

          if (result_code !== 200) {
            throw new Error(`서버 응답 실패: ${result_message}`);
          }

          const timestamp = Date.now();
          const filePath = `${RNFS.CachesDirectoryPath}/routine_voice_${timestamp}.${audio_format}`;
          await RNFS.writeFile(filePath, audio_base64, 'base64');

          console.log('복약 일정 응답 저장 완료:', filePath);

          socket.close();
          resolve({
            text: text_message,
            filePath,
            action: client_action,
          });
        } catch (err) {
          console.error('[WebSocket] 복약 일정 응답 처리 중 오류:', err);
          socket.close();
          reject(err);
        }
      };

      socket.onerror = (error) => {
        console.error('[WebSocket] 오류 발생:', error);
        socket.close();
        reject(error);
      };

      socket.onclose = () => {
        console.log('[WebSocket] 연결 종료 - getRoutineVoice');
      };
    } catch (err) {
      console.error('[WebSocket] 복약 일정 조회 실패:', err);
      reject(err);
    }
  });
};

export default {
  sendVoiceMessage,
  cleanupTempAudioFiles,
  getRoutineVoice,
};
