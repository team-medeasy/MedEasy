import api from './index';

export const uploadMedicine = data => api.post('/medicine/upload', data);

export const updateMedicine = data => api.post('/medicine/update', data);

export const getMedicineList = () => api.get('/medicine');

export const searchMedicine = query =>
  api.get(`/medicine/search?query=${query}`);
