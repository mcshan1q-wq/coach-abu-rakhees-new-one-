import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useToast } from '../hooks/useToast.jsx';
import * as adminService from '../services/adminService.js';
import { formatDate, formatDateTime, formatNumber } from '../utils/helpers.js';

export default function AdminDashboard() {
    const toast = useToast();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                adminService.getAdminStats(),
                adminService.getAdminUsers()
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.users);
        } catch (err) {
            toast.error(err.response?.data?.message || 'تعذر تحميل بيانات لوحة الأدمن');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    const openDetails = async (userId) => {
        setDetailsLoading(true);
        try {
            const res = await adminService.getAdminUserDetails(userId);
            setSelectedUser(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'تعذر تحميل تفاصيل المستخدم');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        try {
            await adminService.deleteAdminUser(deleteTarget.id);
            toast.success('تم حذف المستخدم بنجاح');
            setDeleteTarget(null);
            setSelectedUser(null);
            await loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء حذف المستخدم');
        }
    };

    if (loading) {
        return (
            <div className="main-content">
                <Loading text="جارِ تحميل لوحة الأدمن..." />
            </div>
        );
    }

    return (
        <div className="main-content">
        <div className="page admin-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">لوحة تحكم الأدمن</h1>
                    <p className="page-subtitle">إدارة مستخدمي الكوتش أبو رخيص</p>
                </div>
                <button className="btn btn-outline" onClick={handleLogout}>
                    تسجيل الخروج
                </button>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" title="عدد المستخدمين" icon="👥">
                    <p className="stat-value">{formatNumber(stats?.usersCount)}</p>
                </Card>
                <Card className="stat-card" title="عدد الوجبات" icon="🍽️">
                    <p className="stat-value">{formatNumber(stats?.mealsCount)}</p>
                </Card>
                <Card className="stat-card" title="عدد تسجيلات الوزن" icon="⚖️">
                    <p className="stat-value">{formatNumber(stats?.weightsCount)}</p>
                </Card>
            </div>

            <Card title="قائمة المستخدمين" icon="📋">
                {users.length === 0 ? (
                    <EmptyState icon="👥" title="لا يوجد مستخدمون مسجلون بعد" />
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>الاسم</th>
                                    <th>البريد أو الجوال</th>
                                    <th>الوزن الحالي</th>
                                    <th>الوزن المستهدف</th>
                                    <th>آخر وزن</th>
                                    <th>عدد الوجبات</th>
                                    <th>تاريخ التسجيل</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.identifier}</td>
                                        <td>{formatNumber(u.current_weight, 1)} كجم</td>
                                        <td>{formatNumber(u.target_weight, 1)} كجم</td>
                                        <td>{u.last_weight ? `${formatNumber(u.last_weight, 1)} كجم` : '-'}</td>
                                        <td>{u.meals_count}</td>
                                        <td>{formatDate(u.created_at)}</td>
                                        <td className="table-actions">
                                            <button className="icon-btn" onClick={() => openDetails(u.id)} title="عرض التفاصيل">👁️</button>
                                            <button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(u)} title="حذف">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {(selectedUser || detailsLoading) && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
                        {detailsLoading ? (
                            <Loading text="جارِ تحميل التفاصيل..." />
                        ) : (
                            <>
                                <h3 className="modal-title">تفاصيل المستخدم: {selectedUser.user.name}</h3>
                                <div className="profile-info-grid">
                                    <div className="profile-info-item">
                                        <span className="profile-info-label">البريد أو الجوال</span>
                                        <span className="profile-info-value">{selectedUser.user.identifier}</span>
                                    </div>
                                    <div className="profile-info-item">
                                        <span className="profile-info-label">تاريخ التسجيل</span>
                                        <span className="profile-info-value">{formatDate(selectedUser.user.created_at)}</span>
                                    </div>
                                    <div className="profile-info-item">
                                        <span className="profile-info-label">الوزن الحالي</span>
                                        <span className="profile-info-value">{selectedUser.user.current_weight} كجم</span>
                                    </div>
                                    <div className="profile-info-item">
                                        <span className="profile-info-label">الوزن المستهدف</span>
                                        <span className="profile-info-value">{selectedUser.user.target_weight} كجم</span>
                                    </div>
                                    <div className="profile-info-item">
                                        <span className="profile-info-label">هدف السعرات</span>
                                        <span className="profile-info-value">{selectedUser.user.calories_goal}</span>
                                    </div>
                                    <div className="profile-info-item">
                                        <span className="profile-info-label">هدف البروتين</span>
                                        <span className="profile-info-value">{selectedUser.user.protein_goal} جم</span>
                                    </div>
                                </div>

                                <h4 className="section-subtitle">آخر الوجبات ({selectedUser.meals.length})</h4>
                                <div className="mini-list">
                                    {selectedUser.meals.slice(0, 5).map((m) => (
                                        <div className="mini-list-row" key={m.id}>
                                            <span>{m.meal_type} - {m.meal_name}</span>
                                            <span>{formatDateTime(m.created_at)}</span>
                                        </div>
                                    ))}
                                    {selectedUser.meals.length === 0 && <p className="empty-subtitle">لا توجد وجبات مسجلة</p>}
                                </div>

                                <h4 className="section-subtitle">آخر تسجيلات الوزن ({selectedUser.weights.length})</h4>
                                <div className="mini-list">
                                    {selectedUser.weights.slice(0, 5).map((w) => (
                                        <div className="mini-list-row" key={w.id}>
                                            <span>{w.weight} كجم</span>
                                            <span>{formatDateTime(w.created_at)}</span>
                                        </div>
                                    ))}
                                    {selectedUser.weights.length === 0 && <p className="empty-subtitle">لا توجد تسجيلات وزن</p>}
                                </div>

                                <div className="modal-actions">
                                    <button className="btn btn-outline" onClick={() => setSelectedUser(null)}>إغلاق</button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            setDeleteTarget(selectedUser.user);
                                        }}
                                    >
                                        حذف المستخدم
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="حذف المستخدم"
                message={`هل أنت متأكد من حذف المستخدم "${deleteTarget?.name}"؟ سيتم حذف جميع بياناته نهائيًا.`}
                confirmText="حذف نهائيًا"
                danger
                onConfirm={handleDeleteUser}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
        </div>
    );
}
