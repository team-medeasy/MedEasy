import api from './index';

export const uploadMedicine = data => api.post('/medicine/upload', data);

export const updateMedicine = data => api.post('/medicine/update', data);

export const getMedicineList = () => api.get('/medicine');

export const searchMedicine = (params) => {
  const { name, page = 0, size = 10 } = params;
  
  let queryParams = `name=${encodeURIComponent(name || '')}&page=${page}&size=${size}`;
  
  return api.get(`/medicine/search?${queryParams}`);
};

export const searchMedicineWithFilters = (params) => {
  const { name, colors, shape, page = 0, size = 10 } = params;
  
  let queryParams = `name=${encodeURIComponent(name || '')}&page=${page}&size=${size}`;
  
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

export const getMedicineById = (medicine_id) => {
  return api.get(`/medicine/medicine_id/${medicine_id}`);
};

// 약 정보 오디오 생성
export const getMedicineAudioUrl = (medicineId) =>
  api.get(`/medicine/${medicineId}/audio-url`);