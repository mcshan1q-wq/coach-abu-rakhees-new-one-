import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Loading from './Loading.jsx';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <Loading text="جارِ التحقق من الجلسة..." />;
    if (!user) return <Navigate to="/login" replace />;

    return children;
}
