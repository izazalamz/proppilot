import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import {
    Settings,
    User,
    Lock,
    Building2,
    Shield,
    Bell,
    CheckCircle2,
    AlertCircle,
    Save,
    Key,
    Mail,
    Phone,
    Briefcase,
    ExternalLink,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
    const { user, workspaces, activeWorkspace, switchWorkspace, updateUser } = useAuth();

    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'workspaces' | 'notifications'

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Notifications State (Local Preferences)
    const [notifications, setNotifications] = useState({
        emailInvoices: true,
        emailPayments: true,
        emailMaintenance: true,
        emailAnnouncements: true,
    });

    // Alert Messages
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setStatusMessage(null);

        try {
            const res = await api.put('/auth/profile', {
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
                phone: profileForm.phone,
            });

            if (updateUser) {
                updateUser(res.data.user);
            }

            setStatusMessage({ type: 'success', text: 'Personal profile details updated successfully!' });
            setTimeout(() => setStatusMessage(null), 4000);
        } catch (err) {
            setStatusMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to update profile details.',
            });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }

        setIsSavingPassword(true);
        setStatusMessage(null);

        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });

            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            setStatusMessage({ type: 'success', text: 'Password successfully changed and secured!' });
            setTimeout(() => setStatusMessage(null), 4000);
        } catch (err) {
            setStatusMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to change password. Please verify current password.',
            });
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50/50">
            {/* WORKSPACE BANNER ALERTS */}
            {statusMessage && (
                <div
                    className={`px-6 py-3 text-xs font-semibold flex items-center justify-between shadow-xs sticky top-0 z-30 transition-all ${
                        statusMessage.type === 'success'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        {statusMessage.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                        {statusMessage.text}
                    </span>
                    <button onClick={() => setStatusMessage(null)} className="opacity-80 hover:opacity-100">
                        ✕
                    </button>
                </div>
            )}

            {/* MAIN SETTINGS WORKSPACE */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* LEVEL 1 SETTINGS HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                            <Settings className="w-7 h-7 text-sky-600" />
                            Account Settings & Preferences
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Manage your personal identity, access security credentials, workspace memberships, and system alert routing.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            Role: <b className="text-slate-900">{activeWorkspace?.role || 'User'}</b>
                        </span>
                    </div>
                </div>

                {/* LEVEL 2 HORIZONTAL NAVIGATION TABS */}
                <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-xs font-bold overflow-x-auto no-scrollbar whitespace-nowrap">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'profile'
                                ? 'border-sky-600 text-sky-600'
                                : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <User className="w-4 h-4" /> Profile & Identity
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'security'
                                ? 'border-sky-600 text-sky-600'
                                : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Lock className="w-4 h-4" /> Password & Security
                    </button>
                    <button
                        onClick={() => setActiveTab('workspaces')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'workspaces'
                                ? 'border-sky-600 text-sky-600'
                                : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Building2 className="w-4 h-4" /> Workspaces & Roles ({workspaces.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'notifications'
                                ? 'border-sky-600 text-sky-600'
                                : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Bell className="w-4 h-4" /> Notification Routing
                    </button>
                </div>

                {/* TAB 1: PROFILE & IDENTITY */}
                {activeTab === 'profile' && (
                    <div className="max-w-3xl space-y-6">
                        {/* User Identity Card */}
                        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
                                {user?.firstName?.[0] || 'U'}
                                {user?.lastName?.[0] || ''}
                            </div>
                            <div className="space-y-1 text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {user?.firstName} {user?.lastName}
                                    </h3>
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Active
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                                <p className="text-[11px] text-slate-400 pt-1">
                                    Primary Workspace: <b>{activeWorkspace?.name || 'Standard'}</b> ({activeWorkspace?.role})
                                </p>
                            </div>
                        </div>

                        {/* Profile Edit Form */}
                        <form onSubmit={handleProfileSubmit} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-5">
                            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                                Personal Information
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={profileForm.firstName}
                                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={profileForm.lastName}
                                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        value={profileForm.email}
                                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                        Email address is permanently bound to account authentication.
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="+1-555-0199"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-3 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 2: PASSWORD & SECURITY */}
                {activeTab === 'security' && (
                    <div className="max-w-xl space-y-6">
                        <form onSubmit={handlePasswordSubmit} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-5">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                                    <Key className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Change Account Password</h4>
                                    <p className="text-xs text-slate-500">Ensure your new password contains at least 6 characters.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    placeholder="Enter your current password"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Enter at least 6 characters"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    placeholder="Re-type new password"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 transition-colors"
                                />
                            </div>

                            <div className="flex justify-end pt-3 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={isSavingPassword}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>{isSavingPassword ? 'Updating Password...' : 'Update Password'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 3: WORKSPACES & MEMBERSHIPS */}
                {activeTab === 'workspaces' && (
                    <div className="max-w-3xl space-y-4">
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                            <h4 className="text-sm font-bold text-slate-900">Your Connected Workspaces</h4>
                            <p className="text-xs text-slate-500">
                                Switch between property portfolio workspaces or access your resident tenant portal.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {workspaces.map((ws) => {
                                const isActive = activeWorkspace?.id === ws.id;
                                return (
                                    <div
                                        key={ws.id}
                                        onClick={() => !isActive && switchWorkspace(ws.id)}
                                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                                            isActive
                                                ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 bg-slate-900 text-white rounded-xl">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-bold text-slate-900">{ws.name}</h5>
                                                    <span className="text-[10px] text-slate-400">ID: {ws.id.slice(0, 8)}...</span>
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                                                    ws.role === 'OWNER'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : ws.role === 'MANAGER'
                                                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                        : ws.role === 'STAFF'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}
                                            >
                                                {ws.role}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                            <span className="text-slate-500 text-[11px]">
                                                {isActive ? '● Currently Active' : 'Click to Switch'}
                                            </span>
                                            {isActive && (
                                                <span className="font-bold text-sky-600 flex items-center gap-1">
                                                    Active Workspace
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Direct Jump to Tenant Portal */}
                        <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-xs">
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                    Resident Tenant Portal
                                </h4>
                                <p className="text-xs text-emerald-700">
                                    Access resident lease invoices, online rent payment, and maintenance tickets.
                                </p>
                            </div>
                            <Link
                                to="/portal"
                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                                <span>Open Portal</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* TAB 4: NOTIFICATIONS ROUTING */}
                {activeTab === 'notifications' && (
                    <div className="max-w-2xl space-y-4">
                        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-5">
                            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                                Email Notification Channels
                            </h4>

                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Rent Invoices & Billing Notices</p>
                                        <p className="text-[11px] text-slate-500">Receive email alerts when monthly invoices are generated.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.emailInvoices}
                                        onChange={(e) => setNotifications({ ...notifications, emailInvoices: e.target.checked })}
                                        className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Payment Confirmations</p>
                                        <p className="text-[11px] text-slate-500">Receive instant email receipts upon settled SSLCommerz payments.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.emailPayments}
                                        onChange={(e) => setNotifications({ ...notifications, emailPayments: e.target.checked })}
                                        className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Work Orders & Maintenance Updates</p>
                                        <p className="text-[11px] text-slate-500">Notifications when tickets change stage or technician is dispatched.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.emailMaintenance}
                                        onChange={(e) => setNotifications({ ...notifications, emailMaintenance: e.target.checked })}
                                        className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Building Announcements & Advisories</p>
                                        <p className="text-[11px] text-slate-500">Official notice board broadcasts published by property managers.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.emailAnnouncements}
                                        onChange={(e) => setNotifications({ ...notifications, emailAnnouncements: e.target.checked })}
                                        className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
                                    />
                                </label>
                            </div>

                            <div className="flex justify-end pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatusMessage({ type: 'success', text: 'Notification preferences saved!' });
                                        setTimeout(() => setStatusMessage(null), 3000);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save Notification Preferences</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
