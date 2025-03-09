import api from './index';

export const signUp = data => api.post('/open-api/auth/sign_up', data);

export const login = data => api.post('/open-api/auth/login', data);

export const refreshToken = data => api.post('/open-api/auth/refresh', data);
