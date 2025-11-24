import api from './index';

export const registerCareReceiver = (data) => api.post('/care/receiver', data);

export const createCareAuthCode = (data) => api.post('/care/auth-code', data);

export const getCareRoutine = ({ userId, startDate, endDate }) => {
  return api.get('/care/routine', {
    params: {
      care_receiver_user_id: userId,
      start_date: startDate,
      end_date: endDate,
    },
  });
};

export const getCareList = () => api.get('/care/list');

export const deleteReceiver = (receiver_id) => api.delete(`/care/${receiver_id}`);