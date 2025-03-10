import {login, signUp} from '../auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  setAccessToken,
  setRefreshToken,
  removeAccessToken,
  removeRefreshToken,
} from '../storage';
import {setAuthToken} from '..';

export const handleLogin = async credentials => {
  try {
    const {accessToken, refreshToken} = await login(credentials);

    console.log('로그인 응답:', {accessToken, refreshToken});

    if (accessToken) {
      await setAccessToken(accessToken);
      setAuthToken(accessToken);
    } else {
      console.warn('ACCESS_TOKEN is undefined. Removing key from storage.');
      await removeAccessToken();
    }

    if (refreshToken) {
      await setRefreshToken(refreshToken);
    } else {
      console.warn('REFRESH_TOKEN is undefined. Removing key from storage.');
      await removeRefreshToken();
    }

    console.log('로그인 성공!');
  } catch (error) {
    console.error('로그인 실패:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      alert('이메일 또는 비밀번호가 잘못되었습니다.');
    } else if (error.response?.status === 404) {
      alert('사용자를 찾을 수 없습니다.');
    } else {
      alert(
        '로그인 실패: ' + (error.response?.data.message || '알 수 없는 오류'),
      );
    }

    throw error;
  }
};

export const handleSignUp = async (data, navigation) => {
  try {
    const requestData = {
      email: data.email,
      password: data.password,
      name: `${data.firstName}${data.lastName}`,
      birthday: data.birthday || null,
      gender: data.gender || null,
    };

    console.log('회원가입 요청 데이터:', requestData);

    const response = await signUp(requestData);

    console.log('회원가입 응답:', response.data);

    const {access_token, refresh_token} = response.data.body || {};

    if (access_token) {
      await setAccessToken(access_token);
      setAuthToken(access_token);
    } else {
      console.warn('ACCESS_TOKEN is undefined. Removing key from storage.');
      await removeAccessToken();
    }

    if (refresh_token) {
      await setRefreshToken(refresh_token);
    } else {
      console.warn('REFRESH_TOKEN is undefined. Removing key from storage.');
      await removeRefreshToken();
    }

    // 회원가입 성공 후 사용자 이름 저장
    await AsyncStorage.setItem('userName', requestData.name);

    console.log('회원가입 성공!');

    // 회원가입 성공 후 자동 로그인 실행
    await handleLogin({email: data.email, password: data.password});

    // 홈화면으로 이동
    navigation.reset({index: 0, routes: [{name: 'NavigationBar'}]});

    return response.data;
  } catch (error) {
    console.error(
      '회원가입 실패:',
      JSON.stringify(error.response?.data, null, 2),
    );

    if (error.response?.status === 409) {
      alert('이미 가입된 이메일입니다. 로그인해주세요.');
    } else if (error.response?.data?.message) {
      alert(`회원가입 실패: ${error.response.data.message}`);
    } else if (error.response?.data?.result_message) {
      // 서버에서 다른 키로 오류 메시지 반환할 경우 처리
      alert(`회원가입 실패: ${error.response.data.result_message}`);
    } else {
      alert('회원가입 실패: 알 수 없는 오류');
    }

    throw error;
  }
};
