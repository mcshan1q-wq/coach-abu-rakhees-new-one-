import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';

const EMPTY_FORM = {
    name: '',
    identifier: '',
    password: '',
    confirmPassword: '',
    currentWeight: '',
    targetWeight: '',
    proteinGoal: '',
    carbsGoal: '',
    fatGoal: '',
    caloriesGoal: ''
};

export default function Register() {
    const { register } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);

    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toast.error('كلمة المرور وتأكيدها غير متطابقين');
            return;
        }

        setLoading(true);
        try {
            await register({
                name: form.name,
                identifier: form.identifier,
                password: form.password,
                confirmPassword: form.confirmPassword,
                currentWeight: Number(form.currentWeight) || 0,
                targetWeight: Number(form.targetWeight) || 0,
                proteinGoal: Number(form.proteinGoal) || 0,
                carbsGoal: Number(form.carbsGoal) || 0,
                fatGoal: Number(form.fatGoal) || 0,
                caloriesGoal: Number(form.caloriesGoal) || 0
            });
            toast.success('تم إنشاء حسابك بنجاح، لنبدأ رحلتك 🚀');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box auth-box-wide">
                <Link to="/" className="auth-brand">
                    <span className="brand-icon">🏋️</span>
                    <span className="brand-text">الكوتش أبو رخيص</span>
                </Link>
                <h1 className="auth-title">إنشاء حساب جديد</h1>
                <p className="auth-subtitle">حدد بياناتك وأهدافك لنبدأ تتبع تقدمك</p>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-section-title">البيانات الأساسية</div>
                    <div className="form-grid">
                        <div className="form-row">
                            <label>الاسم</label>
                            <input type="text" value={form.name} onChange={handleChange('name')} required />
                        </div>
                        <div className="form-row">
                            <label>البريد الإلكتروني أو رقم الجوال</label>
                            <input type="text" value={form.identifier} onChange={handleChange('identifier')} required />
                        </div>
                        <div className="form-row">
                            <label>كلمة المرور</label>
                            <input type="password" value={form.password} onChange={handleChange('password')} required minLength={6} />
                        </div>
                        <div className="form-row">
                            <label>تأكيد كلمة المرور</label>
                            <input
                                type="password"
                                value={form.confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="form-section-title">الوزن</div>
                    <div className="form-grid">
                        <div className="form-row">
                            <label>الوزن الحالي (كجم)</label>
                            <input type="number" min="0" step="0.1" value={form.currentWeight} onChange={handleChange('currentWeight')} required />
                        </div>
                        <div className="form-row">
                            <label>الوزن المستهدف (كجم)</label>
                            <input type="number" min="0" step="0.1" value={form.targetWeight} onChange={handleChange('targetWeight')} required />
                        </div>
                    </div>

                    <div className="form-section-title">الأهداف اليومية</div>
                    <div className="form-grid">
                        <div className="form-row">
                            <label>هدف البروتين (جم)</label>
                            <input type="number" min="0" step="1" value={form.proteinGoal} onChange={handleChange('proteinGoal')} required />
                        </div>
                        <div className="form-row">
                            <label>هدف الكارب (جم)</label>
                            <input type="number" min="0" step="1" value={form.carbsGoal} onChange={handleChange('carbsGoal')} required />
                        </div>
                        <div className="form-row">
                            <label>هدف الدهون (جم)</label>
                            <input type="number" min="0" step="1" value={form.fatGoal} onChange={handleChange('fatGoal')} required />
                        </div>
                        <div className="form-row">
                            <label>هدف السعرات</label>
                            <input type="number" min="0" step="1" value={form.caloriesGoal} onChange={handleChange('caloriesGoal')} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'جارِ إنشاء الحساب...' : 'إنشاء الحساب'}
                    </button>
                </form>

                <p className="auth-switch">
                    لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
                </p>
            </div>
        </div>
    );
}
