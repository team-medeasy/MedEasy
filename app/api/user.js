import api from './index';

export const updateUserSchedule = data =>
  api.patch('/user/schedule/update', data);

export const updateUserName = name =>
  api.patch('/user/name', name);

export const getUser = () => api.get('/user');

export const deleteUser = (password) => api.post('/user', { password });

export const getUserUsageDays = () => api.get('/user/usage-days');

export const getUserSchedule = () => api.get('/user/schedule');

export const getUserMedicineCount = () => api.get('/user/medicine/count');

export const getUserMedicinesCurrent = () => api.get('/user/medicines/current');

export const getUserMedicinesPast = (start_date, end_date) =>
  api.get('/user/medicines/past', {
    params: { start_date, end_date },
  });