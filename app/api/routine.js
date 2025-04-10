import api from './index';

export const createRoutine = data => api.post('/routine', data);

export const registerOcrRoutine = data => api.post('/routine/ocr', data);

export const checkRoutine = data =>
    api.patch('/routine/check', null, {
      params: {
        routine_medicine_id: data.routine_medicine_id,
        is_taken: data.is_taken,
      },
    });
    
export const getRoutineByDate = (startDate, endDate) =>
    api.get(`/routine`, { params: { start_date: startDate, end_date: endDate } });

export const deleteRoutine = routineId => api.delete(`/routine/${routineId}`);
