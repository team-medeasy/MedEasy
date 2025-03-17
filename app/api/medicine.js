import api from './index';

export const uploadMedicine = data => api.post('/medicine/upload', data);

export const updateMedicine = data => api.post('/medicine/update', data);

export const getMedicineList = () => api.get('/medicine');

export const searchMedicine = query =>
  api.get(`/medicine/search?name=${query}`);

export const searchMedicineWithFilters = (params) => {
  const { name, colors, shape, size } = params;
  
  let queryParams = `query=${encodeURIComponent(name || '')}`;
  
  if (colors && colors.length > 0) {
    queryParams += `&colors=${encodeURIComponent(colors.join(','))}`;
  }
  
  if (shape && shape.length > 0) {
    queryParams += `&shape=${encodeURIComponent(shape.join(','))}`;
  }
  
  if (size) {
    queryParams += `&size=${size}`;
  }
  
  return api.get(`/medicine/search?${queryParams}`);
};