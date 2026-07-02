import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import WeightModal from '../components/WeightModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useToast } from '../hooks/useToast.jsx';
import * as weightService from '../services/weightService.js';
import { formatDateTime, formatDate, formatNumber } from '../utils/helpers.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function WeightTracker() {
    const toast = useToast();
    const [weights, setWeights] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingWeight, setEditingWeight] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadData = async () => {
        try {
            const [weightsRes, statsRes] = await Promise.all([
                weightService.getWeights(),
                weightService.getWeightStats()
            ]);
            setWeights(weightsRes.data.weights);
            setStats(statsRes.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'تعذر تحميل بيانات الوزن');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openAddModal = () => {
        setEditingWeight(null);
        setModalOpen(true);
    };

    const openEditModal = (entry) => {
        setEditingWeight(entry);
        setModalOpen(true);
    };

    const handleSubmit = async (payload) => {
        setSubmitting(true);
        try {
            if (editingWeight) {
                await weightService.updateWeight(editingWeight.id, payload);
                toast.success('تم تحديث سجل الوزن بنجاح');
            } else {
                await weightService.createWeight(payload);
                toast.success('تم تسجيل الوزن بنجاح');
            }
            setModalOpen(false);
            await loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء حفظ الوزن');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await weightService.deleteWeight(deleteTarget.id);
            toast.success('تم حذف السجل بنجاح');
            setDeleteTarget(null);
            await loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء حذف السجل');
        }
    };

    if (loading) return <Loading text="جارِ تحميل بيانات الوزن..." />;

    const chartData = {
        labels: stats?.chart?.map((entry) => formatDate(entry.created_at)) || [],
        datasets: [
            {
                label: 'الوزن (كجم)',
                data: stats?.chart?.map((entry) => Number(entry.weight)) || [],
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255,255,255,0.15)',
                pointBackgroundColor: '#ffffff',
                tension: 0.35,
                fill: true
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#e5e5e5' } }
        },
        scales: {
            x: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.06)' } }
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">تتبع الوزن</h1>
                    <p className="page-subtitle">سجّل وزنك يوميًا وراقب تقدمك نحو هدفك</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    + تسجيل وزن
                </button>
            </div>

            <div className="stats-grid">
                <Card className="stat-card" title="آخر وزن" icon="⚖️">
                    <p className="stat-value">
                        {stats?.latestWeight !== null && stats?.latestWeight !== undefined ? formatNumber(stats.latestWeight, 1) : '-'} كجم
                    </p>
                </Card>
                <Card className="stat-card" title="الوزن المستهدف" icon="🎯">
                    <p className="stat-value">{formatNumber(stats?.targetWeight, 1)} كجم</p>
                </Card>
                <Card className="stat-card" title="الفرق عن الهدف" icon="📏">
                    <p className="stat-value">{stats?.difference !== null && stats?.difference !== undefined ? formatNumber(stats.difference, 1) : '-'} كجم</p>
                </Card>
                <Card className="stat-card" title="معدل أسبوعي / شهري" icon="📈">
                    <p className="stat-value-sm">
                        أسبوعي: {stats?.weeklyChange !== null && stats?.weeklyChange !== undefined ? formatNumber(stats.weeklyChange, 1) : '-'} كجم
                    </p>
                    <p className="stat-value-sm">
                        شهري: {stats?.monthlyChange !== null && stats?.monthlyChange !== undefined ? formatNumber(stats.monthlyChange, 1) : '-'} كجم
                    </p>
                </Card>
            </div>

            <Card title="الرسم البياني للوزن" icon="📊">
                {stats?.chart?.length ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <EmptyState icon="📊" title="لا توجد بيانات كافية لعرض الرسم البياني" />
                )}
            </Card>

            <Card title="سجل الوزن">
                {weights.length === 0 ? (
                    <EmptyState
                        icon="⚖️"
                        title="لم تسجل وزنك بعد"
                        subtitle="ابدأ بتسجيل وزنك اليوم لمتابعة تقدمك"
                        action={
                            <button className="btn btn-primary" onClick={openAddModal}>
                                تسجيل الوزن الآن
                            </button>
                        }
                    />
                ) : (
                    <>
                        <div className="table-wrapper desktop-only">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>الوزن</th>
                                        <th>ملاحظات</th>
                                        <th>التاريخ والوقت</th>
                                        <th>إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weights.map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{formatNumber(entry.weight, 1)} كجم</td>
                                            <td>{entry.notes || '-'}</td>
                                            <td>{formatDateTime(entry.created_at)}</td>
                                            <td className="table-actions">
                                                <button className="icon-btn" onClick={() => openEditModal(entry)} title="تعديل">✏️</button>
                                                <button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(entry)} title="حذف">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mobile-only meals-cards">
                            {weights.map((entry) => (
                                <div className="meal-card" key={entry.id}>
                                    <div className="meal-card-header">
                                        <span className="meal-type-badge">{formatNumber(entry.weight, 1)} كجم</span>
                                        <div className="meal-card-actions">
                                            <button className="icon-btn" onClick={() => openEditModal(entry)} title="تعديل">✏️</button>
                                            <button className="icon-btn icon-btn-danger" onClick={() => setDeleteTarget(entry)} title="حذف">🗑️</button>
                                        </div>
                                    </div>
                                    {entry.notes && <p className="meal-card-name">{entry.notes}</p>}
                                    <div className="meal-card-time">{formatDateTime(entry.created_at)}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            <WeightModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingWeight}
                submitting={submitting}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                title="حذف سجل الوزن"
                message="هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
