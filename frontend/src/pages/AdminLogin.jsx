import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast.jsx';
import * as adminService from '../services/adminService.js';

export default function AdminLogin() {
    const toast = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await adminService.adminLogin(form.username, form.password);
            localStorage.setItem('adminToken', res.data.token);
            toast.success('تم تسجيل دخول الأدمن بنجاح');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'بيانات دخول الأدمن غير صحيحة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page admin-auth-page">
            <div className="auth-box">
                <div className="auth-brand">
                    <span className="brand-icon">🛡️</span>
                    <span className="brand-text">لوحة تحكم الأدمن</span>
                </div>
                <h1 className="auth-title">تسجيل دخول الأدمن</h1>
                <p className="auth-subtitle">الكوتش أبو رخيص - إدارة النظام</p>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-row">
                        <label>اسم المستخدم</label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label>كلمة المرور</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'جارِ الدخول...' : 'دخول'}
                    </button>
                </form>
            </div>
        </div>
    );
}
