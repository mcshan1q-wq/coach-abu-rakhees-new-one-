import React from 'react';

export default function Loading({ text = 'جارِ التحميل...' }) {
    return (
        <div className="loading-wrapper">
            <div className="loading-spinner" />
            <p className="loading-text">{text}</p>
        </div>
    );
}
