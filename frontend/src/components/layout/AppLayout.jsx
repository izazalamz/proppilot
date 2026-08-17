import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import WorkspaceDropdown from './WorkspaceDropdown';
import {
    LayoutDashboard,
    Building2,
    Users,
    Receipt,
    Wrench,
    FolderArchive,
    LogOut,
    Building,
    Settings,
    Menu,
    X,
    Home,
    Sparkles,
} from 'lucide-react';

export default function AppLayout() {
    const { user, managerialWorkspaces, workspaces, activeWorkspace, switchWorkspace, logout, hasManagementAccess } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // If user has NO management access at all, redirect to Resident Tenant Portal
    if (!hasManagementAccess) {
        return <Navigate to="/portal" replace />;
    }

    // If active workspace is somehow a tenant workspace, auto-switch to first management workspace
    if (activeWorkspace?.role === 'TENANT' && managerialWorkspaces.length > 0) {
        switchWorkspace(managerialWorkspaces[0].id);
        return null;
    }

    const navItems = [
        { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Properties & Space', path: '/properties', icon: Building2 },
        { label: 'Tenants & Leases', path: '/tenants', icon: Users },
        { label: 'Finance & Billing', path: '/finance', icon: Receipt },
        { label: 'Maintenance & Work Orders', path: '/maintenance', icon: Wrench },
        { label: 'Documents & Notices', path: '/documents', icon: FolderArchive },
        { label: 'Resident Portal', path: '/portal', icon: Home, isResidentLink: true },
    ];

    return (
        <div className="h-screen w-screen flex bg-slate-100 font-sans overflow-hidden">
            {/* Mobile / Tablet Backdrop */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar (Responsive Off-Canvas on < lg, static on ≥ lg) */}
            <aside
                className={`
                    w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-none h-full
                    fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    lg:static lg:z-20
                `}
            >
                {/* TOP FIXED: LOGO & WORKSPACE DROPDOWN */}
                <div className="shrink-0 relative z-30">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="bg-sky-500 p-2 rounded-xl text-white shadow-xs">
                                <Building className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg tracking-wide">PropPilot</h1>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Management Shell</p>
                            </div>
                        </div>
                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 text-slate-400 hover:text-white rounded-lg lg:hidden"
                            title="Close navigation"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                            Managerial Portfolio
                        </label>
                        <WorkspaceDropdown onSelect={() => setSidebarOpen(false)} />
                    </div>
                </div>

                {/* MIDDLE SCROLLABLE NAV */}
                <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    item.isResidentLink
                                        ? isActive
                                            ? 'bg-emerald-600 text-white shadow-md'
                                            : 'text-emerald-400 hover:bg-emerald-950/60 hover:text-white mt-3 border border-emerald-500/20'
                                        : isActive
                                        ? 'bg-sky-600 text-white shadow-md'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* BOTTOM SECTION: GLOBAL SETTINGS & USER PROFILE */}
                <div className="shrink-0 p-3 border-t border-slate-800 space-y-1">
                    {/* Global Settings */}
                    <Link
                        to="/settings"
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            location.pathname === '/settings'
                                ? 'bg-slate-800 text-white shadow-xs'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Link>

                    {/* User Profile Card */}
                    <div className="pt-2 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-bold text-slate-200 truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs shrink-0 z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Hamburger Button (Mobile / Tablet) */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 lg:hidden rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Open navigation"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 truncate">
                            {activeWorkspace?.name || 'Workspace'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 truncate">
                            Role: {activeWorkspace?.role || 'User'}
                        </span>
                    </div>
                </header>

                <main className="flex-1 min-h-0 overflow-hidden relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}