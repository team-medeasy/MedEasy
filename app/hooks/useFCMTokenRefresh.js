import {useEffect} from 'react';
import {AppState, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {setFCMToken} from '../api/storage';

/**
 * 앱이 포그라운드로 돌아올 때 FCM 토큰을 확인하고 갱신하는 훅
 */
const useFCMTokenRefresh = () => {
  useEffect(() => {
    // 앱 상태 변경 리스너
    const appStateListener = AppState.addEventListener('change', async nextAppState => {
      // 앱이 백그라운드에서 활성 상태로 돌아왔을 때만 처리
      if (nextAppState === 'active') {
        try {
          // 권한 상태 확인
          const authStatus = await messaging().hasPermission();
          console.log('📋 앱 활성화 후 권한 상태:', authStatus);
          
          // 권한이 있는 경우에만 토큰 갱신
          if (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
          ) {
            console.log('✅ 권한 있음, FCM 토큰 갱신 시도');
            const token = await messaging().getToken();
            
            if (token) {
              await setFCMToken(token);
              console.log('✅ 앱 재활성화 시 FCM 토큰 갱신:', token);
            }
          } else {
            console.log('⚠️ 알림 권한 없음, 토큰 갱신 생략');
          }
        } catch (error) {
          console.error('🔴 앱 재활성화 FCM 토큰 갱신 오류:', error);
        }
      }
    });

    // 토큰 갱신 리스너 (토큰이 변경될 때마다 호출)
    const unsubscribe = messaging().onTokenRefresh(async token => {
      console.log('📱 FCM 토큰 리프레시 발생:', token);
      if (token) {
        await setFCMToken(token);
        console.log('✅ 리프레시된 FCM 토큰 저장 완료');
      }
    });

    // 클린업 함수
    return () => {
      appStateListener.remove();
      unsubscribe();
    };
  }, []);
};

export default useFCMTokenRefresh;