import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
    return (
        <div className="app-shell">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
