import api from '../api.js';

export function adminLogin(username, password) {
    return api.post('/admin/login', { username, password });
}

export function getAdminStats() {
    return api.get('/admin/stats');
}

export function getAdminUsers() {
    return api.get('/admin/users');
}

export function getAdminUserDetails(id) {
    return api.get(`/admin/users/${id}`);
}

export function deleteAdminUser(id) {
    return api.delete(`/admin/users/${id}`);
}
