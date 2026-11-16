import axios from 'axios';
import i18n from '../i18n';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  sendOtp: (mobile) => api.post('/auth/send-otp/', { mobile }),
  verifyOtp: (mobile, otp, purpose = 'registration') => api.post('/auth/verify-otp/', { mobile, otp, purpose }),
  forgotPassword: (mobile) => api.post('/auth/forgot-password/', { mobile }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  updateLanguage: (lang) => api.patch('/auth/profile/', { preferred_language: lang }),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// Crops
export const cropAPI = {
  list: (params) => api.get('/crops/', { params }),
  detail: (id) => api.get(`/crops/${id}/`),
  create: (data) => api.post('/crops/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/crops/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/crops/${id}/`),
  myListings: (params) => api.get('/crops/my-listings/', { params }),
  uploadImage: (id, data) => api.post(`/crops/${id}/images/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (cropId, imgId) => api.delete(`/crops/${cropId}/images/${imgId}/`),
  categories: () => api.get('/crops/categories/'),
};

// Favorites
export const favoritesAPI = {
  list: () => api.get('/favorites/'),
  add: (listingId) => api.post('/favorites/', { listing: listingId }),
  remove: (listingId) => api.delete(`/favorites/${listingId}/`),
};

// Chat / Conversations
export const chatAPI = {
  conversations: () => api.get('/chat/conversations/'),
  messages: (convId) => api.get(`/chat/conversations/${convId}/messages/`),
  startConversation: (listingId) => api.post('/chat/conversations/', { listing: listingId }),
  sendMessage: (convId, text) => api.post(`/chat/conversations/${convId}/messages/`, { message_text: text }),
  makeOffer: (convId, data) => api.post(`/chat/conversations/${convId}/offers/`, data),
  respondOffer: (convId, offerId, status, counterPrice) =>
    api.patch(`/chat/conversations/${convId}/offers/${offerId}/`, { status, counter_price: counterPrice }),
};

// Notifications
export const notifAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id) => api.patch(`/notifications/${id}/`, { is_read: true }),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
};

// Location
export const locationAPI = {
  states: () => api.get('/location/states/'),
  districts: (stateId) => api.get(`/location/districts/?state=${stateId}`),
};

export default api;
