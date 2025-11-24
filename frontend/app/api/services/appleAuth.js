import { appleAuth } from '@invertase/react-native-apple-authentication';

import {
  getFCMToken,
  setAccessToken,
  setRefreshToken,
  setUserInfo,
  setTokenExpiryTime,
  setAuthType,
  AUTH_TYPES
} from '../storage';
import { setAuthToken } from '..';
import api from '../index';

/**
 * 애플 로그인 처리 함수
 */
export const appleLogin = async () => {
  try {
    // 애플 SDK로 로그인 요청
    const appleAuthResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      // Note: FULL_NAME should come first for better results (per documentation)
      requestedScopes: [
        appleAuth.Scope.FULL_NAME,
        appleAuth.Scope.EMAIL
      ],
    });

    // 사용자 인증 상태 확인
    const credentialState = await appleAuth.getCredentialStateForUser(appleAuthResponse.user);

    if (credentialState !== appleAuth.State.AUTHORIZED) {
      throw new Error('Apple 인증에 실패했습니다.');
    }

    console.log('애플 로그인 성공', appleAuthResponse);

    // 사용자 정보 추출
    const { identityToken, authorizationCode, fullName, email, user } = appleAuthResponse;

    // FCM 토큰 가져오기
    const fcmToken = await getFCMToken();
    console.log('FCM 토큰:', fcmToken || '없음');

    // 서버에 애플 토큰 전송하여 자체 토큰 받기
    const response = await api.post('/open-api/auth/apple', {
      identity_token: identityToken,
      authorization_code: authorizationCode,
      first_name: fullName?.givenName || null, // 첫 로그인에만 제공됨
      last_name: fullName?.familyName || null, // 첫 로그인에만 제공됨
      fcm_token: fcmToken || ''
    }, {
      headers: {
        Authorization: undefined, // 이전 인증 헤더가 있을 경우 제거
        'Content-Type': 'application/json',
      },
    });

    console.log('서버 애플 로그인 응답:', response.data);

    // 응답에서 토큰 정보 확인 및 저장
    const {
      access_token,
      refresh_token,
      access_token_expired_at
    } = response.data.body || {};

    if (access_token) {
      // 액세스 토큰 저장 및 설정
      await setAccessToken(access_token);
      setAuthToken(access_token);

      // 토큰 만료 시간 저장
      if (access_token_expired_at) {
        const expiryTime = new Date(access_token_expired_at).getTime();
        await setTokenExpiryTime(expiryTime);
        console.log('[애플 로그인] 토큰 만료 시간 저장:', new Date(expiryTime).toLocaleString());
      } else {
        // 만료 시간이 없으면 기본값으로 1시간 설정
        const oneHourLater = Date.now() + 60 * 60 * 1000;
        await setTokenExpiryTime(oneHourLater);
        console.log('[애플 로그인] 기본 토큰 만료 시간 설정:', new Date(oneHourLater).toLocaleString());
      }

      // 사용자 정보 저장
      // 첫 로그인에만 이름과 이메일이 제공되므로, 있을 때만 저장
      const userName = [fullName?.givenName, fullName?.familyName]
        .filter(Boolean)
        .join(' ');

      await setUserInfo({
        name: userName || 'Apple 사용자', // 이름이 없으면 기본값
        email: email || '', // 이메일이 있으면 저장
        appleUserId: user, // 애플 사용자 식별자 저장 (서버에서 사용할 수 있음)
      });

      // 리프레시 토큰 저장
      if (refresh_token) {
        await setRefreshToken(refresh_token);
      }

      // 로그인 방식 저장 - 애플 로그인
      await setAuthType(AUTH_TYPES.APPLE);

      // 결과 반환 (만료 시간 포함)
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        accessTokenExpiredAt: access_token_expired_at,
        user: {
          name: userName || 'Apple 사용자',
          email: email || '',
          appleUserId: user
        },
        // 애플 인증 정보 저장 (탈퇴 시 필요할 수 있음)
        appleAuthInfo: {
          identityToken,
          authorizationCode
        }
      };
    } else {
      throw new Error('서버에서 토큰을 받지 못했습니다.');
    }

  } catch (error) {
    console.error('애플 로그인 실패:', error.response?.data || error);

    // 사용자 친화적인 에러 메시지를 오류 객체에 추가
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
 * 애플 로그인 사용자 탈퇴 함수 (재인증 후 탈퇴)
 */
export const appleDeleteAccount = async () => {
  try {
    // 1. 애플 SDK로 재인증 수행
    const appleAuthResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [],  // 기본적인 승인만 필요
    });

    const { authorizationCode, identityToken } = appleAuthResponse;
    console.log('애플 재인증 성공');

    if (!authorizationCode || !identityToken) {
      throw new Error('애플 인증 정보를 얻지 못했습니다.');
    }

    // 2. 재인증된 정보로 새로운 토큰 발급받기
    const loginResponse = await api.post('/open-api/auth/apple', {
      identity_token: identityToken,
      authorization_code: authorizationCode,
      first_name: null,  // 재로그인시에는 null
      last_name: null,   // 재로그인시에는 null
      fcm_token: null    // 필요시 현재 FCM 토큰 전달
    });

    const newTokens = loginResponse.data.body;
    console.log('새로운 토큰 발급 성공');

    // 3. 새로운 리프레시 토큰으로 계정 탈퇴
    const deleteResponse = await api.delete('/user/apple/delete', {
      data: {
        refresh_token: newTokens.refresh_token
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newTokens.access_token}`
      }
    });
    console.log('애플 계정 탈퇴 성공:', deleteResponse.data);
    return deleteResponse.data;
  } catch (error) {
    console.error('애플 계정 탈퇴 실패:', error);

    // 사용자 친화적인 에러 메시지
    if (error.code === 'ERR_CANCELED') {
      error.userMessage = '애플 인증이 취소되었습니다.';
    } else if (error.response?.status === 401) {
      error.userMessage = '인증에 실패했습니다. 다시 시도해주세요.';
    } else {
      error.userMessage = '애플 계정 탈퇴에 실패했습니다: ' + (error.message || '알 수 없는 오류');
    }
    throw error;
  }
};