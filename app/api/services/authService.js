// api/services/authService.js
import {login, signUp} from '../auth';
import {kakaoLogin} from './kakaoAuth';
import {getUser} from '../user';

import {
  setAccessToken,
  setRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setUserInfo,
  setTokenExpiryTime,  // 추가
  removeTokenExpiryTime  // 추가
} from '../storage';
import {setAuthToken} from '..';

export const handleLogin = async credentials => {
  try {
    // 로그인 결과에서 만료 시간도 받아옴
    const {accessToken, refreshToken, accessTokenExpiredAt} = await login(credentials);

    console.log('로그인 응답:', {accessToken, refreshToken, accessTokenExpiredAt});

    if (accessToken) {
      await setAccessToken(accessToken);
      setAuthToken(accessToken);
      
      // 토큰 만료 시간 저장
      if (accessTokenExpiredAt) {
        const expiryTime = new Date(accessTokenExpiredAt).getTime();
        await setTokenExpiryTime(expiryTime);
        console.log('토큰 만료 시간 저장:', new Date(expiryTime).toLocaleString());
      } else {
        // 만료 시간이 없으면 기본값으로 1시간 설정
        const oneHourLater = Date.now() + 60 * 60 * 1000;
        await setTokenExpiryTime(oneHourLater);
        console.log('기본 토큰 만료 시간 설정:', new Date(oneHourLater).toLocaleString());
      }
      
      // 토큰 설정 후 사용자 정보 가져오기
      try {
        const userResponse = await getUser();
        console.log('getUser API 전체 응답:', userResponse);

        const userData = userResponse.data?.data || userResponse.data?.body || userResponse.data;
        
        console.log('사용자 정보 로드 완료:', userData);
        
        // 사용자 정보 저장
        await setUserInfo({
          name: userData.name || '',
          gender: userData.gender || '',
          birthday: userData.birthday || '',
        });
        return userData; // 컴포넌트에서 사용할 수 있도록 반환

      } catch (userError) {
        console.error('사용자 정보 로드 실패:', userError);
        // 사용자 정보 로드 실패해도 로그인은 성공으로 처리
      }
    } else {
      console.warn('ACCESS_TOKEN is undefined. Removing key from storage.');
      await removeAccessToken();
      await removeTokenExpiryTime();  // 추가: 만료 시간도 함께 제거
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
        '로그인 실패: ' + (error.response?.data?.message || error.response?.data?.result_message || '알 수 없는 오류'),
      );
    }

    throw error;
  }
};

export const handleKakaoLogin = async (navigation) => {
  try {
    // 카카오 로그인 결과에서 만료 시간도 받아옴
    const result = await kakaoLogin();

    if (result?.accessToken) {
      console.log('카카오 로그인 성공:', result);
      
      // 토큰 만료 시간 저장
      if (result.accessTokenExpiredAt) {
        const expiryTime = new Date(result.accessTokenExpiredAt).getTime();
        await setTokenExpiryTime(expiryTime);
        console.log('카카오 토큰 만료 시간 저장:', new Date(expiryTime).toLocaleString());
      } else {
        // 만료 시간이 없으면 기본값으로 1시간 설정
        const oneHourLater = Date.now() + 60 * 60 * 1000;
        await setTokenExpiryTime(oneHourLater);
        console.log('카카오 기본 토큰 만료 시간 설정:', new Date(oneHourLater).toLocaleString());
      }

      navigation.reset({index: 0, routes: [{name: 'NavigationBar'}]});
      return result;
    }
  } catch (error) {
    console.error('카카오 로그인 실패:', error);
    
    // 오류 응답에 따른 처리
    if (error.response?.status === 404) {
      // 사용자가 등록되지 않은 경우, 회원가입 화면으로 이동
      alert('카카오 계정으로 먼저 회원가입이 필요합니다.');
      navigation.navigate('SignUpName');
    } else {
      alert('카카오 로그인에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
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
      name, // 성+이름 형태로 서버에 전송
      birthday: data.birthday || null,
      gender: data.gender || null,
    };
    
    console.log('회원가입 요청 데이터:', requestData);
    // 회원가입 응답에서 accessToken, refreshToken, accessTokenExpiredAt 추출
    const response = await signUp(requestData);
    const { accessToken, refreshToken, accessTokenExpiredAt } = response;

    console.log('회원가입 응답:', response.data);

    if (accessToken) {
      await setAccessToken(accessToken);
      setAuthToken(accessToken);
      
      // 토큰 만료 시간 저장
      if (accessTokenExpiredAt) {
        const expiryTime = new Date(accessTokenExpiredAt).getTime();
        await setTokenExpiryTime(expiryTime);
        console.log('토큰 만료 시간 저장:', new Date(expiryTime).toLocaleString());
      } else {
        // 만료 시간이 없으면 기본값으로 1시간 설정
        const oneHourLater = Date.now() + 60 * 60 * 1000;
        await setTokenExpiryTime(oneHourLater);
        console.log('기본 토큰 만료 시간 설정:', new Date(oneHourLater).toLocaleString());
      }
      
      // 회원가입 후 사용자 정보 저장 - 이미 요청 데이터에 있으므로 바로 저장 가능
      await setUserInfo({
        name: requestData.name,
        gender: requestData.gender,
        birthday: requestData.birthday,
      });
    } else {
      console.warn('ACCESS_TOKEN is undefined. Removing key from storage.');
      await removeAccessToken();
      await removeTokenExpiryTime();
    }

    if (refreshToken) {
      await setRefreshToken(refreshToken);
    } else {
      console.warn('REFRESH_TOKEN is undefined. Removing key from storage.');
      await removeRefreshToken();
    }

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

// 로그아웃 시 토큰 관련 데이터 모두 제거하는 함수 추가
export const handleLogout = async (navigation) => {
  try {
    // 모든 토큰 관련 데이터 제거
    await removeAccessToken();
    await removeRefreshToken();
    await removeTokenExpiryTime();
    
    // 인증 헤더 제거
    setAuthToken(null);
    
    console.log('로그아웃 성공');
    
    // 로그인 화면으로 이동
    if (navigation) {
      navigation.reset({index: 0, routes: [{name: 'Auth'}]});
    }
    
    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    return false;
  }
};