import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PersistentDrawer from '../components/common/PersistentDrawer';
import TableSkeleton from '../components/common/TableSkeleton';
import Unit360Drawer from '../components/properties/Unit360Drawer';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
    Building2,
    Plus,
    DoorOpen,
    MapPin,
    Search,
    ChevronDown,
    ChevronRight,
    Building,
    Layers,
    X,
    Settings,
    Tag,
    Filter,
    Users,
    SlidersHorizontal,
    UserPlus,
    Edit3,
    Calendar,
    FileText,
    Wrench,
    ExternalLink,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';

export default function PropertiesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Level 2 Tab Context: 'portfolio' | 'groups' | 'units'
    const [activeTab, setActiveTab] = useState('portfolio');
    const [properties, setProperties] = useState([]);
    const [leases, setLeases] = useState([]);
    const [loading, setLoading] = useState(true);

    // Unit 360 State
    const [unit360Data, setUnit360Data] = useState(null);
    const [unit360Loading, setUnit360Loading] = useState(false);

    // Active Filters
    const [selectedPropertyFilter, setSelectedPropertyFilter] = useState(null);
    const [selectedGroupFilter, setSelectedGroupFilter] = useState(null);
    const [expandedAccordionId, setExpandedAccordionId] = useState(null);

    // Display & Grouping
    const [groupByMode, setGroupByMode] = useState('none'); // 'none' | 'property' | 'group'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Drawer State
    const [selectedItem, setSelectedItem] = useState(null); // { type: 'PROPERTY'|'UNIT'|'UNIT_GROUP'|'SETTINGS', data: {...} }
    const [drawerTab, setDrawerEditTab] = useState('general'); // 'general' | 'staff' | 'actions'
    const [isEditing, setIsEditing] = useState(false);
    const [drawerEditForm, setDrawerEditForm] = useState({});

    // Inline Creation Panel
    const [showInlineForm, setShowInlineForm] = useState(false);
    const [creationForm, setCreationForm] = useState({
        propertyId: '',
        unitGroupId: '',
        name: '',
        address: '',
        city: '',
        description: '',
    });

    // Staff Assign State (Inside Property Settings Drawer)
    const [showAddStaffForm, setShowAddStaffForm] = useState(false);
    const [staffForm, setStaffForm] = useState({ email: '', role: 'STAFF' });

    // Modals
    const [quickLeaseModal, setQuickLeaseModal] = useState(null); // Lease object or null
    const [addLeaseModal, setAddLeaseModal] = useState(null); // { unitId, propertyId, unitName, propertyName } or null
    const [tenantsList, setTenantsList] = useState([]);
    const [leaseForm, setLeaseForm] = useState({
        tenantId: '',
        startDate: '',
        endDate: '',
        rentAmount: '',
        securityDeposit: '',
        billingCycle: 'MONTHLY',
        notes: '',
    });

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const [propsRes, tenantsRes, leasesRes] = await Promise.all([
                api.get('/properties'),
                api.get('/tenants'),
                api.get('/tenants/leases'),
            ]);
            const data = propsRes.data.data || [];
            setProperties(data);
            setTenantsList(tenantsRes.data.data || []);
            setLeases(leasesRes.data.data || []);
            if (data.length > 0 && !creationForm.propertyId) {
                setCreationForm((prev) => ({ ...prev, propertyId: data[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch properties:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    // Tab Switch
    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setShowInlineForm(false);
        if (tab === 'units') {
            setSelectedPropertyFilter(null);
            setSelectedGroupFilter(null);
        }
    };

    // Form Submissions
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'portfolio') {
                await api.post('/properties', {
                    name: creationForm.name,
                    address: creationForm.address,
                    city: creationForm.city,
                    description: creationForm.description,
                    country: 'USA',
                });
            } else if (activeTab === 'groups') {
                await api.post(`/properties/${creationForm.propertyId}/groups`, {
                    name: creationForm.name,
                    description: creationForm.description,
                });
            } else if (activeTab === 'units') {
                await api.post(`/properties/${creationForm.propertyId}/units`, {
                    name: creationForm.name,
                    unitGroupId: creationForm.unitGroupId || null,
                    description: creationForm.description,
                });
            }
            setShowInlineForm(false);
            setCreationForm({ propertyId: properties[0]?.id || '', unitGroupId: '', name: '', address: '', city: '', description: '' });
            fetchProperties();
        } catch (err) {
            alert(err.response?.data?.error || 'Creation failed');
        }
    };

    const handleSelectUnit = async (unit) => {
        setSelectedItem({ type: 'UNIT', data: unit });
        setDrawerEditForm({
            name: unit.name || '',
            status: unit.status || 'VACANT',
            unitGroupId: unit.unitGroupId || '',
            unitTypeName: unit.unitType?.name || 'Standard',
            description: unit.description || '',
        });
        setIsEditing(false);
        setUnit360Loading(true);

        const propertyId = unit.propertyId || unit.property?.id;
        try {
            const res = await api.get(`/properties/${propertyId}/units/${unit.id}/overview`);
            setUnit360Data(res.data.data);
        } catch (err) {
            console.error('Failed to fetch unit 360 overview:', err);
            const activeLease = leases.find((l) => l.unitId === unit.id && l.status === 'ACTIVE');
            setUnit360Data({
                ...unit,
                activeLease,
                leases: leases.filter((l) => l.unitId === unit.id),
                maintenanceRequests: [],
                documents: [],
                metrics: {
                    totalInvoiced: 0,
                    totalPaid: 0,
                    outstandingBalance: 0,
                    openMaintenanceCount: 0,
                    totalLeasesCount: 0,
                    totalDocumentsCount: 0,
                },
            });
        } finally {
            setUnit360Loading(false);
        }
    };

    // Deep link detection via query params
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const unitIdParam = searchParams.get('unitId');
        if (tabParam && ['portfolio', 'groups', 'units'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
        if (unitIdParam && properties.length > 0) {
            const allUnits = properties.flatMap((p) =>
                (p.units || []).map((u) => ({
                    ...u,
                    propertyName: p.name,
                    propertyId: p.id,
                    groupName: p.unitGroups?.find((g) => g.id === u.unitGroupId)?.name,
                }))
            );
            const targetUnit = allUnits.find((u) => u.id === unitIdParam);
            if (targetUnit && selectedItem?.data?.id !== unitIdParam) {
                handleSelectUnit(targetUnit);
            }
        }
    }, [searchParams, properties]);

    // Save Drawer Edits
    const handleSaveEdit = async () => {
        try {
            if (selectedItem?.type === 'PROPERTY' || selectedItem?.type === 'SETTINGS') {
                await api.put(`/properties/${selectedItem.data.id}`, drawerEditForm);
            } else if (selectedItem?.type === 'UNIT_GROUP') {
                await api.put(`/properties/${selectedItem.data.propertyId}/groups/${selectedItem.data.id}`, drawerEditForm);
            } else if (selectedItem?.type === 'UNIT') {
                const propertyId = selectedItem.data.propertyId || selectedItem.data.property?.id;
                await api.put(`/properties/${propertyId}/units/${selectedItem.data.id}`, drawerEditForm);
                const res = await api.get(`/properties/${propertyId}/units/${selectedItem.data.id}/overview`);
                setUnit360Data(res.data.data);
            }
            setIsEditing(false);
            fetchProperties();
            setSelectedItem((prev) => ({ ...prev, data: { ...prev.data, ...drawerEditForm } }));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save changes');
        }
    };

    // Card & Row Click Interactions
    const handleCardSurfaceClick = (property) => {
        setSelectedItem({ type: 'PROPERTY', data: property });
        setDrawerEditForm(property);
        setIsEditing(false);
    };

    const handleViewPropertyUnitsExplicit = (e, property) => {
        e.stopPropagation();
        setSelectedPropertyFilter(property);
        setSelectedGroupFilter(null);
        setActiveTab('units');
    };

    const handlePropertySettingsClick = (e, property) => {
        e.stopPropagation();
        setSelectedItem({ type: 'SETTINGS', data: property });
        setDrawerEditForm({
            ...property,
            currency: property.currency || 'USD',
            defaultGraceDays: property.defaultGraceDays || 5,
        });
        setDrawerEditTab('general');
        setIsEditing(false);
    };

    const handleUnitGroupRowSurfaceClick = (group, property) => {
        setSelectedItem({ type: 'UNIT_GROUP', data: { ...group, propertyName: property.name, propertyId: property.id } });
        setDrawerEditForm(group);
        setIsEditing(false);
    };

    const handleSeeUnitsInGroupExplicit = (e, property, group) => {
        e.stopPropagation();
        setSelectedPropertyFilter(property);
        setSelectedGroupFilter(group);
        setActiveTab('units');
    };

    const handleAddStaffSubmit = (e) => {
        e.preventDefault();
        alert(`Staff invitation sent to ${staffForm.email} as ${staffForm.role}`);
        setShowAddStaffForm(false);
        setStaffForm({ email: '', role: 'STAFF' });
    };

    const handleDraftLeaseFromDrawerSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tenants/leases', {
                tenantId: leaseForm.tenantId,
                unitId: addLeaseModal.unitId,
                startDate: leaseForm.startDate,
                endDate: leaseForm.endDate,
                rentAmount: Number(leaseForm.rentAmount),
                securityDeposit: Number(leaseForm.securityDeposit || 0),
                billingCycle: leaseForm.billingCycle,
                notes: leaseForm.notes,
            });
            setAddLeaseModal(null);
            setLeaseForm({ tenantId: '', startDate: '', endDate: '', rentAmount: '', securityDeposit: '', billingCycle: 'MONTHLY', notes: '' });
            fetchProperties();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to draft lease.');
        }
    };

    // Flatten all units
    const allUnits = properties.flatMap((p) =>
        (p.units || []).map((u) => ({
            ...u,
            propertyName: p.name,
            propertyId: p.id,
            groupName: u.unitGroup?.name || null,
            unitGroupId: u.unitGroupId || 'unassigned',
        }))
    );

    const filteredUnits = allUnits.filter((u) => {
        const matchesProperty = !selectedPropertyFilter || u.propertyId === selectedPropertyFilter.id;
        const matchesGroup = !selectedGroupFilter || u.unitGroupId === selectedGroupFilter.id;
        const matchesSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.groupName && u.groupName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

        return matchesProperty && matchesGroup && matchesSearch && matchesStatus;
    });

    const getGroupedUnits = () => {
        if (groupByMode === 'none') return [{ key: 'all', title: null, units: filteredUnits }];

        const grouped = {};
        filteredUnits.forEach((unit) => {
            const key = groupByMode === 'property' ? unit.propertyName : unit.groupName || 'Unassigned Units';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(unit);
        });

        return Object.keys(grouped).map((key) => ({
            key,
            title: key,
            units: grouped[key],
        }));
    };

    const totalUnitsCount = allUnits.length;
    const occupiedUnitsCount = allUnits.filter((u) => u.status === 'OCCUPIED').length;
    const vacantUnitsCount = allUnits.filter((u) => u.status === 'VACANT').length;
    const occupancyPercentage = totalUnitsCount > 0 ? Math.round((occupiedUnitsCount / totalUnitsCount) * 100) : 0;

    const summaryStats = [
        { label: 'Total Properties', value: properties.length },
        { label: 'Total Units', value: totalUnitsCount },
        { label: 'Occupied Spaces', value: occupiedUnitsCount },
        { label: 'Vacant Spaces', value: vacantUnitsCount },
    ];

    return (

        <div className="flex h-full w-full overflow-hidden">
            {/* MAIN WORKSPACE AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">


                {/* LEVEL 1 WORKSPACE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                            <Building2 className="w-7 h-7 text-sky-600" />
                            Properties & Space Workspace
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Manage real estate portfolios, unit groups, rentable space inventory, and 360° operational status.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={() => {
                                setActiveTab('groups');
                                setShowInlineForm(true);
                            }}
                            className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                            <Layers className="w-4 h-4 text-slate-600" />
                            <span>Add Unit Group</span>
                        </button>

                        <button
                            onClick={() => setShowInlineForm(!showInlineForm)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer active:scale-95"
                        >
                            {showInlineForm ? <ChevronDown className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            <span>
                                {showInlineForm
                                    ? 'Close Creation Form'
                                    : activeTab === 'portfolio'
                                        ? 'Add Property'
                                        : activeTab === 'groups'
                                            ? 'Add Unit Group'
                                            : 'Add Rentable Unit'}
                            </span>
                        </button>

                    </div>
                </div>

                {/* TOP OPERATIONAL KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Properties</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{properties.length}</p>
                        <span className="text-[11px] text-slate-500 block">Active portfolio assets</span>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">Rentable Units</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-sky-600">{totalUnitsCount}</p>
                        <span className="text-[11px] text-sky-700 block">Spaces configured</span>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Occupancy Health</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">{occupancyPercentage}%</p>
                        <span className="text-[11px] text-emerald-700 font-semibold block">{occupiedUnitsCount} occupied units</span>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Vacant Inventory</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-amber-600">{vacantUnitsCount}</p>
                        <span className="text-[11px] text-amber-700 block">Available for leasing</span>
                    </div>
                </div>

                {/* CONTEXTUAL INLINE CREATION PANEL */}
                {showInlineForm && (
                    <form
                        onSubmit={handleCreateSubmit}
                        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-200"
                    >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-800" />
                                {activeTab === 'portfolio'
                                    ? 'Register New Property'
                                    : activeTab === 'groups'
                                        ? 'Create New Unit Group'
                                        : 'Create New Rentable Unit'}
                            </h4>
                            <button type="button" onClick={() => setShowInlineForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {activeTab === 'portfolio' && (

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Property Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={creationForm.name}
                                        onChange={(e) => setCreationForm({ ...creationForm, name: e.target.value })}
                                        placeholder="e.g. Grand Horizon Tower"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Address</label>
                                    <input
                                        type="text"
                                        required
                                        value={creationForm.address}
                                        onChange={(e) => setCreationForm({ ...creationForm, address: e.target.value })}
                                        placeholder="123 Financial Way"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={creationForm.city}
                                        onChange={(e) => setCreationForm({ ...creationForm, city: e.target.value })}
                                        placeholder="Miami"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'groups' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Property</label>
                                    <select
                                        value={creationForm.propertyId}
                                        onChange={(e) => setCreationForm({ ...creationForm, propertyId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    >
                                        {properties.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Group Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={creationForm.name}
                                        onChange={(e) => setCreationForm({ ...creationForm, name: e.target.value })}
                                        placeholder="e.g. Floor 1 / Building A"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'units' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Property</label>
                                    <select
                                        value={creationForm.propertyId}
                                        onChange={(e) => setCreationForm({ ...creationForm, propertyId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    >
                                        {properties.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unit Group (Optional)</label>
                                    <select
                                        value={creationForm.unitGroupId}
                                        onChange={(e) => setCreationForm({ ...creationForm, unitGroupId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">(No Group / Unassigned)</option>
                                        {(properties.find((p) => p.id === creationForm.propertyId)?.unitGroups || []).map((g) => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unit Identifier</label>
                                    <input
                                        type="text"
                                        required
                                        value={creationForm.name}
                                        onChange={(e) => setCreationForm({ ...creationForm, name: e.target.value })}
                                        placeholder="e.g. Apt 101"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        )}

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
                                Save Item
                            </button>
                        </div>
                    </form>
                )}

                {/* LEVEL 2 TAB NAVIGATION */}
                <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-xs font-bold overflow-x-auto no-scrollbar whitespace-nowrap">

                    <button
                        onClick={() => handleTabSwitch('portfolio')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'portfolio' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Building2 className="w-4 h-4" /> Portfolio Overview ({properties.length})
                    </button>
                    <button
                        onClick={() => handleTabSwitch('groups')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'groups' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Layers className="w-4 h-4" /> Unit Groups Architecture ({properties.reduce((acc, p) => acc + (p.unitGroups?.length || 0), 0)})
                    </button>
                    <button
                        onClick={() => handleTabSwitch('units')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'units' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <DoorOpen className="w-4 h-4" /> All Rentable Units ({totalUnitsCount})
                    </button>
                </div>


                {/* TAB 1: PORTFOLIO OVERVIEW */}
                {activeTab === 'portfolio' && (
                    loading ? (
                        <TableSkeleton rows={4} cols={3} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map((property) => {
                                const unitCount = property._count?.units || property.units?.length || 0;
                                const groupCount = property._count?.unitGroups || property.unitGroups?.length || 0;

                                return (
                                    <div
                                        key={property.id}
                                        className="bg-white rounded-3xl border border-slate-200/80 hover:border-slate-400 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xs">
                                                    <Building className="w-5 h-5" />
                                                </div>
                                                <button
                                                    onClick={(e) => handlePropertySettingsClick(e, property)}
                                                    title="Configure Property Settings"
                                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <h4 className="text-base font-bold text-slate-900 mt-4">
                                                {property.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {property.address}, {property.city}
                                            </p>

                                            <p className="text-xs text-slate-600 my-3 line-clamp-2 leading-relaxed">
                                                {property.description || 'No summary notes.'}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                                            <button
                                                onClick={(e) => handleViewPropertyUnitsExplicit(e, property)}
                                                className="flex-1 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                            >
                                                <DoorOpen className="w-3.5 h-3.5 text-slate-600" />
                                                Units ({unitCount})
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPropertyFilter(property);
                                                    setExpandedAccordionId(property.id);
                                                    setActiveTab('groups');
                                                }}
                                                className="flex-1 py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                                            >
                                                <Layers className="w-3.5 h-3.5" />
                                                Groups ({groupCount})
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                {/* TAB 2: UNIT GROUPS ACCORDION VIEW */}
                {activeTab === 'groups' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Unit Groups Architecture</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Tap a group row to inspect details, or click 'See Units in Group' to filter units.</p>
                            </div>
                        </div>


                        <div className="space-y-3">
                            {properties.map((property) => {
                                const isExpanded = expandedAccordionId === property.id;
                                const groups = property.unitGroups || [];

                                return (
                                    <div key={property.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div
                                            onClick={() => setExpandedAccordionId(isExpanded ? null : property.id)}
                                            className="p-4 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isExpanded ? <ChevronDown className="w-4 h-4 text-sky-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                <span className="font-bold text-slate-800 text-sm">{property.name}</span>
                                                <span className="text-xs text-slate-400">({groups.length} Groups)</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleViewPropertyUnitsExplicit(e, property)}
                                                className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                                            >
                                                View All Property Units →
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-4 divide-y divide-slate-100">
                                                {groups.length === 0 ? (
                                                    <p className="text-xs text-slate-400 py-2 italic px-4">No unit groups configured for this property yet.</p>
                                                ) : (
                                                    groups.map((group) => (
                                                        <div
                                                            key={group.id}
                                                            onClick={() => handleUnitGroupRowSurfaceClick(group, property)}
                                                            className="py-3 px-4 flex items-center justify-between hover:bg-sky-50/50 rounded-lg transition-colors cursor-pointer group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Tag className="w-4 h-4 text-sky-500" />
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                                                                        {group.name}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400">{group.description || 'Standard Grouping'}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                                                    {group.units?.length || 0} Units
                                                                </span>
                                                                <button
                                                                    onClick={(e) => handleSeeUnitsInGroupExplicit(e, property, group)}
                                                                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                                                >
                                                                    <DoorOpen className="w-3.5 h-3.5" /> See Units in Group →
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 3: ALL UNITS DIRECTORY VIEW */}
                {activeTab === 'units' && (
                    <div className="space-y-4">
                        {(selectedPropertyFilter || selectedGroupFilter) && (
                            <div className="flex items-center gap-2 bg-sky-50 p-3 rounded-xl border border-sky-100">
                                <span className="text-xs font-bold text-sky-900 flex items-center gap-1">
                                    <Filter className="w-3.5 h-3.5" /> Active Scope:
                                </span>

                                {selectedPropertyFilter && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-sky-800 px-2.5 py-1 rounded-lg border border-sky-200 shadow-sm">
                                        📍 {selectedPropertyFilter.name}
                                        <button onClick={() => setSelectedPropertyFilter(null)} className="hover:text-red-500">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                )}

                                {selectedGroupFilter && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-sky-800 px-2.5 py-1 rounded-lg border border-sky-200 shadow-sm">
                                        🏷️ {selectedGroupFilter.name}
                                        <button onClick={() => setSelectedGroupFilter(null)} className="hover:text-red-500">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                )}

                                <button
                                    onClick={() => {
                                        setSelectedPropertyFilter(null);
                                        setSelectedGroupFilter(null);
                                    }}
                                    className="text-xs text-slate-500 hover:text-slate-800 underline ml-auto font-medium"
                                >
                                    Show ALL Units
                                </button>
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="relative w-full md:w-72">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search units..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                <div className="flex items-center gap-1.5">
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Group By:</span>
                                    <select
                                        value={groupByMode}
                                        onChange={(e) => setGroupByMode(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 cursor-pointer"
                                    >
                                        <option value="none">Flat List</option>
                                        <option value="property">Group by Property</option>
                                        <option value="group">Group by Unit Group</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 cursor-pointer"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="VACANT">VACANT</option>
                                        <option value="OCCUPIED">OCCUPIED</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Units Table */}
                        {loading ? (
                            <TableSkeleton rows={6} cols={5} />
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left text-xs text-slate-600">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="p-3.5">Unit Name</th>
                                            <th className="p-3.5">Property</th>
                                            <th className="p-3.5">Unit Group</th>
                                            <th className="p-3.5">Status</th>
                                            <th className="p-3.5 text-right">Inspect</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUnits.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                                                    No units found matching criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            getGroupedUnits().map((section) => (
                                                <React.Fragment key={section.key}>
                                                    {section.title && (
                                                        <tr className="bg-slate-100/80 border-y border-slate-200">
                                                            <td colSpan={5} className="py-2 px-3.5 font-bold text-slate-700 uppercase tracking-wide text-[11px]">
                                                                {groupByMode === 'property' ? '📍 Property: ' : '🏷️ Group: '}{section.title} ({section.units.length})
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {section.units.map((unit) => {
                                                        const isSelected = selectedItem?.data?.id === unit.id;
                                                        return (
                                                                <tr
                                                                    key={unit.id}
                                                                    onClick={() => handleSelectUnit(unit)}
                                                                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-sky-50/50 font-medium' : ''
                                                                        }`}
                                                                >
                                                                <td className="p-3.5 font-bold text-slate-800">{unit.name}</td>
                                                                <td className="p-3.5 text-slate-600">{unit.propertyName}</td>
                                                                <td className="p-3.5">
                                                                    {unit.groupName ? (
                                                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-100 rounded-md">
                                                                            🏷️ {unit.groupName}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] text-slate-400 italic">(Unassigned)</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-3.5">
                                                                    <span
                                                                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${unit.status === 'OCCUPIED' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                                            }`}
                                                                    >
                                                                        {unit.status}
                                                                    </span>
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
            </div>

            {/* LEVEL 3: COMPREHENSIVE PERSISTENT DRAWER */}
            <PersistentDrawer
                selectedItem={selectedItem}
                onClose={() => {
                    setSelectedItem(null);
                    setUnit360Data(null);
                    setSearchParams((prev) => {
                        prev.delete('unitId');
                        return prev;
                    });
                }}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                onSave={handleSaveEdit}
                summaryTitle="Properties Summary"
                summaryStats={summaryStats}
                customWidth="w-full sm:w-[480px] lg:w-[480px] xl:w-[520px]"
                editFormContent={

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Name / Identifier</label>
                            <input
                                type="text"
                                value={drawerEditForm.name || ''}
                                onChange={(e) => setDrawerEditForm({ ...drawerEditForm, name: e.target.value })}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>

                        {selectedItem?.type === 'UNIT' && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status</label>
                                    <select
                                        value={drawerEditForm.status || 'VACANT'}
                                        onChange={(e) => setDrawerEditForm({ ...drawerEditForm, status: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="VACANT">VACANT</option>
                                        <option value="OCCUPIED">OCCUPIED</option>
                                        <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                                        <option value="RESERVED">RESERVED</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unit Group</label>
                                    <select
                                        value={drawerEditForm.unitGroupId || ''}
                                        onChange={(e) => setDrawerEditForm({ ...drawerEditForm, unitGroupId: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">(None / Unassigned)</option>
                                        {(properties.find((p) => p.id === (selectedItem.data.propertyId || selectedItem.data.property?.id))?.unitGroups || []).map((g) => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unit Type</label>
                                    <input
                                        type="text"
                                        value={drawerEditForm.unitTypeName || ''}
                                        onChange={(e) => setDrawerEditForm({ ...drawerEditForm, unitTypeName: e.target.value })}
                                        placeholder="e.g. 2BHK Deluxe, Studio"
                                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            </>
                        )}

                        {(selectedItem?.type === 'PROPERTY' || selectedItem?.type === 'SETTINGS') && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={drawerEditForm.address || ''}
                                            onChange={(e) => setDrawerEditForm({ ...drawerEditForm, address: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City</label>
                                        <input
                                            type="text"
                                            value={drawerEditForm.city || ''}
                                            onChange={(e) => setDrawerEditForm({ ...drawerEditForm, city: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Currency</label>
                                        <select
                                            value={drawerEditForm.currency || 'USD'}
                                            onChange={(e) => setDrawerEditForm({ ...drawerEditForm, currency: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="BDT">BDT (৳)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Grace Days</label>
                                        <input
                                            type="number"
                                            value={drawerEditForm.defaultGraceDays || 5}
                                            onChange={(e) => setDrawerEditForm({ ...drawerEditForm, defaultGraceDays: Number(e.target.value) })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                            <textarea
                                value={drawerEditForm.description || ''}
                                onChange={(e) => setDrawerEditForm({ ...drawerEditForm, description: e.target.value })}
                                rows={3}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                }
            >
                {/* PROPERTY SETTINGS MODE */}
                {selectedItem?.type === 'SETTINGS' && (
                    <div className="space-y-5">
                        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold text-slate-500">
                            <button
                                onClick={() => setDrawerEditTab('general')}
                                className={`pb-2 border-b-2 ${drawerTab === 'general' ? 'border-sky-600 text-sky-600' : 'border-transparent'}`}
                            >
                                General Details
                            </button>
                            <button
                                onClick={() => setDrawerEditTab('staff')}
                                className={`pb-2 border-b-2 ${drawerTab === 'staff' ? 'border-sky-600 text-sky-600' : 'border-transparent'}`}
                            >
                                Staff & Access
                            </button>
                            <button
                                onClick={() => setDrawerEditTab('actions')}
                                className={`pb-2 border-b-2 ${drawerTab === 'actions' ? 'border-sky-600 text-sky-600' : 'border-transparent'}`}
                            >
                                Quick Actions
                            </button>
                        </div>

                        {drawerTab === 'general' && (
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Building Name</span>
                                    <p className="text-sm font-bold text-slate-900">{selectedItem.data.name}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address & City</span>
                                    <p className="text-xs text-slate-700">{selectedItem.data.address}, {selectedItem.data.city}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currency & Grace Period</span>
                                    <p className="text-xs text-slate-700">{selectedItem.data.currency || 'USD'} • {selectedItem.data.defaultGraceDays || 5} Grace Days</p>
                                </div>
                            </div>
                        )}

                        {drawerTab === 'staff' && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-700 uppercase">Assigned Staff</span>
                                    <button
                                        onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                                        className="flex items-center gap-1 text-xs font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg hover:bg-sky-100"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" /> + Assign Staff
                                    </button>
                                </div>

                                {showAddStaffForm && (
                                    <form onSubmit={handleAddStaffSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                        <input
                                            type="email"
                                            required
                                            placeholder="staff.email@company.com"
                                            value={staffForm.email}
                                            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                        />
                                        <div className="flex justify-between items-center">
                                            <select
                                                value={staffForm.role}
                                                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                                                className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                                            >
                                                <option value="MANAGER">MANAGER</option>
                                                <option value="STAFF">STAFF</option>
                                                <option value="MAINTAINER">MAINTAINER</option>
                                            </select>
                                            <button type="submit" className="px-3 py-1 bg-sky-600 text-white text-xs rounded-lg font-semibold">
                                                Send Invite
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-500" />
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800">Sarah Connor (Owner)</p>
                                            <p className="text-[10px] text-slate-400">Primary Administrator</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">ACTIVE</span>
                                </div>
                            </div>
                        )}

                        {drawerTab === 'actions' && (
                            <div className="space-y-2 pt-2">
                                <button
                                    onClick={() => {
                                        setActiveTab('groups');
                                        setCreationForm((prev) => ({ ...prev, propertyId: selectedItem.data.id }));
                                        setShowInlineForm(true);
                                        setSelectedItem(null);
                                    }}
                                    className="w-full py-2 px-3 bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg hover:bg-sky-100 text-left"
                                >
                                    + Add Unit Group to {selectedItem.data.name}
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('units');
                                        setCreationForm((prev) => ({ ...prev, propertyId: selectedItem.data.id }));
                                        setShowInlineForm(true);
                                        setSelectedItem(null);
                                    }}
                                    className="w-full py-2 px-3 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 text-left"
                                >
                                    + Add Unit to {selectedItem.data.name}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* UNIT GROUP MODE */}
                {selectedItem?.type === 'UNIT_GROUP' && (
                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Group Name</span>
                            <p className="text-base font-bold text-slate-900">{selectedItem.data.name}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belongs To Property</span>
                            <p className="text-xs text-slate-700">{selectedItem.data.propertyName}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</span>
                            <p className="text-xs text-slate-600 leading-relaxed">{selectedItem.data.description || 'Standard Grouping.'}</p>
                        </div>
                    </div>
                )}

                {/* VIEW MODE DETAILS: UNIT (360 OPERATIONAL HUB) */}
                {selectedItem?.type === 'UNIT' && (
                    <Unit360Drawer
                        unitOverview={unit360Data}
                        loading={unit360Loading}
                        onRefresh={() => handleSelectUnit(selectedItem.data)}
                    />
                )}
            </PersistentDrawer>

            {/* QUICK LEASE DETAILS MODAL */}
            {quickLeaseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-800">Quick Lease Details: #{quickLeaseModal.leaseNumber}</h4>
                            <button onClick={() => setQuickLeaseModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-slate-700">
                            <div className="flex justify-between bg-sky-50 p-3 rounded-xl border border-sky-100">
                                <div>
                                    <span className="text-[10px] text-sky-700 uppercase font-bold">Monthly Rent</span>
                                    <p className="text-base font-bold text-sky-900">${Number(quickLeaseModal.rentAmount).toLocaleString()}/mo</p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full h-fit">ACTIVE</span>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Space</span>
                                <p className="font-semibold text-slate-800">{quickLeaseModal.propertyName} — {quickLeaseModal.unitName}</p>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tenant Party</span>
                                <p className="font-semibold text-slate-800">{quickLeaseModal.tenantName} ({quickLeaseModal.tenantEmail})</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Term</span>
                                    <p className="font-medium text-slate-700">{quickLeaseModal.startDate} → {quickLeaseModal.endDate}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Security Deposit</span>
                                    <p className="font-bold text-slate-800">${Number(quickLeaseModal.securityDeposit).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => setQuickLeaseModal(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DRAFT LEASE MODAL FOR VACANT UNIT */}
            {addLeaseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-800">Draft Lease for {addLeaseModal.unitName}</h4>
                            <button onClick={() => setAddLeaseModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleDraftLeaseFromDrawerSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Property (Locked)</span>
                                    <p className="font-bold text-slate-800">{addLeaseModal.propertyName}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Unit (Locked)</span>
                                    <p className="font-bold text-slate-800">{addLeaseModal.unitName}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-600 uppercase mb-1">Select Tenant Party</label>
                                <select
                                    required
                                    value={leaseForm.tenantId}
                                    onChange={(e) => setLeaseForm({ ...leaseForm, tenantId: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                >
                                    <option value="">-- Choose Tenant --</option>
                                    {tenantsList.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.tenantType === 'BUSINESS' ? t.businessName : `${t.firstName} ${t.lastName}`} ({t.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-600 uppercase mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={leaseForm.startDate}
                                        onChange={(e) => setLeaseForm({ ...leaseForm, startDate: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 uppercase mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={leaseForm.endDate}
                                        onChange={(e) => setLeaseForm({ ...leaseForm, endDate: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-600 uppercase mb-1">Monthly Rent ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={leaseForm.rentAmount}
                                        onChange={(e) => setLeaseForm({ ...leaseForm, rentAmount: e.target.value })}
                                        placeholder="1800"
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 uppercase mb-1">Security Deposit ($)</label>
                                    <input
                                        type="number"
                                        value={leaseForm.securityDeposit}
                                        onChange={(e) => setLeaseForm({ ...leaseForm, securityDeposit: e.target.value })}
                                        placeholder="3600"
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setAddLeaseModal(null)}
                                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm">
                                    Activate Lease
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}