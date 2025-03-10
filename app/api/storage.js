import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';

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
