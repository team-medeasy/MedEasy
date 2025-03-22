import api from './index';

export const uploadMedicine = data => api.post('/medicine/upload', data);

export const updateMedicine = data => api.post('/medicine/update', data);

export const getMedicineList = () => api.get('/medicine');

export const searchMedicine = (params) => {
  const { name, size } = params;
  
  let queryParams = `name=${encodeURIComponent(name || '')}`;
  
  if (size) {
    queryParams += `&size=${size}`;
  }
  
  return api.get(`/medicine/search?${queryParams}`);
};

export const searchMedicineWithFilters = (params) => {
  const { name, colors, shape, size } = params;
  
  let queryParams = `name=${encodeURIComponent(name || '')}`;
  
  if (colors && colors.length > 0) {
    colors.forEach(color => {
      queryParams += `&colors=${encodeURIComponent(color)}`;
    });
  }
  
  if (shape && shape.length > 0) {
    shape.forEach(s => {
      queryParams += `&shape=${encodeURIComponent(s)}`;
    });
  }
  
  if (size) {
    queryParams += `&size=${size}`;
  }
  
  return api.get(`/medicine/search?${queryParams}`);
};

export const getSimilarMedicines = (params) => {
  const { medicine_id, page, size } = params;

  let queryParams = `medicine_id=${encodeURIComponent(medicine_id)}`;

  if (page) {
    queryParams += `&page=${page}`;
  }

  if (size) {
    queryParams += `&size=${size}`;
  }

  return api.get(`/medicine/similar?${queryParams}`);
};