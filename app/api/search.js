import api from './index';

export const getSearchHistory = () => api.get('/search-history');

export const getSearchPopular = () => api.get('/search-history/popular');

export const deleteSearchHistory = search_history_id => api.delete(`/search-history/${search_history_id}`);

export const deleteAllSearchHistory = () => api.delete('/search-history/all');


