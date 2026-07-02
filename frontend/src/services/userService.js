import api from '../api.js';

export function getProfile() {
    return api.get('/user/profile');
}

export function updateProfile(payload) {
    return api.put('/user/profile', payload);
}

export function updateGoals(payload) {
    return api.put('/user/goals', payload);
}
