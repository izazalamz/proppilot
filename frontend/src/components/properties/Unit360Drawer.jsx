import React, { useState } from 'react';
import {
    Building2,
    Users,
    Receipt,
    Wrench,
    Folder,
    ExternalLink,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus,
    FileText,
    Download,
    ArrowRight,
    Tag,
    Layers,
    ShieldAlert,
    Info,
    Sparkles,
    CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Unit360Drawer({
    unitOverview,
    loading,
    onRefresh,
    onOpenActionModal,
}) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'leases' | 'billing' | 'maintenance' | 'docs'

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-slate-100 rounded-2xl"></div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                </div>
                <div className="h-40 bg-slate-100 rounded-2xl"></div>
            </div>
        );
    }

    if (!unitOverview) {
        return (
            <div className="text-center py-10 text-slate-500 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm font-semibold">Unit details not found</p>
            </div>
        );
    }

    const {
        name,
        description,
        status,
        property,
        unitGroup,
        unitType,
        activeLease,
        leases = [],
        maintenanceRequests = [],
        documents = [],
        metrics = {},
    } = unitOverview;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Sparkles, badge: null },
        { id: 'leases', label: 'Tenant & Leases', icon: Users, badge: leases.length },
        { 
            id: 'billing', 
            label: 'Billing', 
            icon: Receipt, 
            badge: metrics.outstandingBalance > 0 ? `$${metrics.outstandingBalance.toLocaleString()}` : null,
            badgeColor: 'bg-rose-100 text-rose-700'
        },
        { 
            id: 'maintenance', 
            label: 'Maintenance', 
            icon: Wrench, 
            badge: metrics.openMaintenanceCount > 0 ? metrics.openMaintenanceCount : null,
            badgeColor: 'bg-amber-100 text-amber-700'
        },
        { id: 'docs', label: 'Docs', icon: Folder, badge: documents.length },
    ];

    const getStatusBadge = (st) => {
        switch (st) {
            case 'OCCUPIED':
                return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'VACANT':
                return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'UNDER_MAINTENANCE':
                return 'bg-rose-50 text-rose-800 border-rose-200';
            case 'RESERVED':
                return 'bg-purple-50 text-purple-800 border-purple-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getMaintenanceStatusBadge = (st) => {
        switch (st) {
            case 'COMPLETED':
            case 'CLOSED':
                return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
            case 'IN_PROGRESS':
                return 'bg-sky-50 text-sky-800 border border-sky-200';
            case 'REVIEWED':
                return 'bg-indigo-50 text-indigo-800 border border-indigo-200';
            case 'REQUESTED':
            default:
                return 'bg-amber-50 text-amber-800 border border-amber-200';
        }
    };

    const getPriorityBadge = (p) => {
        switch (p) {
            case 'URGENT':
                return 'bg-rose-600 text-white font-bold';
            case 'HIGH':
                return 'bg-amber-500 text-white font-medium';
            case 'MEDIUM':
                return 'bg-sky-100 text-sky-800 font-medium';
            case 'LOW':
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-4">
            {/* SUB-NAVIGATION TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl shrink-0 transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-slate-950 text-white shadow-xs font-bold'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            {tab.badge !== null && (
                                <span
                                    className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${
                                        isActive
                                            ? 'bg-slate-800 text-white'
                                            : tab.badgeColor || 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENT: 1. OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Unit Hero Card */}
                    <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    {property?.name} {unitGroup ? `→ ${unitGroup.name}` : ''}
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{name}</h3>
                            </div>
                            <span
                                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(
                                    status
                                )}`}
                            >
                                {status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                            <div>
                                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Unit Type</span>
                                <span className="font-bold text-slate-800">{unitType?.name || 'Standard Space'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Currency / Grace</span>
                                <span className="font-bold text-slate-800">
                                    {property?.currency || 'USD'} ({property?.defaultGraceDays || 5} days)
                                </span>
                            </div>
                        </div>

                        {description && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Operational KPI Counters (Interactive with 1-click page deep-links) */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div
                            onClick={() => navigate(`/finance?search=${encodeURIComponent(name)}`)}
                            className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl space-y-1 cursor-pointer transition-all shadow-xs group"
                            title="Click to open Finance Workspace"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Outstanding Due
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <p
                                className={`text-base font-extrabold ${
                                    metrics.outstandingBalance > 0 ? 'text-rose-600' : 'text-slate-900'
                                }`}
                            >
                                ${metrics.outstandingBalance?.toLocaleString() || 0}
                            </p>
                            <span className="text-[10px] text-slate-500 block">
                                ${metrics.totalPaid?.toLocaleString() || 0} collected • <span className="text-slate-700 font-bold underline">Open Billing →</span>
                            </span>
                        </div>

                        <div
                            onClick={() => navigate(`/maintenance?search=${encodeURIComponent(name)}`)}
                            className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl space-y-1 cursor-pointer transition-all shadow-xs group"
                            title="Click to open Maintenance Workspace"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Maintenance
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <p
                                className={`text-base font-extrabold ${
                                    metrics.openMaintenanceCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                                }`}
                            >
                                {metrics.openMaintenanceCount > 0
                                    ? `${metrics.openMaintenanceCount} Open Ticket${metrics.openMaintenanceCount > 1 ? 's' : ''}`
                                    : 'All Clear 🟢'}
                            </p>
                            <span className="text-[10px] text-slate-500 block">
                                {maintenanceRequests.length} total • <span className="text-slate-700 font-bold underline">Open Hub →</span>
                            </span>
                        </div>
                    </div>

                    {/* Active Tenant Summary Card */}
                    {activeLease ? (
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Occupant
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                    ${Number(activeLease.rentAmount).toLocaleString()}/mo
                                </span>
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs">
                                        {(activeLease.tenant?.firstName || activeLease.tenant?.businessName || 'T')[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900">
                                            {activeLease.tenant?.tenantType === 'BUSINESS'
                                                ? activeLease.tenant?.businessName
                                                : `${activeLease.tenant?.firstName || ''} ${activeLease.tenant?.lastName || ''}`}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 font-mono">{activeLease.tenant?.email}</p>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                                    {activeLease.tenant?.tenantType || 'INDIVIDUAL'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{activeLease.tenant?.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Until {new Date(activeLease.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/tenants?search=${encodeURIComponent(activeLease.tenant?.email || name)}`)}
                                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <span>Inspect Tenant Profile in Directory</span>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-center space-y-2">
                            <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                            <div>
                                <p className="text-xs font-bold text-amber-900">Unit is Currently Vacant</p>
                                <p className="text-[11px] text-amber-700">No active lease contract is assigned to this space.</p>
                            </div>
                            <button
                                onClick={() => navigate(`/tenants?tab=leases`)}
                                className="mt-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            >
                                + Draft Lease for this Space
                            </button>
                        </div>
                    )}

                    {/* Quick Operations Direct Navigation Links */}
                    <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Direct Workspace Deep-Links
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => navigate(`/tenants?search=${encodeURIComponent(name)}`)}
                                className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-xs"
                            >
                                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-600" /> Leases Hub</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>
                            <button
                                onClick={() => navigate(`/finance?search=${encodeURIComponent(name)}`)}
                                className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-xs"
                            >
                                <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-slate-600" /> Billing Hub</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>
                            <button
                                onClick={() => navigate(`/maintenance?search=${encodeURIComponent(name)}`)}
                                className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-xs"
                            >
                                <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-slate-600" /> Work Orders</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>
                            <button
                                onClick={() => navigate(`/documents?search=${encodeURIComponent(name)}`)}
                                className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-xs"
                            >
                                <span className="flex items-center gap-1.5"><Folder className="w-3.5 h-3.5 text-slate-600" /> Documents</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 2. TENANT & LEASES */}
            {activeTab === 'leases' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Leases History ({leases.length})
                        </h4>
                        <button
                            onClick={() => navigate(`/tenants?tab=leases&search=${encodeURIComponent(name)}`)}
                            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            Open in Leases Hub <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>

                    {leases.length === 0 ? (
                        <div className="p-6 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 italic">
                            No lease history recorded for this unit.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leases.map((lease) => {
                                const isActive = lease.status === 'ACTIVE';
                                const tenantName =
                                    lease.tenant?.tenantType === 'BUSINESS'
                                        ? lease.tenant?.businessName
                                        : `${lease.tenant?.firstName || ''} ${lease.tenant?.lastName || ''}`;

                                return (
                                    <div
                                        key={lease.id}
                                        onClick={() => navigate(`/tenants?search=${encodeURIComponent(lease.tenant?.email || tenantName)}`)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-xs group ${
                                            isActive
                                                ? 'bg-white border-slate-300 shadow-xs'
                                                : 'bg-white border-slate-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900 group-hover:underline">{tenantName}</span>
                                                    <span
                                                        className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase border ${
                                                            isActive
                                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}
                                                    >
                                                        {lease.status}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500">{lease.tenant?.email} • {lease.tenant?.phone}</p>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900">
                                                ${Number(lease.rentAmount).toLocaleString()}/mo
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <div>
                                                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Period</span>
                                                <span>
                                                    {new Date(lease.startDate).toLocaleDateString()} → {new Date(lease.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Security Deposit</span>
                                                <span>${Number(lease.securityDeposit || 0).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <span className="text-[11px] font-bold text-slate-800 group-hover:underline flex items-center gap-1">
                                                Inspect in Tenants Workspace <ArrowRight className="w-3 h-3 text-slate-500" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: 3. BILLING & INVOICES */}
            {activeTab === 'billing' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center shadow-xs">
                        <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                                Total Outstanding
                            </span>
                            <p className="text-xl font-extrabold text-slate-900">${metrics.outstandingBalance?.toLocaleString() || 0}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                                Invoiced vs Paid
                            </span>
                            <p className="text-xs font-bold text-emerald-600">
                                ${metrics.totalPaid?.toLocaleString() || 0} / ${metrics.totalInvoiced?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                            Unit Invoices ({leases.flatMap((l) => l.invoices || []).length})
                        </span>
                        <button
                            onClick={() => navigate(`/finance?search=${encodeURIComponent(name)}`)}
                            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            Open in Billing Engine <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {leases.flatMap((l) => l.invoices || []).length === 0 ? (
                            <div className="p-6 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 italic">
                                No invoices generated yet for this unit.
                            </div>
                        ) : (
                            leases
                                .flatMap((l) => l.invoices || [])
                                .map((inv) => (
                                    <div
                                        key={inv.id}
                                        onClick={() => navigate(`/finance?search=${encodeURIComponent(inv.invoiceNumber)}`)}
                                        className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all space-y-2 cursor-pointer shadow-xs group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900 group-hover:underline font-mono">
                                                        #{inv.invoiceNumber}
                                                    </span>
                                                    <span
                                                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                                                            inv.status === 'PAID'
                                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                : inv.status === 'OVERDUE'
                                                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                                                : 'bg-amber-50 text-amber-800 border-amber-200'
                                                        }`}
                                                    >
                                                        {inv.status}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Issued: {new Date(inv.issueDate).toLocaleDateString()} • Due: {new Date(inv.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p className="text-sm font-extrabold text-slate-900">
                                                ${Number(inv.totalAmount).toLocaleString()}
                                            </p>
                                        </div>

                                        {inv.items && inv.items.length > 0 && (
                                            <div className="pt-2 border-t border-slate-100 space-y-1">
                                                {inv.items.map((item) => (
                                                    <div key={item.id} className="flex justify-between text-[11px] text-slate-600">
                                                        <span>• {item.chargeType?.name || item.description}</span>
                                                        <span className="font-semibold text-slate-800">${Number(item.amount).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-2 flex justify-end border-t border-slate-100">
                                            <span className="text-[11px] font-bold text-slate-800 group-hover:underline flex items-center gap-1">
                                                Inspect in Finance Workspace <ArrowRight className="w-3 h-3 text-slate-500" />
                                            </span>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 4. MAINTENANCE */}
            {activeTab === 'maintenance' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Work Orders ({maintenanceRequests.length})
                        </h4>
                        <button
                            onClick={() => navigate(`/maintenance?search=${encodeURIComponent(name)}`)}
                            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            Open in Maintenance Hub <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>

                    {maintenanceRequests.length === 0 ? (
                        <div className="p-6 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 italic">
                            No maintenance requests logged for this unit.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {maintenanceRequests.map((req) => (
                                <div
                                    key={req.id}
                                    onClick={() => navigate(`/maintenance?search=${encodeURIComponent(req.title)}`)}
                                    className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all space-y-2.5 cursor-pointer shadow-xs group"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`px-2 py-0.5 text-[9px] rounded-md ${getPriorityBadge(req.priority)}`}>
                                                    {req.priority}
                                                </span>
                                                <h5 className="text-xs font-bold text-slate-900 group-hover:underline">{req.title}</h5>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                Category: {req.category} • Logged on {new Date(req.requestedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full shrink-0 ${getMaintenanceStatusBadge(
                                                req.status
                                            )}`}
                                        >
                                            {req.status}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                                        {req.problemDescription}
                                    </p>

                                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                                        <span>
                                            Assigned: {req.assignedTo ? `${req.assignedTo.firstName} ${req.assignedTo.lastName}` : 'Unassigned'}
                                        </span>
                                        <span className="font-bold text-slate-800 group-hover:underline flex items-center gap-1">
                                            Inspect in Work Orders <ArrowRight className="w-3 h-3 text-slate-500" />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: 5. DOCUMENTS & NOTICES */}
            {activeTab === 'docs' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Attached Documents ({documents.length})
                        </h4>
                        <button
                            onClick={() => navigate(`/documents?search=${encodeURIComponent(name)}`)}
                            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            Open in Documents Vault <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    </div>

                    {documents.length === 0 ? (
                        <div className="p-6 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 italic">
                            No files or agreements attached yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => navigate(`/documents?search=${encodeURIComponent(name)}`)}
                                    className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between transition-all cursor-pointer group shadow-xs"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="p-2 bg-slate-100 text-slate-700 rounded-lg shrink-0">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-xs font-bold text-slate-800 truncate group-hover:underline">{doc.fileName}</p>
                                            <p className="text-[10px] text-slate-400">
                                                {doc.category || 'General'} • {Math.round((doc.fileSize || 0) / 1024)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                                        title="Download File"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
