import {useEffect} from 'react';
import {AppState, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {setFCMToken} from '../api/storage';

/**
 * 앱이 포그라운드로 돌아올 때 FCM 토큰을 확인하고 갱신하는 훅
 */
const useFCMTokenRefresh = () => {
  useEffect(() => {
    const handleAppStateChange = async nextAppState => {
      if (nextAppState === 'active') {
        try {
          const authStatus = await messaging().hasPermission();
          if (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
          ) {
            const token = await messaging().getToken();
            if (token) {
              await setFCMToken(token); // 내부적으로 중복 저장 방지
            }
          }
        } catch (error) {
          console.error('🔴 포그라운드 복귀 시 FCM 토큰 갱신 실패:', error);
        }
      }
    };

    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    const unsubscribe = messaging().onTokenRefresh(async token => {
      try {
        await setFCMToken(token);
      } catch (e) {
        console.error('🔴 토큰 리프레시 저장 실패:', e);
      }
    });

    return () => {
      appStateListener.remove();
      unsubscribe();
    };
  }, []);
};

export default useFCMTokenRefresh;