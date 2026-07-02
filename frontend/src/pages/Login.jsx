import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';

export default function Login() {
    const { login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [form, setForm] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.identifier, form.password);
            toast.success('تم تسجيل الدخول بنجاح، أهلًا بعودتك 💪');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <Link to="/" className="auth-brand">
                    <span className="brand-icon">🏋️</span>
                    <span className="brand-text">الكوتش أبو رخيص</span>
                </Link>
                <h1 className="auth-title">تسجيل الدخول</h1>
                <p className="auth-subtitle">أكمل رحلتك نحو هدفك الرياضي</p>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-row">
                        <label>البريد الإلكتروني أو رقم الجوال</label>
                        <input
                            type="text"
                            value={form.identifier}
                            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                            placeholder="example@email.com أو 05xxxxxxxx"
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label>كلمة المرور</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'جارِ تسجيل الدخول...' : 'تسجيل الدخول'}
                    </button>
                </form>

                <p className="auth-switch">
                    ليس لديك حساب؟ <Link to="/register">إنشاء حساب جديد</Link>
                </p>
            </div>
        </div>
    );
}
