import api from '../api.js';

export function getWeights() {
    return api.get('/weights');
}

export function getWeightStats() {
    return api.get('/weights/stats');
}

export function createWeight(payload) {
    return api.post('/weights', payload);
}

export function updateWeight(id, payload) {
    return api.put(`/weights/${id}`, payload);
}

export function deleteWeight(id) {
    return api.delete(`/weights/${id}`);
}
