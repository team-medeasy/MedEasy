import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';
const USER_INFO_KEY = 'user_info';
const FCM_TOKEN_KEY ='FCM_TOKEN'; // FCM 토큰 키

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
  return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
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