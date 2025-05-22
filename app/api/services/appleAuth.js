import { appleAuth } from '@invertase/react-native-apple-authentication';
import api from '../index';
import {
  getFCMToken,
  setAccessToken,
  setRefreshToken,
  setUserInfo,
  setTokenExpiryTime,
  setLoginProvider,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  removeTokenExpiryTime,
  removeLoginProvider,
  removeUserInfo
} from '../storage';
import { setAuthToken } from '..';

/**
 * 애플 로그인 처리 함수
 */
export const appleLogin = async () => {
  try {
    const appleAuthResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [
        appleAuth.Scope.FULL_NAME,
        appleAuth.Scope.EMAIL
      ],
    });

    const credentialState = await appleAuth.getCredentialStateForUser(appleAuthResponse.user);
    if (credentialState !== appleAuth.State.AUTHORIZED) {
      throw new Error('Apple 인증에 실패했습니다.');
    }

    const { identityToken, authorizationCode, fullName, email, user } = appleAuthResponse;
    const fcmToken = await getFCMToken();

    const response = await api.post('/open-api/auth/apple', {
      identity_token: identityToken,
      authorization_code: authorizationCode,
      first_name: fullName?.givenName || null,
      last_name: fullName?.familyName || null,
      fcm_token: fcmToken || ''
    }, {
      headers: {
        Authorization: undefined,
        'Content-Type': 'application/json',
      },
    });

    const {
      access_token,
      refresh_token,
      access_token_expired_at
    } = response.data.body || {};

    if (access_token) {
      await setAccessToken(access_token);
      setAuthToken(access_token);
      await setLoginProvider('apple');

      const expiryTime = access_token_expired_at
        ? new Date(access_token_expired_at).getTime()
        : Date.now() + 60 * 60 * 1000;
      await setTokenExpiryTime(expiryTime);

      const userName = [fullName?.givenName, fullName?.familyName].filter(Boolean).join(' ');
      await setUserInfo({
        name: userName || 'Apple 사용자',
        email: email || '',
        appleUserId: user,
      });

      if (refresh_token) await setRefreshToken(refresh_token);

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        accessTokenExpiredAt: access_token_expired_at,
        user: {
          name: userName || 'Apple 사용자',
          email: email || '',
          appleUserId: user
        }
      };
    } else {
      throw new Error('서버에서 토큰을 받지 못했습니다.');
    }
  } catch (error) {
    if (error.response?.status === 404) {
      error.userMessage = '애플 계정으로 먼저 회원가입이 필요합니다.';
    } else if (error.code === 'ERR_CANCELED') {
      error.userMessage = '로그인이 취소되었습니다.';
    } else {
      error.userMessage = '애플 로그인에 실패했습니다: ' + (error.message || '알 수 없는 오류');
    }
    throw error;
  }
};

/**
 * 애플 계정 탈퇴(회원 삭제)
 */
export const deleteAppleAccount = async (navigation) => {
  try {
    const appleAuthResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    const { authorizationCode } = appleAuthResponse;
    if (!authorizationCode) throw new Error('authorization_code를 가져올 수 없습니다.');

    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new Error('refresh_token이 없습니다. 다시 로그인 후 시도해 주세요.');

    await api.post(
      '/user/apple/delete',
      {
        refresh_token: refreshToken,
        authorization_code: authorizationCode,
      },
      {
        headers: {
          Authorization: undefined,
          'Content-Type': 'application/json',
        },
      }
    );

    await removeAccessToken();
    await removeRefreshToken();
    await removeTokenExpiryTime();
    await removeLoginProvider();
    await removeUserInfo();
    setAuthToken(null);

    if (navigation) {
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    }

    alert('애플 계정이 성공적으로 삭제되었습니다.');
    return true;
  } catch (error) {
    alert(
      error.userMessage ||
      error.message ||
      '애플 계정 삭제에 실패했습니다. 다시 시도해 주세요.'
    );
    throw error;
  }
};
