import api from './index';

export const registerCareReceiver = (data) => api.post('/care/receiver', data);

export const registerCareProvider = (data) => api.post('/care/provider', data);

export const getReceiversList = () => api.get('/care/receivers');

export const deleteReceiver = (receiver_id) => api.delete(`/care/${receiver_id}`);