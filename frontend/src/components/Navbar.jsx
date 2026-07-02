import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const LINKS = [
    { to: '/dashboard', label: 'الرئيسية', icon: '🏠' },
    { to: '/meals', label: 'الوجبات', icon: '🍗' },
    { to: '/weight-tracker', label: 'تتبع الوزن', icon: '⚖️' },
    { to: '/profile', label: 'ملفي الشخصي', icon: '👤' }
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-brand">
                    <span className="brand-icon">🏋️</span>
                    <span className="brand-text">الكوتش أبو رخيص</span>
                </div>

                <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="القائمة">
                    ☰
                </button>

                <div className={`navbar-links ${open ? 'open' : ''}`}>
                    {LINKS.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                            onClick={() => setOpen(false)}
                        >
                            <span>{link.icon}</span>
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                    <div className="navbar-user">
                        <span className="navbar-username">{user?.name}</span>
                        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
