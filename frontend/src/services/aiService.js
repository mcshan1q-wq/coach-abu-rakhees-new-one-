import api from '../api.js';

export function analyzeMeal(description) {
    return api.post('/ai/analyze-meal', { description });
}
