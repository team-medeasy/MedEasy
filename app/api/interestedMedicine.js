import api from './index';

export const getInteresedMedicine = () => api.get('/interested-medicine');

export const updateInterestedMedicine = (medicine_id) => api.post('/interested-medicine', { medicine_id });