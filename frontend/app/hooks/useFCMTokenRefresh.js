import {useEffect, useRef} from 'react';
import {AppState, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {setFCMToken, getFCMToken} from '../api/storage';

/**
 * 앱이 포그라운드로 돌아올 때 FCM 토큰을 확인하고 갱신하는 훅
 * 토큰 요청 제한을 방지하기 위한 쿨다운 메커니즘 포함
 */
const useFCMTokenRefresh = () => {
  // 마지막 토큰 요청 시간을 추적하는 ref
  const lastTokenRequestTimeRef = useRef(0);
  // 토큰 요청 사이의 최소 시간 간격 (밀리초) - 60초
  const TOKEN_REQUEST_COOLDOWN = 60000;

  // 쿨다운을 고려하여 토큰을 가져오는 함수
  const getTokenWithCooldown = async (force = false) => {
    const now = Date.now();
    
    // 강제 갱신이 아니고, 마지막 요청 이후 충분한 시간이 지나지 않았다면 건너뜀
    if (!force && now - lastTokenRequestTimeRef.current < TOKEN_REQUEST_COOLDOWN) {
      console.log('⏳ FCM 토큰 요청 쿨다운 중, 요청 건너뜀');
      return null;
    }
    
    try {
      // 현재 권한 상태 확인
      const authStatus = await messaging().hasPermission();
      
      // 권한이 있는 경우에만 토큰 요청
      if (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      ) {
        // 마지막 요청 시간 업데이트
        lastTokenRequestTimeRef.current = now;
        
        // 토큰 가져오기
        const token = await messaging().getToken();
        
        if (token) {
          // 기존 토큰과 비교하여 변경되었을 때만 저장
          const storedToken = await getFCMToken();
          if (token !== storedToken) {
            await setFCMToken(token);
            console.log('✅ 새 FCM 토큰 저장:', token.substring(0, 10) + '...');
            return token;
          } else {
            console.log('ℹ️ 기존 토큰과 동일함, 저장 건너뜀');
          }
        }
      } else {
        console.log('🔔 알림 권한 없음, 토큰 요청 건너뜀');
      }
    } catch (error) {
      console.error('🔴 FCM 토큰 가져오기 실패:', error);
    }
    
    return null;
  };

  useEffect(() => {
    // 초기 토큰 요청
    getTokenWithCooldown(true);
    
    // 앱 상태 변경 리스너
    const handleAppStateChange = async nextAppState => {
      if (nextAppState === 'active') {
        await getTokenWithCooldown();
      }
    };

    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    // 토큰 리프레시 리스너
    const unsubscribe = messaging().onTokenRefresh(async newToken => {
      try {
        if (newToken) {
          await setFCMToken(newToken);
          console.log('♻️ 토큰 리프레시 이벤트로 새 토큰 저장');
          lastTokenRequestTimeRef.current = Date.now(); // 리프레시 이벤트도 요청으로 간주
        }
      } catch (e) {
        console.error('🔴 토큰 리프레시 저장 실패:', e);
      }
    });

    return () => {
      appStateListener.remove();
      unsubscribe();
    };
  }, []);

  // 외부에서 토큰 강제 갱신을 위한 함수 노출
  return {
    refreshToken: () => getTokenWithCooldown(true)
  };
};

export default useFCMTokenRefresh;