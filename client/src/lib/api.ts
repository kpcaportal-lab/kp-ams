import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

console.log('📡 API Base URL:', baseURL);

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Attach JWT token from localStorage/cookies on every request
api.interceptors.request.use((config) => {
    // Try to get token from localStorage first (client-side)
    let token: string | null = null;

    if (typeof window !== 'undefined') {
        token = localStorage.getItem('kp_token');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 — clear token and redirect to login
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('kp_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
