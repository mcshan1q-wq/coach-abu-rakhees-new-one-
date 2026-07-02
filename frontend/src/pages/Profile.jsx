import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import * as userService from '../services/userService.js';
import { formatDate } from '../utils/helpers.js';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const toast = useToast();

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        identifier: user?.identifier || ''
    });
    const [goalsForm, setGoalsForm] = useState({
        proteinGoal: user?.protein_goal || 0,
        carbsGoal: user?.carbs_goal || 0,
        fatGoal: user?.fat_goal || 0,
        caloriesGoal: user?.calories_goal || 0,
        targetWeight: user?.target_weight || 0
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingGoals, setSavingGoals] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await userService.updateProfile(profileForm);
            updateUser(res.data.user);
            toast.success('تم تحديث الملف الشخصي بنجاح');
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleGoalsSubmit = async (e) => {
        e.preventDefault();
        setSavingGoals(true);
        try {
            const res = await userService.updateGoals({
                proteinGoal: Number(goalsForm.proteinGoal),
                carbsGoal: Number(goalsForm.carbsGoal),
                fatGoal: Number(goalsForm.fatGoal),
                caloriesGoal: Number(goalsForm.caloriesGoal),
                targetWeight: Number(goalsForm.targetWeight)
            });
            updateUser(res.data.user);
            toast.success('تم تحديث الأهداف بنجاح');
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء تحديث الأهداف');
        } finally {
            setSavingGoals(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">الملف الشخصي</h1>
                    <p className="page-subtitle">إدارة بياناتك الشخصية وأهدافك</p>
                </div>
            </div>

            <Card title="بياناتي" icon="👤">
                <div className="profile-info-grid">
                    <div className="profile-info-item">
                        <span className="profile-info-label">الاسم</span>
                        <span className="profile-info-value">{user?.name}</span>
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">البريد أو الجوال</span>
                        <span className="profile-info-value">{user?.identifier}</span>
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">تاريخ إنشاء الحساب</span>
                        <span className="profile-info-value">{formatDate(user?.created_at)}</span>
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">الوزن الحالي</span>
                        <span className="profile-info-value">{user?.current_weight} كجم</span>
                    </div>
                </div>
            </Card>

            <Card title="تعديل البيانات الشخصية" icon="✏️">
                <form onSubmit={handleProfileSubmit} className="form">
                    <div className="form-grid">
                        <div className="form-row">
                            <label>الاسم</label>
                            <input
                                type="text"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>البريد الإلكتروني أو رقم الجوال</label>
                            <input
                                type="text"
                                value={profileForm.identifier}
                                onChange={(e) => setProfileForm({ ...profileForm, identifier: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                        {savingProfile ? 'جارِ الحفظ...' : 'حفظ البيانات'}
                    </button>
                </form>
            </Card>

            <Card title="تعديل الأهداف" icon="🎯">
                <form onSubmit={handleGoalsSubmit} className="form">
                    <div className="form-grid">
                        <div className="form-row">
                            <label>هدف البروتين (جم)</label>
                            <input
                                type="number"
                                min="0"
                                value={goalsForm.proteinGoal}
                                onChange={(e) => setGoalsForm({ ...goalsForm, proteinGoal: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>هدف الكارب (جم)</label>
                            <input
                                type="number"
                                min="0"
                                value={goalsForm.carbsGoal}
                                onChange={(e) => setGoalsForm({ ...goalsForm, carbsGoal: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>هدف الدهون (جم)</label>
                            <input
                                type="number"
                                min="0"
                                value={goalsForm.fatGoal}
                                onChange={(e) => setGoalsForm({ ...goalsForm, fatGoal: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>هدف السعرات</label>
                            <input
                                type="number"
                                min="0"
                                value={goalsForm.caloriesGoal}
                                onChange={(e) => setGoalsForm({ ...goalsForm, caloriesGoal: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>الوزن المستهدف (كجم)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={goalsForm.targetWeight}
                                onChange={(e) => setGoalsForm({ ...goalsForm, targetWeight: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={savingGoals}>
                        {savingGoals ? 'جارِ الحفظ...' : 'حفظ الأهداف'}
                    </button>
                </form>
            </Card>
        </div>
    );
}
