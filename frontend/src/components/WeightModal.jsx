import React, { useEffect, useState } from 'react';

const EMPTY_FORM = { weight: '', notes: '' };

export default function WeightModal({ open, onClose, onSubmit, initialData, submitting }) {
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        if (open) {
            setForm(
                initialData
                    ? { weight: initialData.weight, notes: initialData.notes || '' }
                    : EMPTY_FORM
            );
        }
    }, [open, initialData]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ weight: Number(form.weight) || 0, notes: form.notes });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">{initialData ? 'تعديل تسجيل الوزن' : 'تسجيل وزن جديد'}</h3>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-row">
                        <label>الوزن (كجم)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={form.weight}
                            onChange={(e) => setForm({ ...form, weight: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label>ملاحظات (اختياري)</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            rows={2}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            إلغاء
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'جارِ الحفظ...' : 'حفظ الوزن'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
