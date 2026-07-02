import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import * as mealService from '../services/mealService.js';
import { formatDateTime, formatNumber } from '../utils/helpers.js';

export default function Dashboard() {
    const { user } = useAuth();
    const toast = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const res = await mealService.getTodayMeals();
            setData(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'تعذر تحميل بيانات اليوم');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return <Loading text="جارِ تحميل ملخص اليوم..." />;

    const totals = data?.totals || { protein: 0, carbs: 0, fat: 0, calories: 0 };
    const goals = data?.goals || {
        protein_goal: 0,
        carbs_goal: 0,
        fat_goal: 0,
        calories_goal: 0
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">أهلًا، {user?.name} 💪</h1>
                    <p className="page-subtitle">هذا ملخص تقدمك اليوم نحو أهدافك</p>
                </div>
                <Link to="/meals" className="btn btn-primary">+ إضافة وجبة</Link>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" title="السعرات" icon="🔥">
                    <p className="stat-value">{formatNumber(totals.calories)}</p>
                    <p className="stat-goal">من {formatNumber(goals.calories_goal)} سعرة</p>
                </Card>
                <Card className="stat-card" title="البروتين" icon="🍗">
                    <p className="stat-value">{formatNumber(totals.protein)} جم</p>
                    <p className="stat-goal">من {formatNumber(goals.protein_goal)} جم</p>
                </Card>
                <Card className="stat-card" title="الكارب" icon="🍚">
                    <p className="stat-value">{formatNumber(totals.carbs)} جم</p>
                    <p className="stat-goal">من {formatNumber(goals.carbs_goal)} جم</p>
                </Card>
                <Card className="stat-card" title="الدهون" icon="🥑">
                    <p className="stat-value">{formatNumber(totals.fat)} جم</p>
                    <p className="stat-goal">من {formatNumber(goals.fat_goal)} جم</p>
                </Card>
            </div>

            <Card title="ملخص التقدم اليومي" icon="📊">
                <ProgressBar label="البروتين" consumed={totals.protein} goal={Number(goals.protein_goal)} unit="جم" />
                <ProgressBar label="الكارب" consumed={totals.carbs} goal={Number(goals.carbs_goal)} unit="جم" />
                <ProgressBar label="الدهون" consumed={totals.fat} goal={Number(goals.fat_goal)} unit="جم" />
                <ProgressBar label="السعرات" consumed={totals.calories} goal={Number(goals.calories_goal)} unit="سعرة" />
            </Card>

            <Card
                title="وجبات اليوم"
                icon="🍽️"
                actions={
                    <Link to="/meals" className="btn btn-outline btn-sm">
                        عرض الكل
                    </Link>
                }
            >
                {data?.meals?.length ? (
                    <div className="meals-list">
                        {data.meals.slice(0, 5).map((meal) => (
                            <div className="meal-row" key={meal.id}>
                                <div className="meal-row-main">
                                    <span className="meal-type-badge">{meal.meal_type}</span>
                                    <span className="meal-name">{meal.meal_name}</span>
                                </div>
                                <div className="meal-row-macros">
                                    <span>{formatNumber(meal.calories)} سعرة</span>
                                    <span>ب {formatNumber(meal.protein)}</span>
                                    <span>ك {formatNumber(meal.carbs)}</span>
                                    <span>د {formatNumber(meal.fat)}</span>
                                </div>
                                <div className="meal-row-time">{formatDateTime(meal.created_at)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="🍽️"
                        title="لم تسجل أي وجبة اليوم"
                        subtitle="ابدأ بتسجيل وجبتك الأولى لمتابعة تقدمك"
                        action={
                            <Link to="/meals" className="btn btn-primary">
                                إضافة وجبة الآن
                            </Link>
                        }
                    />
                )}
            </Card>
        </div>
    );
}
