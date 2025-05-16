import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateNotificationAgreement as apiUpdateNotificationAgreement } from './notification';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';
const USER_INFO_KEY = 'user_info';
const FCM_TOKEN_KEY ='FCM_TOKEN'; // FCM 토큰 키
const NOTIFICATION_AGREED_KEY = 'NOTIFICATION_AGREED'; // 알림 동의 상태 키

// AccessToken 저장
export const setAccessToken = async token => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
};

// RefreshToken 저장
export const setRefreshToken = async token => {
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
};

// AccessToken 가져오기
export const getAccessToken = async () => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token || token === 'undefined' || token.trim() === '') {
    return null;
  }
  return token;
};

// RefreshToken 가져오기
export const getRefreshToken = async () => {
  return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

// AccessToken 삭제
export const removeAccessToken = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
};

// RefreshToken 삭제
export const removeRefreshToken = async () => {
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

// 액세스 토큰 만료 시간 저장
export const setTokenExpiryTime = async (expiryTime) => {
  try {
    await AsyncStorage.setItem('ACCESS_TOKEN_EXPIRES_AT', String(expiryTime));
  } catch (error) {
    console.error('토큰 만료 시간 저장 오류:', error);
  }
};

// 액세스 토큰 만료 시간 조회
export const getTokenExpiryTime = async () => {
  try {
    const expiryTime = await AsyncStorage.getItem('ACCESS_TOKEN_EXPIRES_AT');
    return expiryTime ? Number(expiryTime) : null;
  } catch (error) {
    console.error('토큰 만료 시간 조회 오류:', error);
    return null;
  }
};

// 토큰 만료 시간 제거
export const removeTokenExpiryTime = async () => {
  try {
    await AsyncStorage.removeItem('ACCESS_TOKEN_EXPIRES_AT');
  } catch (error) {
    console.error('토큰 만료 시간 제거 오류:', error);
  }
};

// FCM 토큰 저장
export const setFCMToken = async token => {
  try {
    const currentToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (currentToken !== token) {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      console.log('새로운 FCM 토큰 저장:', token);
    } else {
      console.log('ℹ️ 동일한 FCM 토큰, 저장 생략');
    }
  } catch (e) {
    console.error('❌ FCM 토큰 저장 실패', e);
  }
};

// FCM 토큰 가져오기
export const getFCMToken = async () => {
  return await AsyncStorage.getItem(FCM_TOKEN_KEY);
}

// 알림 동의 상태 저장
export const setNotificationAgreed = async (agreed) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_AGREED_KEY, JSON.stringify(agreed));
    console.log(`ℹ️ 알림 동의 상태 저장: ${agreed}`);
    return true;
  } catch (e) {
    console.error('❌ 알림 동의 상태 저장 실패', e);
    return false;
  }
};

// 알림 동의 상태 가져오기
export const getNotificationAgreed = async () => {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_AGREED_KEY);
    // 값이 없으면 기본값 true 반환
    if (value === null) return true;
    return JSON.parse(value);
  } catch (e) {
    console.error('❌ 알림 동의 상태 가져오기 실패', e);
    // 오류 발생 시 기본값 true 반환
    return true;
  }
};

// 알림 동의 상태 업데이트 (API 호출 + AsyncStorage 저장)
export const updateNotificationAgreement = async (agreed) => {
  try {
    // API 인터페이스를 통해 알림 설정 업데이트
    await apiUpdateNotificationAgreement(agreed);
    
    // API 호출 성공 후 로컬 저장소 업데이트
    return await setNotificationAgreed(agreed);
  } catch (e) {
    console.error('❌ 알림 설정 API 호출 실패', e);
    // API 호출 실패 시에도 로컬 저장 시도
    return await setNotificationAgreed(agreed);
  }
};

// 사용자 정보 관리 함수
export const setUserInfo = async userInfo => {
  try {
    const userInfoString = JSON.stringify(userInfo);
    await AsyncStorage.setItem(USER_INFO_KEY, userInfoString);
  } catch (error) {
    console.error('사용자 정보 저장 실패', error);
  }
};

export const getUserInfo = async () => {
  try {
    const userInfoString = await AsyncStorage.getItem(USER_INFO_KEY);
    return userInfoString ? JSON.parse(userInfoString) : null;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패', error);
    return null;
  }
};

export const removeUserInfo = async () => {
  try {
    await AsyncStorage.removeItem(USER_INFO_KEY);
  } catch (error) {
    console.error('사용자 정보 삭제 실패', error);
  }
};

// 로그아웃 시 모든 인증 데이터 삭제
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY]);
  } catch (error) {
    console.error('인증 데이터 삭제 실패', error);
  }
};