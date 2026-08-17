import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PersistentDrawer from '../components/common/PersistentDrawer';
import TableSkeleton from '../components/common/TableSkeleton';

import {
    LayoutDashboard,
    TrendingUp,
    Building2,
    Users,
    Receipt,
    Wrench,
    FolderArchive,
    ArrowUpRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign,
    Calendar,
    ChevronRight,
    Sparkles,
    ShieldAlert,
    CreditCard,
    Plus,
    Activity,
    PieChart,
    BarChart3,
    Layers,
    UserCheck,
} from 'lucide-react';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Persistent Right Drawer
    const [selectedItem, setSelectedItem] = useState(null); // { type: 'PAYMENT' | 'EXPIRATION' | 'MAINTENANCE', data: {...} }
    const [isEditing, setIsEditing] = useState(false);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.get('/analytics/overview');
            setAnalytics(res.data.data);
        } catch (err) {
            console.error('Failed to load dashboard analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading || !analytics) {
        return (
            <div className="p-8 space-y-6">
                <TableSkeleton rows={6} cols={4} />
            </div>
        );
    }

    const { financials, occupancy, leases, maintenance, recentActivity } = analytics;

    const summaryStats = [
        { label: 'Occupancy Rate', value: `${occupancy.occupancyRate}%` },
        { label: 'Total Units', value: occupancy.totalUnits },
        { label: 'Collection Rate', value: `${financials.collectionRate}%` },
        { label: 'Total Invoiced', value: `$${financials.totalInvoiced?.toLocaleString()}` },
        { label: 'Urgent Tickets', value: maintenance.urgentTickets },
        { label: 'Active Leases', value: leases.totalActiveLeases },
    ];

    // Find max value in monthly revenue trend for proportional scaling in the custom chart
    const maxMonthlyRevenue = Math.max(
        ...financials.monthlyRevenueTrend.map((m) => Math.max(m.invoiced, m.collected)),
        5000
    );

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">

                {/* MAIN COMMAND CENTER */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* LEVEL 1 COMMAND CENTER HEADER */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-slate-900 shadow-xs">

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-500" /> Real-Time Command Deck
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Executive Portfolio Analytics</h2>
                            <p className="text-xs text-slate-500">
                                Unified operational visibility across revenue collection, occupancy health, lease renewals, and maintenance dispatch.
                            </p>
                        </div>

                        {/* Quick Action Shortcuts */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => navigate('/properties')}
                                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Building2 className="w-3.5 h-3.5 text-slate-700" /> Space Hub
                            </button>
                            <button
                                onClick={() => navigate('/finance')}
                                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Receipt className="w-3.5 h-3.5 text-slate-700" /> Billing
                            </button>
                            <button
                                onClick={() => navigate('/maintenance')}
                                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Wrench className="w-3.5 h-3.5" /> Work Orders
                            </button>
                        </div>
                    </div>


                    {/* TOP 4 KPI COMMAND DECK */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* KPI 1: FINANCIAL COLLECTION */}
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Collected</span>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                            </div>

                            <div>
                                <p className="text-2xl font-extrabold text-slate-900">
                                    ${financials.totalCollected?.toLocaleString()}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                    <span>Invoiced: ${financials.totalInvoiced?.toLocaleString()}</span>
                                    <span className="font-bold text-emerald-600">{financials.collectionRate}%</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(financials.collectionRate, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* KPI 2: OCCUPANCY HEALTH */}
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portfolio Occupancy</span>
                                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                                    <Building2 className="w-4 h-4" />
                                </div>
                            </div>

                            <div>
                                <p className="text-2xl font-extrabold text-slate-900">
                                    {occupancy.occupancyRate}%
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                    <span>{occupancy.occupiedUnits} Occupied</span>
                                    <span>{occupancy.vacantUnits} Vacant</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(occupancy.occupancyRate, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* KPI 3: ACTIVE LEASES */}
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Tenant Leases</span>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>

                            <div>
                                <p className="text-2xl font-extrabold text-slate-900">
                                    {leases.totalActiveLeases}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                    <span>{leases.upcomingExpirations.length} Expiring in 90d</span>
                                    <span className="font-semibold text-indigo-600">{occupancy.totalProperties} Properties</span>
                                </div>
                            </div>

                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${occupancy.totalUnits > 0 ? (leases.totalActiveLeases / occupancy.totalUnits) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* KPI 4: MAINTENANCE DISPATCH */}
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maintenance Queue</span>
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                    <Wrench className="w-4 h-4" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-extrabold text-slate-900">{maintenance.totalTickets}</p>
                                    {maintenance.urgentTickets > 0 && (
                                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-100 text-rose-800 rounded-full animate-pulse">
                                            {maintenance.urgentTickets} Urgent
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                    <span>{maintenance.inProgressTickets} In Progress</span>
                                    <span className="text-emerald-600 font-semibold">{maintenance.completedTickets} Resolved</span>
                                </div>
                            </div>

                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${maintenance.totalTickets > 0 ? (maintenance.completedTickets / maintenance.totalTickets) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LEVEL 2 VISUALIZATIONS: 6-MONTH REVENUE TREND & PROPERTY OCCUPANCY */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* CHART A: 6-MONTH REVENUE BAR VISUALIZER */}
                        <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-sky-600" /> 6-Month Invoiced vs. Collected Revenue
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Historical cash flow comparison across portfolio billing cycles.</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-sky-400 inline-block" />
                                        <span className="text-slate-600">Invoiced</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
                                        <span className="text-slate-600">Collected</span>
                                    </div>
                                </div>
                            </div>

                            {/* Custom SVG/CSS Multi-Bar Visualizer */}
                            <div className="pt-6 pb-2 grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 border-b border-slate-100">
                                {financials.monthlyRevenueTrend.map((m, idx) => {
                                    const invoicedHeight = maxMonthlyRevenue > 0 ? (m.invoiced / maxMonthlyRevenue) * 100 : 0;
                                    const collectedHeight = maxMonthlyRevenue > 0 ? (m.collected / maxMonthlyRevenue) * 100 : 0;

                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group relative">
                                            {/* Tooltip on Hover */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-10">
                                                Invoiced: ${m.invoiced} | Paid: ${m.collected}
                                            </div>

                                            <div className="w-full flex items-end justify-center gap-1 h-36">
                                                {/* Invoiced Bar */}
                                                <div
                                                    style={{ height: `${Math.max(invoicedHeight, 4)}%` }}
                                                    className="w-3 sm:w-5 bg-sky-300 rounded-t-md group-hover:bg-sky-400 transition-all"
                                                />
                                                {/* Collected Bar */}
                                                <div
                                                    style={{ height: `${Math.max(collectedHeight, 4)}%` }}
                                                    className="w-3 sm:w-5 bg-emerald-500 rounded-t-md group-hover:bg-emerald-600 transition-all"
                                                />
                                            </div>

                                            <span className="text-[11px] font-bold text-slate-500">{m.month}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                                <span>Total Invoiced: ${financials.totalInvoiced?.toLocaleString()}</span>
                                <span className="font-bold text-emerald-600">
                                    Overall Collection Rate: {financials.collectionRate}%
                                </span>
                            </div>
                        </div>

                        {/* CHART B: PROPERTY OCCUPANCY BREAKDOWN */}
                        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-indigo-600" /> Space Breakdown
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Occupancy density by property.</p>
                            </div>

                            <div className="space-y-4">
                                {occupancy.propertyOccupancyBreakdown.map((p) => (
                                    <div key={p.propertyId} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-800">{p.propertyName}</span>
                                            <span className="font-extrabold text-sky-600">{p.occupancyRate}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${p.occupancyRate}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                            <span>{p.occupiedUnits} of {p.totalUnits} Units Occupied</span>
                                            <span>{p.city}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                                <span className="font-semibold">Portfolio Capacity</span>
                                <span className="font-bold">{occupancy.totalUnits} Total Registered Spaces</span>
                            </div>
                        </div>
                    </div>

                    {/* LEVEL 2 OPERATIONAL WORKSTREAMS: 3 ACTION CARDS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* STREAM 1: UPCOMING LEASE EXPIRATIONS */}
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-500" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                        Lease Expirations (90d)
                                    </h4>
                                </div>
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                                    {leases.upcomingExpirations.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {leases.upcomingExpirations.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-400 italic">
                                        No active leases expiring in the next 90 days.
                                    </div>
                                ) : (
                                    leases.upcomingExpirations.map((l) => (
                                        <div
                                            key={l.id}
                                            onClick={() => setSelectedItem({ type: 'EXPIRATION', data: l })}
                                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer space-y-1.5"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">{l.tenantName}</p>
                                                    <span className="text-[10px] text-slate-500">
                                                        {l.propertyName} • {l.unitName}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                                                        l.isUrgent
                                                            ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                    }`}
                                                >
                                                    {l.daysLeft}d left
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                                                <span>Rent: ${l.rentAmount}/mo</span>
                                                <span>Ends: {new Date(l.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/tenants')}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Manage All Leases →
                            </button>
                        </div>

                        {/* STREAM 2: URGENT MAINTENANCE DISPATCH QUEUE */}
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-rose-500" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                        Urgent Dispatch Queue
                                    </h4>
                                </div>
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                                    {maintenance.actionQueue.length} Active
                                </span>
                            </div>

                            <div className="space-y-3">
                                {maintenance.actionQueue.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-400 italic">
                                        All work orders resolved and clear.
                                    </div>
                                ) : (
                                    maintenance.actionQueue.map((m) => (
                                        <div
                                            key={m.id}
                                            onClick={() => setSelectedItem({ type: 'MAINTENANCE', data: m })}
                                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer space-y-1.5"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{m.title}</p>
                                                    <span className="text-[10px] text-slate-500">
                                                        {m.property?.name} • {m.unit?.name || 'Common Area'}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                                                        m.priority === 'URGENT'
                                                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                                                    }`}
                                                >
                                                    {m.priority}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                                                <span>Status: {m.status}</span>
                                                <span>
                                                    {m.assignedTo ? `${m.assignedTo.firstName}` : 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/maintenance')}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Open Kanban Board →
                            </button>
                        </div>

                        {/* STREAM 3: RECENT FINANCIAL PAYMENTS FEED */}
                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-emerald-600" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                        Recent Payments Feed
                                    </h4>
                                </div>
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                                    Live
                                </span>
                            </div>

                            <div className="space-y-3">
                                {recentActivity.paymentsFeed.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-400 italic">
                                        No recent payments recorded.
                                    </div>
                                ) : (
                                    recentActivity.paymentsFeed.map((p) => (
                                        <div
                                            key={p.id}
                                            onClick={() => setSelectedItem({ type: 'PAYMENT', data: p })}
                                            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer space-y-1"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-extrabold text-xs text-emerald-600">
                                                    +${p.amount?.toLocaleString()}
                                                </span>
                                                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-white text-slate-600 border border-slate-200">
                                                    {p.paymentMethod}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-slate-500">
                                                <span>{p.tenantName}</span>
                                                <span>{p.unitName}</span>
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-mono truncate">
                                                Ref: {p.transactionReference}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/finance')}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Open Financial Ledger →
                            </button>
                        </div>
                    </div>
                </div>

                {/* LEVEL 3 PERSISTENT DRAWER: ACTIVITY INSPECTOR */}
                <PersistentDrawer
                    selectedItem={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    summaryTitle="Executive Summary"
                    summaryStats={summaryStats}
                    customWidth="w-full sm:w-[440px] lg:w-[440px] xl:w-[480px]"
                >
                    {selectedItem?.type === 'EXPIRATION' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-xs space-y-2">
                                <span className="text-[10px] uppercase font-bold text-amber-100 tracking-wider">
                                    Upcoming Lease Expiration
                                </span>
                                <h3 className="text-base font-bold text-white">{selectedItem.data.tenantName}</h3>
                                <p className="text-xs text-amber-100">
                                    {selectedItem.data.propertyName} • Unit {selectedItem.data.unitName}
                                </p>
                            </div>

                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Days Remaining:</span>
                                    <span className="font-bold text-rose-600">{selectedItem.data.daysLeft} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Monthly Rent:</span>
                                    <span className="font-bold text-slate-900">${selectedItem.data.rentAmount}/mo</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">End Date:</span>
                                    <span className="font-semibold text-slate-700">
                                        {new Date(selectedItem.data.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/tenants')}
                                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                                Open Lease in Tenants Hub →
                            </button>
                        </div>
                    )}

                    {selectedItem?.type === 'MAINTENANCE' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xs space-y-2">
                                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                                    {selectedItem.data.priority} Work Order
                                </span>
                                <h3 className="text-base font-bold text-white">{selectedItem.data.title}</h3>
                                <p className="text-xs text-slate-300">
                                    {selectedItem.data.property?.name} • {selectedItem.data.unit?.name || 'Common Area'}
                                </p>
                            </div>

                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Status:</span>
                                    <span className="font-bold text-slate-900">{selectedItem.data.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Assigned Staff:</span>
                                    <span className="font-semibold text-slate-700">
                                        {selectedItem.data.assignedTo ? selectedItem.data.assignedTo.firstName : 'Unassigned'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/maintenance?ticketId=${selectedItem.data.id}`)}
                                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                                Dispatch in Maintenance Hub →
                            </button>
                        </div>
                    )}

                    {selectedItem?.type === 'PAYMENT' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl shadow-xs space-y-2">
                                <span className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider">
                                    Recorded Payment Receipt
                                </span>
                                <h3 className="text-xl font-bold text-white">+${selectedItem.data.amount}</h3>
                                <p className="text-xs text-emerald-100">
                                    Invoice {selectedItem.data.invoiceNumber}
                                </p>
                            </div>

                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Tenant:</span>
                                    <span className="font-bold text-slate-900">{selectedItem.data.tenantName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Method:</span>
                                    <span className="font-semibold text-slate-700">{selectedItem.data.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Transaction Ref:</span>
                                    <span className="font-mono text-[10px] text-slate-600">{selectedItem.data.transactionReference}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/finance')}
                                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                                View in Finance Ledger →
                            </button>
                        </div>
                    )}
                </PersistentDrawer>
            </div>
        </div>
    );
}
