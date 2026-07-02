import React from 'react';

export default function ProgressBar({ label, consumed, goal, unit = 'جم', percentage, color }) {
    const pct = percentage !== undefined ? percentage : goal > 0 ? Math.min(Math.round((consumed / goal) * 100), 100) : 0;
    const remaining = Math.max(goal - consumed, 0);

    return (
        <div className="progress-block">
            <div className="progress-labels">
                <span className="progress-name">{label}</span>
                <span className="progress-values">
                    {Math.round(consumed)} / {Math.round(goal)} {unit}
                </span>
            </div>
            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: color || undefined }}
                />
            </div>
            <div className="progress-footer">
                <span>{pct}% مكتمل</span>
                <span>المتبقي: {Math.round(remaining)} {unit}</span>
            </div>
        </div>
    );
}
