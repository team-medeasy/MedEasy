import { login, signUp } from '../auth';
import { kakaoLogin, deleteKakaoAccount } from './kakaoAuth';
import { appleLogin, deleteAppleAccount } from './appleAuth';
import { getUser } from '../user';
import {
  setAccessToken,
  setRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setUserInfo,
  setTokenExpiryTime,
  removeTokenExpiryTime,
  setLoginProvider,
  removeLoginProvider,
  removeUserInfo,
  getLoginProvider
} from '../storage';
import { setAuthToken } from '..';
import api from '../index';

export const handleLogin = async credentials => {
  try {
    const { accessToken, refreshToken, accessTokenExpiredAt } = await login(credentials);

    if (accessToken) {
      await setAccessToken(accessToken);
      setAuthToken(accessToken);
      await setLoginProvider('email');

      if (accessTokenExpiredAt) {
        const expiryTime = new Date(accessTokenExpiredAt).getTime();
        await setTokenExpiryTime(expiryTime);
      } else {
        const oneHourLater = Date.now() + 60 * 60 * 1000;
        await setTokenExpiryTime(oneHourLater);
      }

      try {
        const userResponse = await getUser();
        const userData = userResponse.data?.data || userResponse.data?.body || userResponse.data;
        await setUserInfo({
          name: userData.name || '',
          gender: userData.gender || '',
          birthday: userData.birthday || '',
        });
        return userData;
      } catch (userError) {
        // 사용자 정보 로드 실패해도 로그인은 성공으로 처리
      }
    } else {
      await removeAccessToken();
      await removeTokenExpiryTime();
    }

    if (refreshToken) {
      await setRefreshToken(refreshToken);
    } else {
      await removeRefreshToken();
    }
  } catch (error) {
    if (error.response?.status === 401) {
      alert('이메일 또는 비밀번호가 잘못되었습니다.');
    } else if (error.response?.status === 404) {
      alert('사용자를 찾을 수 없습니다.');
    } else {
      alert(
        '로그인 실패: ' + (error.response?.data?.message || error.response?.data?.result_message || '알 수 없는 오류'),
      );
    }
    throw error;
  }
};

// 카카오 로그인
export const handleKakaoLogin = async (navigation) => {
  try {
    const result = await kakaoLogin(); // 내부에서 setLoginProvider('kakao')!
    if (result?.accessToken) {
      // 토큰 만료 시간 등 저장 (아래 동일)
      if (result.accessTokenExpiredAt) {
        await setTokenExpiryTime(new Date(result.accessTokenExpiredAt).getTime());
      } else {
        await setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
      }
      navigation.reset({ index: 0, routes: [{ name: 'NavigationBar' }] });
      return result;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      alert('카카오 계정으로 먼저 회원가입이 필요합니다.');
      navigation.navigate('SignUpName');
    } else {
      alert('카카오 로그인에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
    throw error;
  }
};

// 애플 로그인
export const handleAppleLogin = async (navigation) => {
  try {
    const result = await appleLogin(); // 내부에서 setLoginProvider('apple')!
    if (result?.accessToken) {
      if (result.accessTokenExpiredAt) {
        await setTokenExpiryTime(new Date(result.accessTokenExpiredAt).getTime());
      } else {
        await setTokenExpiryTime(Date.now() + 60 * 60 * 1000);
      }
      navigation.reset({ index: 0, routes: [{ name: 'NavigationBar' }] });
      return result;
    }
  } catch (error) {
    if (error.code === 'ERR_CANCELED') {
      return;
    }
    if (error.response?.status === 404) {
      alert('애플 계정으로 먼저 회원가입이 필요합니다.');
      navigation.navigate('SignUpName');
    } else {
      alert(error.userMessage || '애플 로그인에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
    throw error;
  }
};

export const handleSignUp = async (data, navigation) => {
  try {
    const name = data.name;

    const requestData = {
      email: data.email,
      password: data.password,
      name,
      birthday: data.birthday || null,
      gender: data.gender || null,
    };

    const response = await signUp(requestData);
    const { accessToken, refreshToken, accessTokenExpiredAt } = response;

    if (accessToken) {
      await setAccessToken(accessToken);
      setAuthToken(accessToken);
      await setLoginProvider('email');

      if (accessTokenExpiredAt) {
        const expiryTime = new Date(accessTokenExpiredAt).getTime();
        await setTokenExpiryTime(expiryTime);
      } else {
        const oneHourLater = Date.now() + 60 * 60 * 1000;
        await setTokenExpiryTime(oneHourLater);
      }

      await setUserInfo({
        name: requestData.name,
        gender: requestData.gender,
        birthday: requestData.birthday,
      });
    } else {
      await removeAccessToken();
      await removeTokenExpiryTime();
    }

    if (refreshToken) {
      await setRefreshToken(refreshToken);
    } else {
      await removeRefreshToken();
    }

    await handleLogin({ email: data.email, password: data.password });

    navigation.reset({ index: 0, routes: [{ name: 'NavigationBar' }] });

    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      alert('이미 가입된 이메일입니다. 로그인해주세요.');
    } else if (error.response?.data?.message) {
      alert(`회원가입 실패: ${error.response.data.message}`);
    } else if (error.response?.data?.result_message) {
      alert(`회원가입 실패: ${error.response.data.result_message}`);
    } else {
      alert('회원가입 실패: 알 수 없는 오류');
    }
    throw error;
  }
};

export const handleLogout = async (navigation) => {
  await removeAccessToken();
  await removeRefreshToken();
  await removeTokenExpiryTime();
  await removeLoginProvider();
  await removeUserInfo();
  setAuthToken(null);
  if (navigation) navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  return true;
};

/**
 * 계정 삭제(회원 탈퇴) 처리 함수
 * provider: 'apple', 'kakao', 'email'
 */
export const handleAccountDelete = async (navigation) => {
  const provider = await getLoginProvider();
  try {
    if (provider === 'apple') {
      await deleteAppleAccount(navigation);
    } else if (provider === 'kakao') {
      await deleteKakaoAccount(navigation);
    } else {
      await api.post('/user/delete', {}, {
        headers: {
          Authorization: undefined,
          'Content-Type': 'application/json',
        }
      });
      await removeAccessToken();
      await removeRefreshToken();
      await removeTokenExpiryTime();
      await removeLoginProvider();
      await removeUserInfo();
      setAuthToken(null);
      if (navigation) navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      alert('계정이 삭제되었습니다.');
    }
    return true;
  } catch (e) {
    alert('계정 삭제에 실패했습니다. 다시 시도해 주세요.');
    throw e;
  }
};