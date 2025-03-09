import api from './index';

export const createRoutine = data => api.post('/routine', data);

export const registerOcrRoutine = data => api.post('/routine/ocr', data);

export const checkRoutine = data => api.patch('/routine/check', data);

export const getRoutineByDate = date => api.get(`/routine/${date}`);

export const deleteRoutine = routineId => api.delete(`/routine/${routineId}`);
