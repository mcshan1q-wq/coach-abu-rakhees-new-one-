import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');

    if (config.url?.startsWith('/admin') && adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAdminPath = error.config?.url?.startsWith('/admin');
            if (isAdminPath) {
                localStorage.removeItem('adminToken');
                if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
                    window.location.href = '/admin';
                }
            } else {
                localStorage.removeItem('token');
                if (!['/', '/login', '/register'].includes(window.location.pathname)) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
