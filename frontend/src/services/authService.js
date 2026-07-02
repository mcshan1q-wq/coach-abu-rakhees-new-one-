import api from '../api.js';

export function register(payload) {
    return api.post('/auth/register', payload);
}

export function login(identifier, password) {
    return api.post('/auth/login', { identifier, password });
}

export function getMe() {
    return api.get('/auth/me');
}
