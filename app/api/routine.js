import api from './index';

// 단일 루틴 생성
export const createRoutine = data => api.post('/routine', data);

// 루틴 리스트 등록
export const createRoutineList = routineList => api.post('/routine/list', routineList);

export const registerOcrRoutine = data => api.post('/routine/ocr', data);

export const checkRoutine = data =>
    api.patch('/routine/check', null, {
      params: {
        routine_id: data.routine_id,
        is_taken: data.is_taken,
      },
    });

// 루틴 그룹 조회
export const getRoutineGroup = routineId =>
  api.get(`/routine/group/${routineId}`);
    
export const getRoutineByDate = (startDate, endDate) =>
    api.get(`/routine`, { params: { start_date: startDate, end_date: endDate } });

export const deleteRoutine = routineId => api.delete(`/routine/${routineId}`);

export const deleteRoutineGroup = routineId => api.delete(`/routine/group/${routineId}`);

export const updateRoutine = data => api.put('/routine', data);

export const getRoutineGroupByMedicineId = medicineId => 
  api.get(`/routine/group/medicine_id/${medicineId}`);