import React from 'react';

export default function Card({ title, icon, children, className = '', actions }) {
    return (
        <div className={`card ${className}`}>
            {(title || icon || actions) && (
                <div className="card-header">
                    <div className="card-title-group">
                        {icon && <span className="card-icon">{icon}</span>}
                        {title && <h3 className="card-title">{title}</h3>}
                    </div>
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            <div className="card-body">{children}</div>
        </div>
    );
}
