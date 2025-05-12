import api from './index';

export const registerCareReceiver = (data) => api.post('/care/receiver', data);

export const createCareAuthCode = (data) => api.post('/care/auth-code', data);

export const getCareRoutine = () => api.get('/care/routine');

export const getCareList = () => api.get('/care/list');

export const deleteReceiver = (receiver_id) => api.delete(`/care/${receiver_id}`);