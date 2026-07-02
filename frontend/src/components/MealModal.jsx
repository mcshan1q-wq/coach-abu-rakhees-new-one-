import React, { useEffect, useState } from 'react';
import { MEAL_TYPES } from '../utils/helpers.js';
import { useToast } from '../hooks/useToast.jsx';
import * as aiService from '../services/aiService.js';

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
    const toast = useToast();
    const [form, setForm] = useState(EMPTY_FORM);
    const [aiDescription, setAiDescription] = useState('');
    const [analyzing, setAnalyzing] = useState(false);

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
            setAiDescription('');
        }
    }, [open, initialData]);

    if (!open) return null;

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleAnalyze = async () => {
        if (!aiDescription.trim()) {
            toast.error('اكتب وصف الوجبة أولاً');
            return;
        }
        setAnalyzing(true);
        try {
            const res = await aiService.analyzeMeal(aiDescription.trim());
            const macros = res.data.macros;
            setForm((prev) => ({
                ...prev,
                mealName: macros.mealName,
                protein: macros.protein,
                carbs: macros.carbs,
                fat: macros.fat,
                calories: macros.calories
            }));
            toast.success('تم حساب القيم الغذائية، راجعها قبل الحفظ');
        } catch (err) {
            toast.error(err.response?.data?.message || 'تعذر تحليل الوجبة، أدخل القيم يدويًا');
        } finally {
            setAnalyzing(false);
        }
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
                <div className="ai-meal-box">
                    <label>صف وجبتك بالذكاء الاصطناعي</label>
                    <div className="ai-meal-row">
                        <input
                            type="text"
                            value={aiDescription}
                            onChange={(e) => setAiDescription(e.target.value)}
                            placeholder="مثال: اكلت زبادي يوناني 200 جرام وموزة"
                        />
                        <button type="button" className="btn btn-outline" onClick={handleAnalyze} disabled={analyzing}>
                            {analyzing ? 'جارِ الحساب...' : 'احسب لي'}
                        </button>
                    </div>
                </div>
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
