import api from './index';

export const getInteresedMedicine = ({page, size}) => 
    api.get(`/interested-medicine?page=${page}&size=${size}`);

export const updateInterestedMedicine = (medicine_id) => 
    api.post('/interested-medicine', { medicine_id });

export const getInterestedMedicineStatus = (medicineId) => 
    api.get(`/interested-medicine/medicine/${medicineId}`);