import api from './index';

export const checkHealth = () => api.get('/open-api/health');
