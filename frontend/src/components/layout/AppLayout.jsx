// frontend/src/components/layout/AppLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Building2,
    Users,
    LogOut,
    ChevronDown,
    Building,
    Settings,
} from 'lucide-react';

export default function AppLayout() {
    const { user, workspaces, activeWorkspace, switchWorkspace, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Properties & Space', path: '/properties', icon: Building2 },
        { label: 'Tenants & Leases', path: '/tenants', icon: Users },
    ];

    return (
        <div className="min-h-screen flex bg-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-xl">
                <div>
                    <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
                        <div className="bg-sky-500 p-2 rounded-lg text-white">
                            <Building className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-wide">PropPilot</h1>
                            <p className="text-xs text-slate-400">Property SaaS</p>
                        </div>
                    </div>

                    <div className="p-4">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-2">
                            Active Workspace
                        </label>
                        <div className="relative">
                            <select
                                value={activeWorkspace?.id || ''}
                                onChange={(e) => switchWorkspace(e.target.value)}
                                className="w-full bg-slate-800 text-slate-200 text-sm py-2 px-3 pr-8 rounded-lg appearance-none border border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
                            >
                                {workspaces.map((ws) => (
                                    <option key={ws.id} value={ws.id}>
                                        {ws.name} ({ws.role})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                        </div>
                    </div>

                    <nav className="mt-4 px-3 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-sky-600 text-white shadow-md'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* BOTTOM SECTION: GLOBAL SETTINGS & USER PROFILE */}
                <div className="p-3 border-t border-slate-800 space-y-2">
                    {/* Global Settings (Account, Billing, Global Roles) */}
                    <Link
                        to="/settings"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/settings'
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                    >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Account Settings</span>
                    </Link>

                    {/* User Profile Footer */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {user?.firstName?.[0]}
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-medium text-slate-200 truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">
                        {activeWorkspace?.name || 'Workspace'} Dashboard
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                        Role: {activeWorkspace?.role || 'User'}
                    </span>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}