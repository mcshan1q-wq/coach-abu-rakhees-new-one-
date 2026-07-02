import React from 'react';

export default function EmptyState({ icon = '🍽️', title = 'لا توجد بيانات بعد', subtitle, action }) {
    return (
        <div className="empty-state">
            <div className="empty-icon">{icon}</div>
            <h3 className="empty-title">{title}</h3>
            {subtitle && <p className="empty-subtitle">{subtitle}</p>}
            {action && <div className="empty-action">{action}</div>}
        </div>
    );
}
