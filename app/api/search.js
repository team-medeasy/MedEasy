import api from './index';

export const getSearchHistory = () => api.get('/search-history');

export const getSearchPopular = () => api.get('/search-history/popular');

export const deleteSearchHistory = search_history_id =>
  api.delete(`/search-history/${search_history_id}`);

export const deleteAllSearchHistory = () => api.delete('/search-history/all');

export const getMedicineDetail = async itemSeq => {
  try {
    const response = await api.get(`/medicine/item_seq/${itemSeq}`);
    return response.data;
  } catch (error) {
    console.error('의약품 상세 정보 가져오기 실패:', error);
    throw error;
  }
};
