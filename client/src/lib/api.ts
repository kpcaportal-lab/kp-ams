import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
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
