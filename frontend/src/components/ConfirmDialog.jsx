import React from 'react';

export default function ConfirmDialog({
    open,
    title = 'تأكيد العملية',
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    danger = false,
    onConfirm,
    onCancel
}) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-box confirm-box" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">{title}</h3>
                <p className="confirm-message">{message}</p>
                <div className="modal-actions">
                    <button className="btn btn-outline" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
