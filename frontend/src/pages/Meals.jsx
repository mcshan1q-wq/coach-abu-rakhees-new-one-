import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import MealModal from '../components/MealModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useToast } from '../hooks/useToast.jsx';
import * as mealService from '../services/mealService.js';
import { formatDateTime, formatNumber } from '../utils/helpers.js';

export default function Meals() {
    const toast = useToast();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadMeals = async () => {
        try {
            const res = await mealService.getAllMeals();
            setMeals(res.data.meals);
        } catch (err) {
            toast.error(err.response?.data?.message || 'تعذر تحميل سجل الوجبات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMeals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openAddModal = () => {
        setEditingMeal(null);
        setModalOpen(true);
    };

    const openEditModal = (meal) => {
        setEditingMeal(meal);
        setModalOpen(true);
    };

    const handleSubmit = async (payload) => {
        setSubmitting(true);
        try {
            if (editingMeal) {
                await mealService.updateMeal(editingMeal.id, payload);
                toast.success('تم تحديث الوجبة بنجاح');
            } else {
                await mealService.createMeal(payload);
                toast.success('تم إضافة الوجبة بنجاح');
            }
            setModalOpen(false);
            await loadMeals();
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء حفظ الوجبة');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await mealService.deleteMeal(deleteTarget.id);
            toast.success('تم حذف الوجبة بنجاح');
            setDeleteTarget(null);
            await loadMeals();
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء حذف الوجبة');
        }
    };

    if (loading) return <Loading text="جارِ تحميل سجل الوجبات..." />;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">سجل الوجبات</h1>
                    <p className="page-subtitle">كل الوجبات التي سجلتها مرتبة من الأحدث</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    + إضافة وجبة
                </button>
            </div>

            <Card>
                {meals.length === 0 ? (
                    <EmptyState
                        icon="🍽️"
                        title="لا توجد وجبات مسجلة"
                        subtitle="ابدأ بإضافة أول وجبة لك"
                        action={
                            <button className="btn btn-primary" onClick={openAddModal}>
                                إضافة وجبة الآن
                            </button>
                        }
                    />
                ) : (
                    <>
                        <div className="table-wrapper desktop-only">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>النوع</th>
                                        <th>الاسم</th>
                                        <th>البروتين</th>
                                        <th>الكارب</th>
                                        <th>الدهون</th>
                                        <th>السعرات</th>
                                        <th>التاريخ والوقت</th>
                                        <th>إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meals.map((meal) => (
                                        <tr key={meal.id}>
                                            <td><span className="meal-type-badge">{meal.meal_type}</span></td>
                                            <td>{meal.meal_name}</td>
                                            <td>{formatNumber(meal.protein)} جم</td>
                                            <td>{formatNumber(meal.carbs)} جم</td>
                                            <td>{formatNumber(meal.fat)} جم</td>
                                            <td>{formatNumber(meal.calories)}</td>
                                            <td>{formatDateTime(meal.created_at)}</td>
                                            <td className="table-actions">
                                                <button className="icon-btn" onClick={() => openEditModal(meal)} title="تعديل">✏️</button>
                                                <button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(meal)} title="حذف">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mobile-only meals-cards">
                            {meals.map((meal) => (
                                <div className="meal-card" key={meal.id}>
                                    <div className="meal-card-header">
                                        <span className="meal-type-badge">{meal.meal_type}</span>
                                        <div className="meal-card-actions">
                                            <button className="icon-btn" onClick={() => openEditModal(meal)} title="تعديل">✏️</button>
                                            <button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(meal)} title="حذف">🗑️</button>
                                        </div>
                                    </div>
                                    <h4 className="meal-card-name">{meal.meal_name}</h4>
                                    <div className="meal-card-macros">
                                        <span>بروتين {formatNumber(meal.protein)} جم</span>
                                        <span>كارب {formatNumber(meal.carbs)} جم</span>
                                        <span>دهون {formatNumber(meal.fat)} جم</span>
                                        <span>{formatNumber(meal.calories)} سعرة</span>
                                    </div>
                                    <div className="meal-card-time">{formatDateTime(meal.created_at)}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            <MealModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingMeal}
                submitting={submitting}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                title="حذف الوجبة"
                message={`هل أنت متأكد من حذف وجبة "${deleteTarget?.meal_name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmText="حذف"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
