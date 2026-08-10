import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading session...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/properties" element={<PropertiesPage />} />
                        <Route path="/tenants" element={<TenantsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/properties" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}