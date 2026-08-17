import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Building2,
    ChevronDown,
    Check,
    Home,
    Settings,
    Shield,
    Briefcase,
    Wrench,
    Sparkles,
} from 'lucide-react';

export default function WorkspaceDropdown({ onSelect }) {
    const { managerialWorkspaces, activeWorkspace, switchWorkspace, tenantWorkspaces, hasManagementAccess } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const getRoleBadge = (role) => {
        switch (role) {
            case 'OWNER':
                return {
                    label: 'Owner',
                    icon: Shield,
                    classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                };
            case 'ADMIN':
                return {
                    label: 'Admin',
                    icon: Shield,
                    classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
                };
            case 'MANAGER':
                return {
                    label: 'Manager',
                    icon: Briefcase,
                    classes: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
                };
            case 'STAFF':
                return {
                    label: 'Staff',
                    icon: Wrench,
                    classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                };
            default:
                return {
                    label: role || 'Member',
                    icon: Briefcase,
                    classes: 'bg-slate-700 text-slate-300 border-slate-600',
                };
        }
    };

    const handleSelectWorkspace = (wsId) => {
        if (wsId !== activeWorkspace?.id) {
            switchWorkspace(wsId);
        }
        setIsOpen(false);
        if (onSelect) onSelect();
    };

    const activeRoleBadge = getRoleBadge(activeWorkspace?.role);
    const ActiveRoleIcon = activeRoleBadge.icon;

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* TRIGGER BUTTON */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between gap-2.5 p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group
                    ${
                        isOpen
                            ? 'bg-slate-800 border-sky-500/50 ring-2 ring-sky-500/20 shadow-lg'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600 shadow-xs'
                    }
                `}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Workspace Avatar Badge */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs ring-1 ring-white/10">
                        {activeWorkspace?.name ? activeWorkspace.name.charAt(0).toUpperCase() : 'W'}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-100 group-hover:text-white truncate leading-snug">
                            {activeWorkspace?.name || 'Select Workspace'}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                                className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md border ${activeRoleBadge.classes}`}
                            >
                                <ActiveRoleIcon className="w-2.5 h-2.5" />
                                {activeRoleBadge.label}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    className={`p-1 text-slate-400 group-hover:text-slate-200 rounded-lg transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-sky-400' : ''
                    }`}
                >
                    <ChevronDown className="w-4 h-4" />
                </div>
            </button>

            {/* FLOATING DROPDOWN MENU */}
            {isOpen && (
                <div
                    className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 shadow-2xl rounded-2xl p-1.5 z-50 max-h-[380px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                    role="listbox"
                >
                    {/* HEADER */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Managerial Portfolios
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded-full">
                            {managerialWorkspaces.length}
                        </span>
                    </div>

                    {/* WORKSPACE LIST */}
                    <div className="space-y-1">
                        {managerialWorkspaces.map((ws) => {
                            const isSelected = ws.id === activeWorkspace?.id;
                            const badge = getRoleBadge(ws.role);
                            const RoleIcon = badge.icon;

                            return (
                                <button
                                    key={ws.id}
                                    type="button"
                                    onClick={() => handleSelectWorkspace(ws.id)}
                                    className={`
                                        w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer group/item
                                        ${
                                            isSelected
                                                ? 'bg-sky-500/15 border border-sky-500/30 text-white shadow-xs'
                                                : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent'
                                        }
                                    `}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div
                                            className={`
                                                w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors
                                                ${
                                                    isSelected
                                                        ? 'bg-sky-500 text-white shadow-xs'
                                                        : 'bg-slate-800 text-slate-300 group-hover/item:bg-slate-700 group-hover/item:text-white'
                                                }
                                            `}
                                        >
                                            {ws.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold truncate leading-tight">{ws.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md border ${badge.classes}`}
                                                >
                                                    <RoleIcon className="w-2.5 h-2.5" />
                                                    {badge.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="p-1 text-sky-400 shrink-0 animate-in fade-in">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 space-y-1">
                        {/* If user is also a resident tenant in any space */}
                        {(tenantWorkspaces.length > 0 || !hasManagementAccess) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    if (onSelect) onSelect();
                                    navigate('/portal');
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            >
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                                    <Home className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate">Switch to Resident Portal</div>
                                    <div className="text-[10px] font-normal text-slate-400">View rented units & invoices</div>
                                </div>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                if (onSelect) onSelect();
                                navigate('/settings');
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                <Settings className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">Manage Workspaces & Roles</span>
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}
