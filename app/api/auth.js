import api from './index';

export const signUp = data =>
  api.post(
    '/open-api/auth/sign_up',
    {
      email: data.email,
      password: data.password,
      name: `${data.firstName}${data.lastName}`,
      birthday: data.birthday || null,
      gender: data.gender || null,
    },
    {
      headers: {
        Authorization: undefined,
        'Content-Type': 'application/json',
      },
    },
  );

export const login = async data => {
  try {
    const response = await api.post('/open-api/auth/login', data);

    if (!response.data?.accessToken || !response.data?.refreshToken) {
      throw new Error('로그인 응답에 토큰이 없습니다.');
    }

    return response.data;
  } catch (error) {
    console.error('로그인 실패:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      alert('이메일 또는 비밀번호가 잘못되었습니다.');
    } else if (error.response?.status === 404) {
      alert('사용자를 찾을 수 없습니다.');
    } else {
      alert(
        '로그인 실패: ' + (error.response?.data?.message || '알 수 없는 오류'),
      );
    }

    throw error;
  }
};

export const refreshToken = async data => {
  try {
    const response = await api.post('/open-api/auth/refresh', data);
    if (!response.data?.accessToken) {
      throw new Error('토큰 재발급에 실패했습니다.');
    }
    return response.data;
  } catch (error) {
    console.error('토큰 재발급 실패:', error.response?.data || error.message);
    throw error;
  }
};
