import api from '../api.js';

export function getTodayMeals() {
    return api.get('/meals/today');
}

export function getAllMeals() {
    return api.get('/meals');
}

export function createMeal(payload) {
    return api.post('/meals', payload);
}

export function updateMeal(id, payload) {
    return api.put(`/meals/${id}`, payload);
}

export function deleteMeal(id) {
    return api.delete(`/meals/${id}`);
}
