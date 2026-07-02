import React, { useEffect, useState } from 'react';
import { MEAL_TYPES } from '../utils/helpers.js';

const EMPTY_FORM = {
    mealType: 'فطور',
    mealName: '',
    protein: '',
    carbs: '',
    fat: '',
    calories: '',
    notes: ''
};

export default function MealModal({ open, onClose, onSubmit, initialData, submitting }) {
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        if (open) {
            setForm(
                initialData
                    ? {
                          mealType: initialData.meal_type,
                          mealName: initialData.meal_name,
                          protein: initialData.protein,
                          carbs: initialData.carbs,
                          fat: initialData.fat,
                          calories: initialData.calories,
                          notes: initialData.notes || ''
                      }
                    : EMPTY_FORM
            );
        }
    }, [open, initialData]);

    if (!open) return null;

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            mealType: form.mealType,
            mealName: form.mealName,
            protein: Number(form.protein) || 0,
            carbs: Number(form.carbs) || 0,
            fat: Number(form.fat) || 0,
            calories: Number(form.calories) || 0,
            notes: form.notes
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">{initialData ? 'تعديل الوجبة' : 'إضافة وجبة جديدة'}</h3>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-row">
                        <label>نوع الوجبة</label>
                        <select value={form.mealType} onChange={handleChange('mealType')} required>
                            {MEAL_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label>اسم الوجبة</label>
                        <input
                            type="text"
                            value={form.mealName}
                            onChange={handleChange('mealName')}
                            placeholder="مثال: صدر دجاج مشوي مع أرز"
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-row">
                            <label>البروتين (جم)</label>
                            <input type="number" min="0" step="0.1" value={form.protein} onChange={handleChange('protein')} required />
                        </div>
                        <div className="form-row">
                            <label>الكارب (جم)</label>
                            <input type="number" min="0" step="0.1" value={form.carbs} onChange={handleChange('carbs')} required />
                        </div>
                        <div className="form-row">
                            <label>الدهون (جم)</label>
                            <input type="number" min="0" step="0.1" value={form.fat} onChange={handleChange('fat')} required />
                        </div>
                        <div className="form-row">
                            <label>السعرات</label>
                            <input type="number" min="0" step="1" value={form.calories} onChange={handleChange('calories')} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <label>ملاحظات (اختياري)</label>
                        <textarea value={form.notes} onChange={handleChange('notes')} rows={2} />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            إلغاء
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'جارِ الحفظ...' : 'حفظ الوجبة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
