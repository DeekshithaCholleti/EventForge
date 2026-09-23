import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In dev, falls back to relative path handled by Vite's proxy.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const errors = error.response?.data?.errors || [];
    const status = error.response?.status;
    return Promise.reject({ message, errors, status, raw: error });
  }
);

export default api;
