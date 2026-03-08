import axios from 'axios';

const isProd = import.meta.env.PROD;
const baseURL = import.meta.env.VITE_API_URL;

if (isProd && !baseURL) {
    console.warn('⚠️ VITE_API_URL is not defined in production environment. Falling back to localhost, which may cause network errors.');
}

console.log('📡 API Base URL:', baseURL || 'http://localhost:4000');

const api = axios.create({
    baseURL: baseURL || 'http://localhost:4000',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('kp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 — clear token and redirect to login
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('kp_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
