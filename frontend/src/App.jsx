import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';
import FinancePage from './pages/FinancePage';
import MaintenancePage from './pages/MaintenancePage';
import DocumentsPage from './pages/DocumentsPage';
import TenantPortalPage from './pages/TenantPortalPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading session...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const RootRoute = () => {
    const { user, loading, hasManagementAccess } = useAuth();
    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading session...</div>;
    if (!user) return <LandingPage />;
    if (hasManagementAccess) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/portal" replace />;
};


export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Landing & Auth */}
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* Dedicated Tenant Portal */}
                    <Route
                        path="/portal"
                        element={
                            <ProtectedRoute>
                                <TenantPortalPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Management Workspaces Shell */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/properties" element={<PropertiesPage />} />
                        <Route path="/tenants" element={<TenantsPage />} />
                        <Route path="/finance" element={<FinancePage />} />
                        <Route path="/maintenance" element={<MaintenancePage />} />
                        <Route path="/documents" element={<DocumentsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

