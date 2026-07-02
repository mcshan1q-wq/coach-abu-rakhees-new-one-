const AR_LATN_LOCALE = 'ar-EG-u-nu-latn';

export function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString(AR_LATN_LOCALE, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(AR_LATN_LOCALE, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export function formatNumber(value, digits = 0) {
    const num = Number(value);
    if (Number.isNaN(num)) return '0';
    return num.toLocaleString(AR_LATN_LOCALE, {
        maximumFractionDigits: digits,
        minimumFractionDigits: 0
    });
}

export function calculatePercentage(consumed, goal) {
    const goalNum = Number(goal);
    if (!goalNum || goalNum <= 0) return 0;
    const percentage = (Number(consumed) / goalNum) * 100;
    return Math.min(Math.round(percentage), 100);
}

export const MEAL_TYPES = ['فطور', 'غداء', 'عشاء', 'سناك', 'أخرى'];
