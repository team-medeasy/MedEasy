import {login, signUp} from '../auth';
import {
  setAccessToken,
  setRefreshToken,
  removeAccessToken,
  removeRefreshToken,
} from '../storage';
import {setAuthToken} from '..';

export const handleLogin = async credentials => {
  try {
    const response = await login(credentials);

    console.log('로그인 응답:', response.data);

    const {accessToken, refreshToken} = response.data;

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

export const handleSignUp = async data => {
  try {
    const requestData = {
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`,
      birthday: data.birthday || null,
      gender: data.gender || null,
    };

    console.log('회원가입 요청 데이터:', requestData);

    const response = await signUp(requestData);

    console.log('회원가입 응답:', response.data);

    const {accessToken, refreshToken} = response.data;

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

    console.log('회원가입 성공!');

    // 서버에서 실제 저장되었는지 확인
    await handleLogin({email: data.email, password: data.password});

    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      alert('이미 가입된 이메일입니다. 로그인해주세요.');
    } else {
      alert(
        '회원가입 실패: ' + (error.response?.data.message || '알 수 없는 오류'),
      );
    }

    console.error('회원가입 실패:', error.response?.data || error.message);
    throw error;
  }
};
