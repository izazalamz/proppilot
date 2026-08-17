import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PersistentDrawer from '../components/common/PersistentDrawer';
import TableSkeleton from '../components/common/TableSkeleton';

import {
    Users,
    FileText,
    Plus,
    Search,
    ChevronDown,
    ChevronRight,
    X,
    SlidersHorizontal,
    Building2,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    User,
    Tag,
    DoorOpen,
    ArrowRight,
    ExternalLink,
} from 'lucide-react';

export default function TenantsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Level 2 Section Context: 'tenants' | 'leases' | 'tree'
    const [activeTab, setActiveTab] = useState('tenants');
    const [tenants, setTenants] = useState([]);
    const [leases, setLeases] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search Controls
    const [searchTerm, setSearchTerm] = useState('');
    const [groupByMode, setGroupByMode] = useState('none'); // 'none' | 'property' | 'type'
    const [leaseStatusFilter, setLeaseStatusFilter] = useState('ALL');
    const [expandedAccordionId, setExpandedAccordionId] = useState(null);

    // Level 3 Object Context (Persistent Drawer)
    // selectedItem structure: { type: 'TENANT' | 'LEASE' | 'UNIT', data: {...}, activeLease?: {...} }
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [drawerEditForm, setDrawerEditForm] = useState({});

    // Contextual Creation Forms
    const [showInlineForm, setShowInlineForm] = useState(false);
    const [tenantForm, setTenantForm] = useState({
        tenantType: 'INDIVIDUAL',
        firstName: '',
        lastName: '',
        businessName: '',
        email: '',
        phone: '',
        governmentId: '',
        emergencyContact: '',
        notes: '',
    });

    const [leaseForm, setLeaseForm] = useState({
        tenantId: '',
        unitId: '',
        startDate: '',
        endDate: '',
        rentAmount: '',
        securityDeposit: '',
        billingCycle: 'MONTHLY',
        notes: '',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tenantsRes, leasesRes, propsRes] = await Promise.all([
                api.get('/tenants'),
                api.get('/tenants/leases'),
                api.get('/properties'),
            ]);
            setTenants(tenantsRes.data.data || []);
            setLeases(leasesRes.data.data || []);
            setProperties(propsRes.data.data || []);
        } catch (err) {
            console.error('Failed to load tenants/leases workspace data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const searchParam = searchParams.get('search');
        if (tabParam) {
            setActiveTab(tabParam);
        }
        if (searchParam) {
            setSearchTerm(searchParam);
        }
    }, [searchParams]);

    // Helper to format full space hierarchy
    const formatSpaceBreadcrumb = (unit) => {
        if (!unit) return 'Unassigned Space';
        const propName = unit.property?.name || 'Property';
        const groupName = unit.unitGroup?.name;
        const unitName = unit.name;

        return groupName
            ? `${propName} → ${groupName} → ${unitName}`
            : `${propName} → ${unitName} (No Group)`;
    };

    const availableUnits = properties.flatMap((p) =>
        (p.units || []).map((u) => ({ ...u, propertyName: p.name }))
    );

    // Filter to view all leases for a specific unit
    const handleViewAllUnitLeases = (unitName) => {
        navigate(`/tenants?tab=leases&search=${encodeURIComponent(unitName)}`);
    };

    // Form Submissions
    const handleCreateTenant = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tenants', tenantForm);
            setShowInlineForm(false);
            setTenantForm({
                tenantType: 'INDIVIDUAL',
                firstName: '',
                lastName: '',
                businessName: '',
                email: '',
                phone: '',
                governmentId: '',
                emergencyContact: '',
                notes: '',
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create tenant profile.');
        }
    };

    const handleCreateLease = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tenants/leases', {
                ...leaseForm,
                rentAmount: Number(leaseForm.rentAmount),
                securityDeposit: Number(leaseForm.securityDeposit || 0),
            });
            setShowInlineForm(false);
            setLeaseForm({
                tenantId: '',
                unitId: '',
                startDate: '',
                endDate: '',
                rentAmount: '',
                securityDeposit: '',
                billingCycle: 'MONTHLY',
                notes: '',
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create lease agreement.');
        }
    };

    const handleSaveEdit = async () => {
        try {
            if (selectedItem?.type === 'TENANT') {
                await api.put(`/tenants/${selectedItem.data.id}`, drawerEditForm);
            }
            setIsEditing(false);
            fetchData();
            setSelectedItem((prev) => ({ ...prev, data: { ...prev.data, ...drawerEditForm } }));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save changes');
        }
    };

    // Filter Logic
    const filteredTenants = tenants.filter((t) => {
        const name = `${t.firstName || ''} ${t.lastName || ''} ${t.businessName || ''}`.toLowerCase();
        const matchesSearch =
            name.includes(searchTerm.toLowerCase()) ||
            t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.phone.includes(searchTerm);
        return matchesSearch;
    });

    const getGroupedTenants = () => {
        if (groupByMode === 'none') return [{ key: 'all', title: null, items: filteredTenants }];

        const grouped = {};
        filteredTenants.forEach((tenant) => {
            let key = 'Unassigned';
            if (groupByMode === 'type') {
                key = tenant.tenantType === 'BUSINESS' ? '🏢 Business Entities' : '👤 Individual Tenants';
            } else if (groupByMode === 'property') {
                const activeLease = tenant.leases?.find((l) => l.status === 'ACTIVE');
                key = activeLease?.unit?.property?.name || 'No Active Property Lease';
            }

            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(tenant);
        });

        return Object.keys(grouped).map((key) => ({
            key,
            title: key,
            items: grouped[key],
        }));
    };

    const filteredLeases = leases.filter((l) => {
        const tenantName = `${l.tenant?.firstName || ''} ${l.tenant?.lastName || ''} ${l.tenant?.businessName || ''}`.toLowerCase();
        const propertyName = (l.unit?.property?.name || '').toLowerCase();
        const groupName = (l.unit?.unitGroup?.name || '').toLowerCase();
        const unitName = (l.unit?.name || '').toLowerCase();

        const matchesSearch =
            tenantName.includes(searchTerm.toLowerCase()) ||
            propertyName.includes(searchTerm.toLowerCase()) ||
            groupName.includes(searchTerm.toLowerCase()) ||
            unitName.includes(searchTerm.toLowerCase());

        const matchesStatus = leaseStatusFilter === 'ALL' || l.status === leaseStatusFilter;

        return matchesSearch && matchesStatus;
    });

    const activeLeasesCount = leases.filter((l) => l.status === 'ACTIVE').length;
    const contractedMonthlyRent = leases
        .filter((l) => l.status === 'ACTIVE')
        .reduce((acc, l) => acc + Number(l.rentAmount), 0);
    const pendingLeasesCount = leases.filter((l) => l.status === 'PENDING' || l.status === 'EXPIRED').length;

    const summaryStats = [
        { label: 'Total Tenants', value: tenants.length },
        { label: 'Active Leases', value: activeLeasesCount },
        { label: 'Monthly Rent', value: `$${contractedMonthlyRent.toLocaleString()}` },
        { label: 'Pending Leases', value: pendingLeasesCount },
    ];

    return (


        <div className="flex h-full w-full overflow-hidden">
            {/* MAIN WORKSPACE AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">


                {/* LEVEL 1 WORKSPACE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                            <Users className="w-7 h-7 text-sky-600" />
                            Tenants & Leases Workspace
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Manage tenant directory profiles, rental lease contracts, space assignments, and occupancy agreements.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={() => {
                                setActiveTab('tenants');
                                setShowInlineForm(true);
                            }}
                            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                            <Users className="w-4 h-4 text-slate-600" />
                            <span>Add Tenant Profile</span>
                        </button>

                        <button
                            onClick={() => {
                                setActiveTab('leases');
                                setShowInlineForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Draft Lease Agreement</span>
                        </button>

                    </div>
                </div>

                {/* TOP OPERATIONAL KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Tenants</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{tenants.length}</p>
                        <span className="text-[11px] text-slate-500 block">Registered occupant profiles</span>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Active Leases</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">{activeLeasesCount}</p>
                        <span className="text-[11px] text-emerald-700 font-semibold block">Occupied legal contracts</span>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">Monthly Contracted</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-sky-600">${contractedMonthlyRent.toLocaleString()}</p>
                        <span className="text-[11px] text-sky-700 block">Recurring monthly rent</span>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Pending & Expired</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-amber-600">{pendingLeasesCount}</p>
                        <span className="text-[11px] text-amber-700 block">Renewal / review queue</span>
                    </div>
                </div>

                {/* CONTEXTUAL INLINE CREATION PANEL */}
                {showInlineForm && activeTab !== 'tree' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-800" />
                                {activeTab === 'tenants' ? 'Create New Tenant Profile' : 'Draft New Lease Agreement'}
                            </h4>
                            <button type="button" onClick={() => setShowInlineForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {activeTab === 'tenants' ? (
                            <form onSubmit={handleCreateTenant} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tenant Type</label>
                                        <select
                                            value={tenantForm.tenantType}
                                            onChange={(e) => setTenantForm({ ...tenantForm, tenantType: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
                                        >
                                            <option value="INDIVIDUAL">INDIVIDUAL</option>
                                            <option value="BUSINESS">BUSINESS ENTITY</option>
                                        </select>
                                    </div>

                                    {tenantForm.tenantType === 'INDIVIDUAL' ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">First Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={tenantForm.firstName}
                                                    onChange={(e) => setTenantForm({ ...tenantForm, firstName: e.target.value })}
                                                    placeholder="Alex"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={tenantForm.lastName}
                                                    onChange={(e) => setTenantForm({ ...tenantForm, lastName: e.target.value })}
                                                    placeholder="Murphy"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Company / Business Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={tenantForm.businessName}
                                                onChange={(e) => setTenantForm({ ...tenantForm, businessName: e.target.value })}
                                                placeholder="Acme Logistics LLC"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={tenantForm.email}
                                            onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                                            placeholder="alex@example.com"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={tenantForm.phone}
                                            onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                                            placeholder="+1-555-0199"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">National ID / Passport</label>
                                        <input
                                            type="text"
                                            value={tenantForm.nidOrPassport}
                                            onChange={(e) => setTenantForm({ ...tenantForm, nidOrPassport: e.target.value })}
                                            placeholder="NID-992837102"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowInlineForm(false)}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
                                    >
                                        Register Tenant
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleCreateLease} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Occupant Tenant</label>
                                        <select
                                            required
                                            value={leaseForm.tenantId}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, tenantId: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
                                        >
                                            <option value="">-- Choose Resident Profile --</option>
                                            {tenants.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.firstName ? `${t.firstName} ${t.lastName}` : t.businessName} ({t.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Space (Unit)</label>
                                        <select
                                            required
                                            value={leaseForm.unitId}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, unitId: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
                                        >
                                            <option value="">-- Choose Unit --</option>
                                            {availableUnits.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.propertyName} → {u.unitGroup?.name || 'No Group'} → {u.name} ({u.status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={leaseForm.startDate}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, startDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={leaseForm.endDate}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, endDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Monthly Rent ($)</label>
                                        <input
                                            type="number"
                                            required
                                            value={leaseForm.rentAmount}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, rentAmount: e.target.value })}
                                            placeholder="1800"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Security Deposit ($)</label>
                                        <input
                                            type="number"
                                            value={leaseForm.securityDeposit}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, securityDeposit: e.target.value })}
                                            placeholder="3600"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowInlineForm(false)}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
                                    >
                                        Activate Lease Agreement
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* LEVEL 2 TAB NAVIGATION (3 Sub-Tabs) */}
                <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-xs font-bold overflow-x-auto no-scrollbar whitespace-nowrap">

                    <button
                        onClick={() => {
                            setActiveTab('tenants');
                            setShowInlineForm(false);
                        }}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'tenants' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Users className="w-4 h-4" /> Tenants Directory ({tenants.length})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('leases');
                            setShowInlineForm(false);
                        }}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'leases' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <FileText className="w-4 h-4" /> Lease Agreements ({leases.length})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('tree');
                            setShowInlineForm(false);
                        }}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'tree' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Building2 className="w-4 h-4" /> Property Occupancy Hierarchy
                    </button>
                </div>

                {/* SUB-TAB 1: TENANTS DIRECTORY */}
                {activeTab === 'tenants' && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="relative w-full md:w-72">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search tenants..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-xs font-semibold text-slate-500 uppercase">Group By:</span>
                                <select
                                    value={groupByMode}
                                    onChange={(e) => setGroupByMode(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 cursor-pointer"
                                >
                                    <option value="none">Flat List</option>
                                    <option value="property">Group by Property</option>
                                    <option value="type">Group by Tenant Type</option>
                                </select>
                            </div>
                        </div>


                        {loading ? (
                            <TableSkeleton rows={6} cols={5} />
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                                <table className="w-full text-left text-xs text-slate-700">
                                    <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                                        <tr>
                                            <th className="p-4">Tenant Name / Party</th>
                                            <th className="p-4">Contact Email</th>
                                            <th className="p-4">Phone Number</th>
                                            <th className="p-4">Assigned Space (Property → Group → Unit)</th>
                                            <th className="p-4 text-right">Inspect</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredTenants.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                                    No tenants found matching criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            getGroupedTenants().map((section) => (
                                                <React.Fragment key={section.key}>
                                                    {section.title && (
                                                        <tr className="bg-slate-100/70 border-y border-slate-200">
                                                            <td colSpan={5} className="py-2.5 px-4 font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                                                                {section.title} ({section.items.length})
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {section.items.map((tenant) => {
                                                        const isSelected = selectedItem?.data?.id === tenant.id;
                                                        const fullName =
                                                            tenant.tenantType === 'BUSINESS'
                                                                ? tenant.businessName
                                                                : `${tenant.firstName || ''} ${tenant.lastName || ''}`;

                                                        const activeLease = tenant.leases?.find((l) => l.status === 'ACTIVE');

                                                        return (
                                                            <tr
                                                                key={tenant.id}
                                                                onClick={() => {
                                                                    setSelectedItem({ type: 'TENANT', data: tenant });
                                                                    setDrawerEditForm(tenant);
                                                                    setIsEditing(false);
                                                                }}
                                                                className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                                                    isSelected ? 'bg-slate-100/70 font-semibold' : ''
                                                                }`}
                                                            >
                                                                <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                                                        {fullName[0]?.toUpperCase() || 'T'}
                                                                    </div>
                                                                    <div>
                                                                        <span>{fullName}</span>
                                                                        <span className="block text-[10px] font-normal text-slate-400">
                                                                            {tenant.tenantType}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-slate-600 font-mono text-xs">{tenant.email}</td>
                                                                <td className="p-4 text-slate-600">{tenant.phone}</td>
                                                                <td className="p-4 text-slate-800 font-medium">
                                                                    {formatSpaceBreadcrumb(activeLease?.unit)}
                                                                </td>
                                                                <td className="p-4 text-right font-bold text-slate-900 text-xs hover:underline">
                                                                    Inspect 360° →
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* SUB-TAB 2: LEASE AGREEMENTS */}
                {activeTab === 'leases' && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="relative w-full md:w-72">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search leases..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
                                <select
                                    value={leaseStatusFilter}
                                    onChange={(e) => setLeaseStatusFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 cursor-pointer"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="DRAFT">DRAFT</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                    <option value="TERMINATED">TERMINATED</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <TableSkeleton rows={6} cols={6} />
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                                <table className="w-full text-left text-xs text-slate-700">
                                    <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                                        <tr>
                                            <th className="p-4">Tenant Party</th>
                                            <th className="p-4">Assigned Space (Property → Group → Unit)</th>
                                            <th className="p-4">Monthly Rent</th>
                                            <th className="p-4">Duration</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Inspect</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredLeases.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                                                    No lease agreements found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLeases.map((lease) => {
                                                const isSelected = selectedItem?.data?.id === lease.id;
                                                const tenantName =
                                                    lease.tenant?.tenantType === 'BUSINESS'
                                                        ? lease.tenant?.businessName
                                                        : `${lease.tenant?.firstName || ''} ${lease.tenant?.lastName || ''}`;

                                                return (
                                                    <tr
                                                        key={lease.id}
                                                        onClick={() => {
                                                            setSelectedItem({ type: 'LEASE', data: lease });
                                                            setDrawerEditForm(lease);
                                                            setIsEditing(false);
                                                        }}
                                                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                                            isSelected ? 'bg-slate-100/70 font-semibold' : ''
                                                        }`}
                                                    >
                                                        <td className="p-4 font-bold text-slate-900">{tenantName}</td>
                                                        <td className="p-4 text-slate-800 font-medium">
                                                            {formatSpaceBreadcrumb(lease.unit)}
                                                        </td>
                                                        <td className="p-4 font-extrabold text-slate-900">
                                                            ${Number(lease.rentAmount)?.toLocaleString()}
                                                            <span className="text-[10px] font-normal text-slate-400">/mo</span>
                                                        </td>
                                                        <td className="p-4 text-slate-500 font-medium">
                                                            {new Date(lease.startDate).toLocaleDateString()} –{' '}
                                                            {new Date(lease.endDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-4">
                                                            <span
                                                                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                                                                    lease.status === 'ACTIVE'
                                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                        : lease.status === 'DRAFT'
                                                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                                                }`}
                                                            >
                                                                {lease.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right font-bold text-slate-900 text-xs hover:underline">
                                                            Inspect 360° →
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* SUB-TAB 3: PROPERTY OCCUPANCY HIERARCHY ACCORDION */}
                {activeTab === 'tree' && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-800 mb-1">Portfolio Hierarchy & Occupancy Tree</h4>
                            <p className="text-xs text-slate-500">
                                Interactive visual breakdown: Property → Unit Group → Rentable Unit → Active Tenant
                            </p>
                        </div>

                        {loading ? (
                            <TableSkeleton rows={4} cols={1} />
                        ) : (
                            <div className="space-y-3">
                                {properties.map((prop) => {
                                    const isExpanded = expandedAccordionId === prop.id;
                                    const totalUnits = prop.units?.length || 0;
                                    const occupiedCount = prop.units?.filter((u) => u.status === 'OCCUPIED').length || 0;

                                    return (
                                        <div key={prop.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                            <div
                                                onClick={() => setExpandedAccordionId(isExpanded ? null : prop.id)}
                                                className="p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                                                    <Building2 className="w-5 h-5 text-sky-600" />
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800">{prop.name}</h4>
                                                        <p className="text-xs text-slate-500">{prop.address}, {prop.city}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs">
                                                    <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg font-medium text-slate-600">
                                                        Occupancy: {occupiedCount}/{totalUnits} Units
                                                    </span>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="p-4 border-t border-slate-200 space-y-4 bg-white">
                                                    {totalUnits === 0 ? (
                                                        <p className="text-xs text-slate-400 italic">No units registered under this property.</p>
                                                    ) : (
                                                        prop.units.map((unit) => {
                                                            const activeLease = leases.find((l) => l.unitId === unit.id && l.status === 'ACTIVE');
                                                            const tenant = activeLease?.tenant;

                                                            return (
                                                                <div
                                                                    key={unit.id}
                                                                    onClick={() => {
                                                                        setSelectedItem({
                                                                            type: 'UNIT',
                                                                            data: { ...unit, propertyName: prop.name },
                                                                            activeLease,
                                                                        });
                                                                        setIsEditing(false);
                                                                    }}
                                                                    className="ml-6 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-sky-50/40 transition-colors flex items-center justify-between cursor-pointer"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <DoorOpen className="w-4 h-4 text-slate-400" />
                                                                        <div>
                                                                            <span className="text-xs font-bold text-slate-800">{unit.name}</span>
                                                                            {unit.unitGroup && (
                                                                                <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                                                                                    {unit.unitGroup.name}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-4">
                                                                        {tenant ? (
                                                                            <div className="text-right">
                                                                                <span className="text-xs font-bold text-slate-800 block">
                                                                                    {tenant.tenantType === 'BUSINESS' ? tenant.businessName : `${tenant.firstName} ${tenant.lastName}`}
                                                                                </span>
                                                                                <span className="text-[10px] text-emerald-600 font-semibold">
                                                                                    Active Tenant (${Number(activeLease.rentAmount).toLocaleString()}/mo)
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-xs font-semibold text-slate-400">Vacant Space</span>
                                                                        )}
                                                                        <span
                                                                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${unit.status === 'OCCUPIED' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                                                }`}
                                                                        >
                                                                            {unit.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* LEVEL 3: PERSISTENT RIGHT DRAWER */}
            <PersistentDrawer
                selectedItem={selectedItem}
                onClose={() => setSelectedItem(null)}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                onSave={handleSaveEdit}
                summaryTitle="Tenants & Leases Overview"
                summaryStats={summaryStats}
                customWidth="w-full sm:w-[480px] lg:w-[480px] xl:w-[520px]"
                editFormContent={

                    selectedItem?.type === 'TENANT' ? (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    value={drawerEditForm.email || ''}
                                    onChange={(e) => setDrawerEditForm({ ...drawerEditForm, email: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={drawerEditForm.phone || ''}
                                    onChange={(e) => setDrawerEditForm({ ...drawerEditForm, phone: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Notes</label>
                                <textarea
                                    value={drawerEditForm.notes || ''}
                                    onChange={(e) => setDrawerEditForm({ ...drawerEditForm, notes: e.target.value })}
                                    rows={3}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                />
                            </div>
                        </div>
                    ) : null
                }
            >
                {/* VIEW MODE DETAILS: TENANT */}
                {selectedItem?.type === 'TENANT' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tenant Name</span>
                            <p className="text-sm font-bold text-slate-800">
                                {selectedItem.data.tenantType === 'BUSINESS'
                                    ? selectedItem.data.businessName
                                    : `${selectedItem.data.firstName || ''} ${selectedItem.data.lastName || ''}`}
                            </p>
                        </div>

                        {/* If Tenant has Active Lease, Show Interactive Apartment Card */}
                        {(() => {
                            const activeLease = selectedItem.data.leases?.find((l) => l.status === 'ACTIVE');
                            if (!activeLease) return null;
                            const targetUnitId = activeLease.unitId || activeLease.unit?.id;
                            return (
                                <div
                                    onClick={() => {
                                        if (targetUnitId) {
                                            navigate(`/properties?tab=units&unitId=${encodeURIComponent(targetUnitId)}`);
                                        }
                                    }}
                                    className="group p-3.5 bg-gradient-to-br from-sky-50/80 to-sky-100/50 hover:from-sky-100 hover:to-sky-200/60 border border-sky-200 rounded-2xl space-y-2 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-sky-600" />
                                            Active Leased Apartment
                                        </span>
                                        <span className="text-[10px] font-bold text-sky-700 bg-white/90 group-hover:bg-white px-2 py-0.5 rounded-full border border-sky-200 flex items-center gap-1 shadow-2xs">
                                            Properties <ExternalLink className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-sky-900 transition-colors">
                                        {formatSpaceBreadcrumb(activeLease.unit)}
                                    </p>
                                    <div className="flex items-center justify-between text-[11px] text-sky-700/80 pt-1 border-t border-sky-200/60">
                                        <span>Rent: ${Number(activeLease.rentAmount).toLocaleString()}/mo</span>
                                        <span className="font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                            Go to Apartment →
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email</span>
                                <p className="text-xs font-semibold text-slate-700 truncate">{selectedItem.data.email}</p>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phone</span>
                                <p className="text-xs font-semibold text-slate-700">{selectedItem.data.phone}</p>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Emergency Contact</span>
                            <p className="text-xs font-medium text-slate-700">{selectedItem.data.emergencyContact || 'None provided'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Internal Notes</span>
                            <p className="text-xs text-slate-600 italic">{selectedItem.data.notes || 'No notes on record.'}</p>
                        </div>
                    </div>
                )}

                {/* VIEW MODE DETAILS: LEASE */}
                {selectedItem?.type === 'LEASE' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Assigned Tenant</span>
                            <p className="text-sm font-bold text-slate-800">
                                {selectedItem.data.tenant?.tenantType === 'BUSINESS'
                                    ? selectedItem.data.tenant?.businessName
                                    : `${selectedItem.data.tenant?.firstName || ''} ${selectedItem.data.tenant?.lastName || ''}`}
                            </p>
                            <p className="text-xs text-slate-500">{selectedItem.data.tenant?.email}</p>
                        </div>

                        {/* INTERACTIVE APARTMENT / ASSIGNED SPACE HIERARCHY CARD */}
                        <div
                            onClick={() => {
                                const targetUnitId = selectedItem.data.unitId || selectedItem.data.unit?.id;
                                if (targetUnitId) {
                                    navigate(`/properties?tab=units&unitId=${encodeURIComponent(targetUnitId)}`);
                                }
                            }}
                            className="group p-3.5 bg-gradient-to-br from-sky-50/80 to-sky-100/50 hover:from-sky-100 hover:to-sky-200/60 border border-sky-200 rounded-2xl space-y-2 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                                    Assigned Space Hierarchy
                                </span>
                                <span className="text-[10px] font-bold text-sky-700 bg-white/90 group-hover:bg-white px-2 py-0.5 rounded-full border border-sky-200 flex items-center gap-1 shadow-2xs">
                                    Properties <ExternalLink className="w-3 h-3" />
                                </span>
                            </div>

                            <p className="text-sm font-extrabold text-slate-900 group-hover:text-sky-900 transition-colors">
                                {formatSpaceBreadcrumb(selectedItem.data.unit)}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-sky-700/80 pt-1 border-t border-sky-200/60">
                                <span>Unit ID: {selectedItem.data.unit?.id?.slice(0, 8)}...</span>
                                <span className="font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                    Inspect Apartment →
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Monthly Rent</span>
                                <p className="text-xs font-bold text-emerald-600">${Number(selectedItem.data.rentAmount).toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Security Deposit</span>
                                <p className="text-xs font-bold text-slate-700">${Number(selectedItem.data.securityDeposit).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contract Duration</span>
                            <p className="text-xs font-medium text-slate-700">
                                {new Date(selectedItem.data.startDate).toLocaleDateString()} → {new Date(selectedItem.data.endDate).toLocaleDateString()}
                            </p>
                        </div>

                        {/* PROMINENT JUMP-TO-APARTMENT ACTION BUTTON */}
                        <button
                            type="button"
                            onClick={() => {
                                const targetUnitId = selectedItem.data.unitId || selectedItem.data.unit?.id;
                                if (targetUnitId) {
                                    navigate(`/properties?tab=units&unitId=${encodeURIComponent(targetUnitId)}`);
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 group"
                        >
                            <Building2 className="w-4 h-4 text-sky-400" />
                            <span>Inspect Apartment in Properties Page</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}


                {/* VIEW MODE DETAILS: UNIT (Clicked from Hierarchy Tree) */}
                {selectedItem?.type === 'UNIT' && (
                    <div className="space-y-4">
                        {/* Unit Identity */}
                        <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">Unit Overview</span>
                            <p className="text-sm font-bold text-slate-800">{selectedItem.data.name}</p>
                            <p className="text-xs text-slate-500">
                                {selectedItem.data.propertyName} {selectedItem.data.unitGroup ? `→ ${selectedItem.data.unitGroup.name}` : ''}
                            </p>
                        </div>

                        {/* Current Tenant & Active Lease Details */}
                        {selectedItem.activeLease ? (
                            <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-3">
                                <div className="flex justify-between items-center border-b border-emerald-100/60 pb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active Lease Contract</span>
                                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-full uppercase">
                                        Active
                                    </span>
                                </div>

                                {/* QUICK VIEW / NAVIGATION TO TENANT DIRECTORY */}
                                <div
                                    onClick={() => {
                                        const tenant = selectedItem.activeLease.tenant;
                                        const query = tenant?.email || tenant?.businessName || tenant?.firstName;
                                        navigate(`/tenants?tab=tenants&search=${encodeURIComponent(query)}`);
                                    }}
                                    className="group p-2.5 bg-white border border-emerald-200/60 rounded-lg hover:border-sky-500 hover:shadow-sm cursor-pointer transition-all"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Current Tenant</span>
                                        <span className="text-[10px] font-bold text-sky-600 group-hover:underline flex items-center gap-1">
                                            Go to Directory <ExternalLink className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 mt-1">
                                        {selectedItem.activeLease.tenant?.tenantType === 'BUSINESS'
                                            ? selectedItem.activeLease.tenant?.businessName
                                            : `${selectedItem.activeLease.tenant?.firstName || ''} ${selectedItem.activeLease.tenant?.lastName || ''}`}
                                    </p>
                                    <p className="text-[11px] text-slate-500">{selectedItem.activeLease.tenant?.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Monthly Rent</span>
                                        <p className="text-xs font-bold text-emerald-600">${Number(selectedItem.activeLease.rentAmount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Deposit</span>
                                        <p className="text-xs font-bold text-slate-700">${Number(selectedItem.activeLease.securityDeposit || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Contract Period</span>
                                    <p className="text-[11px] font-medium text-slate-700">
                                        {new Date(selectedItem.activeLease.startDate).toLocaleDateString()} → {new Date(selectedItem.activeLease.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-center space-y-2">
                                <p className="text-xs font-bold text-amber-800">No Active Lease Contract</p>
                                <p className="text-[11px] text-amber-600">This unit is currently vacant and available for leasing.</p>
                            </div>
                        )}

                        {/* ACTION BUTTON: DIRECT DEEP-LINK TO UNIT 360 OPERATIONAL HUB */}
                        <button
                            onClick={() => {
                                navigate(`/properties?tab=units&unitId=${encodeURIComponent(selectedItem.data.id)}`);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                            <span>Open Unit 360° Command Center</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                )}
            </PersistentDrawer>
        </div>
    );
}