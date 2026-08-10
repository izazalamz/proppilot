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

    const summaryStats = [
        { label: 'Total Tenants', value: tenants.length },
        { label: 'Active Leases', value: leases.filter((l) => l.status === 'ACTIVE').length },
        { label: 'Pending Drafts', value: leases.filter((l) => l.status === 'DRAFT').length },
        { label: 'Total Monthly Rent', value: `$${leases.filter((l) => l.status === 'ACTIVE').reduce((sum, l) => sum + Number(l.rentAmount), 0).toLocaleString()}` },
    ];

    return (
        <div className="flex h-[calc(100vh-5rem)] overflow-hidden -m-6">
            {/* MAIN WORKSPACE AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 p-6 overflow-y-auto space-y-6">

                {/* WORKSPACE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Tenants & Leases Workspace</h3>
                        <p className="text-sm text-slate-500">Manage occupants, rental contracts, and space assignments</p>
                    </div>

                    {activeTab !== 'tree' && (
                        <button
                            onClick={() => setShowInlineForm(!showInlineForm)}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all shrink-0"
                        >
                            {showInlineForm ? <ChevronDown className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showInlineForm ? 'Cancel' : activeTab === 'tenants' ? '+ Add Tenant' : '+ Draft Lease'}
                        </button>
                    )}
                </div>

                {/* CONTEXTUAL INLINE CREATION PANEL */}
                {showInlineForm && activeTab !== 'tree' && (
                    <div className="bg-white border border-sky-200 rounded-2xl p-6 shadow-md animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
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
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Government ID</label>
                                        <input
                                            type="text"
                                            value={tenantForm.governmentId}
                                            onChange={(e) => setTenantForm({ ...tenantForm, governmentId: e.target.value })}
                                            placeholder="ID-992031"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowInlineForm(false)}
                                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                                    >
                                        Discard
                                    </button>
                                    <button type="submit" className="px-5 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm">
                                        Save Tenant Profile
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleCreateLease} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tenant Party</label>
                                        <select
                                            required
                                            value={leaseForm.tenantId}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, tenantId: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="">-- Select Tenant --</option>
                                            {tenants.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.tenantType === 'BUSINESS' ? t.businessName : `${t.firstName} ${t.lastName}`} ({t.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Space (Property → Group → Unit)</label>
                                        <select
                                            required
                                            value={leaseForm.unitId}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, unitId: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="">-- Select Space --</option>
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
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={leaseForm.endDate}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, endDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Security Deposit ($)</label>
                                        <input
                                            type="number"
                                            value={leaseForm.securityDeposit}
                                            onChange={(e) => setLeaseForm({ ...leaseForm, securityDeposit: e.target.value })}
                                            placeholder="3600"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowInlineForm(false)}
                                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                                    >
                                        Discard
                                    </button>
                                    <button type="submit" className="px-5 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm">
                                        Activate Lease Agreement
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* LEVEL 2 TAB NAVIGATION (3 Sub-Tabs) */}
                <div className="border-b border-slate-200 flex gap-8 overflow-x-auto">
                    <button
                        onClick={() => {
                            setActiveTab('tenants');
                            setShowInlineForm(false);
                        }}
                        className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'tenants' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Users className="w-4 h-4" /> Tenants Directory
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('leases');
                            setShowInlineForm(false);
                        }}
                        className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'leases' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <FileText className="w-4 h-4" /> Lease Agreements
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('tree');
                            setShowInlineForm(false);
                        }}
                        className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'tree' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Building2 className="w-4 h-4" /> Property Occupancy Hierarchy
                    </button>
                </div>

                {/* SUB-TAB 1: TENANTS DIRECTORY */}
                {activeTab === 'tenants' && (
                    <div className="space-y-4">
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="relative w-full md:w-72">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search tenants..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 w-full md:w-auto">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-500 uppercase">Group By:</span>
                                <select
                                    value={groupByMode}
                                    onChange={(e) => setGroupByMode(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 cursor-pointer"
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
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left text-xs text-slate-600">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="p-3.5">Tenant Name / Party</th>
                                            <th className="p-3.5">Contact Email</th>
                                            <th className="p-3.5">Phone</th>
                                            <th className="p-3.5">Leased Space (Property → Group → Unit)</th>
                                            <th className="p-3.5 text-right">Inspect</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredTenants.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                                                    No tenants found matching criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            getGroupedTenants().map((section) => (
                                                <React.Fragment key={section.key}>
                                                    {section.title && (
                                                        <tr className="bg-slate-100/80 border-y border-slate-200">
                                                            <td colSpan={5} className="py-2 px-3.5 font-bold text-slate-700 uppercase tracking-wide text-[11px]">
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
                                                                className={`hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-sky-50/50 font-medium' : ''
                                                                    }`}
                                                            >
                                                                <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                                                                    {tenant.tenantType === 'BUSINESS' ? (
                                                                        <Briefcase className="w-4 h-4 text-sky-600 shrink-0" />
                                                                    ) : (
                                                                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                                                                    )}
                                                                    {fullName}
                                                                </td>
                                                                <td className="p-3.5 text-slate-600">{tenant.email}</td>
                                                                <td className="p-3.5 text-slate-600">{tenant.phone}</td>
                                                                <td className="p-3.5 text-slate-700 font-medium">
                                                                    {formatSpaceBreadcrumb(activeLease?.unit)}
                                                                </td>
                                                                <td className="p-3.5 text-right font-medium text-sky-600">Inspect →</td>
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
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="relative w-full md:w-72">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search leases..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
                                <select
                                    value={leaseStatusFilter}
                                    onChange={(e) => setLeaseStatusFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 cursor-pointer"
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
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left text-xs text-slate-600">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="p-3.5">Tenant Party</th>
                                            <th className="p-3.5">Assigned Space (Property → Group → Unit)</th>
                                            <th className="p-3.5">Monthly Rent</th>
                                            <th className="p-3.5">Duration</th>
                                            <th className="p-3.5">Status</th>
                                            <th className="p-3.5 text-right">Inspect</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredLeases.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-6 text-center text-slate-400 italic">
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
                                                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-sky-50/50 font-medium' : ''
                                                            }`}
                                                    >
                                                        <td className="p-3.5 font-bold text-slate-800">{tenantName}</td>
                                                        <td className="p-3.5 text-slate-700 font-medium">
                                                            {formatSpaceBreadcrumb(lease.unit)}
                                                        </td>
                                                        <td className="p-3.5 font-bold text-emerald-600">
                                                            ${Number(lease.rentAmount).toLocaleString()}/mo
                                                        </td>
                                                        <td className="p-3.5 text-slate-500">
                                                            {new Date(lease.startDate).toLocaleDateString()} → {new Date(lease.endDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-3.5">
                                                            <span
                                                                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${lease.status === 'ACTIVE'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : lease.status === 'DRAFT'
                                                                        ? 'bg-amber-100 text-amber-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                    }`}
                                                            >
                                                                {lease.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3.5 text-right font-medium text-sky-600">Inspect →</td>
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
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Assigned Space Hierarchy</span>
                            <p className="text-xs font-bold text-sky-700">{formatSpaceBreadcrumb(selectedItem.data.unit)}</p>
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

                        {/* ACTION BUTTON: MOVE TO LEASE AGREEMENTS FOR UNIT HISTORY */}
                        <button
                            onClick={() => {
                                navigate(`/tenants?tab=leases&search=${encodeURIComponent(selectedItem.data.name)}`);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                        >
                            <span>View Lease History for {selectedItem.data.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </PersistentDrawer>
        </div>
    );
}