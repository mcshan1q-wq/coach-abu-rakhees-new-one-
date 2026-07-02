import React, { useEffect, useState } from 'react';

const ICONS = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
};

export default function Toast({ type = 'info', message, onClose }) {
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setClosing(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`toast toast-${type} ${closing ? 'toast-closing' : ''}`}
            onAnimationEnd={() => {
                if (closing) onClose();
            }}
        >
            <span className="toast-icon">{ICONS[type] || ICONS.info}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose} aria-label="إغلاق">
                ✕
            </button>
        </div>
    );
}
