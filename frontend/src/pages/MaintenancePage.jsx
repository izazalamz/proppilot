import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PersistentDrawer from '../components/common/PersistentDrawer';
import TableSkeleton from '../components/common/TableSkeleton';

import {
    Wrench,
    Kanban,
    List,
    Users,
    Plus,
    Search,
    Filter,
    Clock,
    AlertTriangle,
    CheckCircle2,
    PlayCircle,
    UserCheck,
    Building2,
    Calendar,
    ChevronRight,
    ArrowRight,
    Tag,
    X,
    MessageSquare,
    Check,
    FileText,
    Sparkles,
    Trash2,
    User,
    Layers,
    SlidersHorizontal,
    Phone,
    Mail,
} from 'lucide-react';

export default function MaintenancePage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Level 2 Section Tabs: 'kanban' | 'table' | 'staff'
    const [activeTab, setActiveTab] = useState('kanban');
    const [requests, setRequests] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [properties, setProperties] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [propertyFilter, setPropertyFilter] = useState('ALL');
    const [staffFilter, setStaffFilter] = useState('ALL');

    // Level 3 Persistent Drawer
    const [selectedItem, setSelectedItem] = useState(null); // { type: 'MAINTENANCE', data: {...} }
    const [isEditing, setIsEditing] = useState(false);

    // Substantial Creation Modality (Inline Expandable Panel)
    const [showInlineForm, setShowInlineForm] = useState(false);
    const [formPropertyId, setFormPropertyId] = useState('');
    const [requestForm, setRequestForm] = useState({
        propertyId: '',
        unitId: '',
        title: '',
        problemDescription: '',
        category: 'Plumbing',
        priority: 'MEDIUM',
        assignedToUserId: '',
    });

    // Modals
    const [showAssignModal, setShowAssignModal] = useState(null); // Request object or null
    const [assignStaffId, setAssignStaffId] = useState('');

    const [showResolveModal, setShowResolveModal] = useState(null); // Request object or null
    const [resolveNotes, setResolveNotes] = useState('');

    const [actionMessage, setActionMessage] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, staffRes, propRes] = await Promise.all([
                api.get('/maintenance'),
                api.get('/maintenance/staff'),
                api.get('/properties'),
            ]);
            setRequests(reqRes.data.data || []);
            setStaffList(staffRes.data.data || []);
            setProperties(propRes.data.data || []);

            if (propRes.data.data?.length > 0 && !formPropertyId) {
                setFormPropertyId(propRes.data.data[0].id);
                setRequestForm((prev) => ({ ...prev, propertyId: propRes.data.data[0].id }));
            }
        } catch (err) {
            console.error('Failed to load maintenance workspace data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch units when form property changes
    useEffect(() => {
        const loadPropertyUnits = async () => {
            if (!formPropertyId) return;
            try {
                const res = await api.get(`/properties/${formPropertyId}/units`);
                setUnits(res.data.data || []);
            } catch (err) {
                console.error('Failed to load property units:', err);
            }
        };
        loadPropertyUnits();
    }, [formPropertyId]);

    // Deep link detection (e.g. ?tab=kanban&ticketId=...&search=...)
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const ticketIdParam = searchParams.get('ticketId');
        const searchParam = searchParams.get('search');

        if (tabParam && ['kanban', 'table', 'staff'].includes(tabParam)) {
            setActiveTab(tabParam);
        }

        if (searchParam) {
            setSearchTerm(searchParam);
        }

        if (ticketIdParam && requests.length > 0) {
            const found = requests.find((r) => r.id === ticketIdParam);
            if (found) setSelectedItem({ type: 'MAINTENANCE', data: found });
        }
    }, [searchParams, requests]);

    // Drawer Edit State & Handler
    const [ticketEditForm, setTicketEditForm] = useState({
        title: '',
        problemDescription: '',
        category: 'GENERAL',
        priority: 'MEDIUM',
        status: 'REQUESTED',
        assignedToUserId: '',
        estimatedCost: '',
        actualCost: '',
    });

    const handleSelectTicket = (ticket) => {
        setSelectedItem({ type: 'MAINTENANCE', data: ticket });
        setTicketEditForm({
            title: ticket.title || '',
            problemDescription: ticket.problemDescription || '',
            category: ticket.category || 'GENERAL',
            priority: ticket.priority || 'MEDIUM',
            status: ticket.status || 'REQUESTED',
            assignedToUserId: ticket.assignedToUserId || ticket.assignedTo?.id || '',
            estimatedCost: ticket.estimatedCost !== null && ticket.estimatedCost !== undefined ? ticket.estimatedCost : '',
            actualCost: ticket.actualCost !== null && ticket.actualCost !== undefined ? ticket.actualCost : '',
        });
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        if (!selectedItem?.data?.id) return;
        try {
            const res = await api.put(`/maintenance/${selectedItem.data.id}`, {
                ...ticketEditForm,
                estimatedCost: ticketEditForm.estimatedCost !== '' ? Number(ticketEditForm.estimatedCost) : undefined,
                actualCost: ticketEditForm.actualCost !== '' ? Number(ticketEditForm.actualCost) : undefined,
                assignedToUserId: ticketEditForm.assignedToUserId || null,
            });
            setIsEditing(false);
            fetchData();
            if (res.data?.data) {
                setSelectedItem({ type: 'MAINTENANCE', data: res.data.data });
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update maintenance ticket.');
        }
    };

    const totalCount = requests.length;
    const requestedCount = requests.filter((r) => r.status === 'REQUESTED').length;
    const reviewedCount = requests.filter((r) => r.status === 'REVIEWED').length;
    const inProgressCount = requests.filter((r) => r.status === 'IN_PROGRESS').length;
    const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;
    const urgentCount = requests.filter(
        (r) => (r.priority === 'URGENT' || r.priority === 'HIGH') && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
    ).length;
    const resolutionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const summaryStats = [
        { label: 'Total Work Orders', value: totalCount },
        { label: 'Urgent / Action Req', value: urgentCount },
        { label: 'In Progress', value: inProgressCount },
        { label: 'Completed Tickets', value: completedCount },
        { label: 'Resolution Rate', value: `${resolutionRate}%` },
        { label: 'Active Technicians', value: staffList.length },
    ];

    // Filter Requests
    const filteredRequests = requests.filter((req) => {
        const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter;
        const matchesProperty = propertyFilter === 'ALL' || req.propertyId === propertyFilter;
        const matchesStaff = staffFilter === 'ALL' || req.assignedToUserId === staffFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            req.title.toLowerCase().includes(q) ||
            req.problemDescription.toLowerCase().includes(q) ||
            req.category.toLowerCase().includes(q) ||
            req.unit?.name?.toLowerCase().includes(q) ||
            req.property?.name?.toLowerCase().includes(q) ||
            req.assignedTo?.firstName?.toLowerCase().includes(q) ||
            req.assignedTo?.lastName?.toLowerCase().includes(q);

        return matchesStatus && matchesPriority && matchesProperty && matchesStaff && matchesSearch;
    });

    // Pipeline status transitions
    const handleStatusTransition = async (ticketId, newStatus, extra = {}) => {
        try {
            const res = await api.patch(`/maintenance/${ticketId}/status`, {
                status: newStatus,
                ...extra,
            });
            fetchData();
            if (selectedItem?.data?.id === ticketId) {
                setSelectedItem({ type: 'MAINTENANCE', data: res.data.data });
            }
            setActionMessage({ type: 'success', text: `Ticket moved to ${newStatus.replace('_', ' ')}!` });
            setTimeout(() => setActionMessage(null), 3500);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update status.');
        }
    };

    // Handler: Create Ticket
    const handleCreateTicketSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                propertyId: requestForm.propertyId,
                unitId: requestForm.unitId || null,
                title: requestForm.title,
                problemDescription: requestForm.problemDescription,
                category: requestForm.category,
                priority: requestForm.priority,
                assignedToUserId: requestForm.assignedToUserId || null,
            };

            const res = await api.post('/maintenance', payload);
            setShowInlineForm(false);
            setRequestForm({
                propertyId: properties[0]?.id || '',
                unitId: '',
                title: '',
                problemDescription: '',
                category: 'Plumbing',
                priority: 'MEDIUM',
                assignedToUserId: '',
            });
            fetchData();
            setSelectedItem({ type: 'MAINTENANCE', data: res.data.data });
            setActionMessage({ type: 'success', text: 'Maintenance work order logged successfully!' });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create ticket.');
        }
    };

    // Handler: Assign Staff
    const handleAssignStaffSubmit = async (e) => {
        e.preventDefault();
        if (!showAssignModal?.id || !assignStaffId) return;
        try {
            const res = await api.patch(`/maintenance/${showAssignModal.id}/assign`, {
                assignedToUserId: assignStaffId,
            });
            setShowAssignModal(null);
            fetchData();
            if (selectedItem?.data?.id === showAssignModal.id) {
                setSelectedItem({ type: 'MAINTENANCE', data: res.data.data });
            }
            setActionMessage({ type: 'success', text: 'Technician assigned successfully!' });
            setTimeout(() => setActionMessage(null), 3500);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to assign staff.');
        }
    };

    // Handler: Resolve Work Order
    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!showResolveModal?.id) return;
        try {
            const res = await api.patch(`/maintenance/${showResolveModal.id}/status`, {
                status: 'COMPLETED',
                resolutionNotes: resolveNotes || 'Work order completed and verified.',
            });
            setShowResolveModal(null);
            setResolveNotes('');
            fetchData();
            if (selectedItem?.data?.id === showResolveModal.id) {
                setSelectedItem({ type: 'MAINTENANCE', data: res.data.data });
            }
            setActionMessage({ type: 'success', text: 'Work order marked as COMPLETED & RESOLVED!' });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to resolve ticket.');
        }
    };

    // Handler: Delete Request
    const handleDeleteTicket = async (ticketId) => {
        if (!confirm('Are you sure you want to delete this maintenance ticket?')) return;
        try {
            await api.delete(`/maintenance/${ticketId}`);
            setSelectedItem(null);
            fetchData();
            setActionMessage({ type: 'success', text: 'Ticket deleted.' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete ticket.');
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'URGENT':
                return 'bg-rose-100 text-rose-800 border-rose-200 font-extrabold animate-pulse';
            case 'HIGH':
                return 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
            case 'MEDIUM':
                return 'bg-sky-100 text-sky-800 border-sky-200';
            case 'LOW':
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'IN_PROGRESS':
                return 'bg-sky-100 text-sky-800 border-sky-200';
            case 'REVIEWED':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'REQUESTED':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'CANCELLED':
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // Kanban Columns Configuration
    const kanbanColumns = [
        {
            key: 'REQUESTED',
            title: '1. Requested',
            count: requestedCount,
            accentColor: 'border-amber-400 bg-amber-50/40 text-amber-800',
            icon: Clock,
            items: filteredRequests.filter((r) => r.status === 'REQUESTED'),
        },
        {
            key: 'REVIEWED',
            title: '2. Under Review',
            count: reviewedCount,
            accentColor: 'border-indigo-400 bg-indigo-50/40 text-indigo-800',
            icon: UserCheck,
            items: filteredRequests.filter((r) => r.status === 'REVIEWED'),
        },
        {
            key: 'IN_PROGRESS',
            title: '3. In Progress',
            count: inProgressCount,
            accentColor: 'border-sky-400 bg-sky-50/40 text-sky-800',
            icon: PlayCircle,
            items: filteredRequests.filter((r) => r.status === 'IN_PROGRESS'),
        },
        {
            key: 'COMPLETED',
            title: '4. Completed & Closed',
            count: completedCount,
            accentColor: 'border-emerald-400 bg-emerald-50/40 text-emerald-800',
            icon: CheckCircle2,
            items: filteredRequests.filter((r) => r.status === 'COMPLETED'),
        },
    ];

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            {/* WORKSPACE BANNER & ALERTS */}

            {actionMessage && (
                <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between shadow-xs">
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {actionMessage.text}
                    </span>
                    <button onClick={() => setActionMessage(null)} className="text-emerald-100 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* MAIN CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

                    {/* LEVEL 1 WORKSPACE HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                                <Wrench className="w-7 h-7 text-sky-600" />
                                Maintenance & Work Orders
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Lifecycle ticket dispatch, staff assignment, problem resolution tracking, and Kanban status pipeline.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                onClick={() => {
                                    setShowInlineForm(!showInlineForm);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{showInlineForm ? 'Close Work Order Form' : 'Log Maintenance Ticket'}</span>
                            </button>
                        </div>


                    </div>

                    {/* TOP OPERATIONAL KPI CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Work Orders</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{totalCount}</p>
                            <span className="text-[11px] text-slate-500 block">{requestedCount} awaiting review</span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Urgent & High Action</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-rose-600">{urgentCount}</p>
                            <span className="text-[11px] text-rose-700 font-semibold block">Critical response queue</span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">Active In Progress</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-sky-600">{inProgressCount}</p>
                            <span className="text-[11px] text-sky-700 block">Assigned to {staffList.length} staff</span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Resolved & Closed</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">{completedCount}</p>
                            <span className="text-[11px] text-emerald-700 font-semibold block">{resolutionRate}% resolution rate</span>
                        </div>
                    </div>

                    {/* SUBSTANTIAL CREATION PANEL: INLINE EXPANDABLE TICKET BUILDER */}
                    {showInlineForm && (
                        <form
                            onSubmit={handleCreateTicketSubmit}
                            className="bg-white border-2 border-sky-500 rounded-2xl p-5 sm:p-6 shadow-md space-y-5 animate-in slide-in-from-top duration-200"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-sky-600" /> Log Maintenance Work Order
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Submit repair request, assign technician, and set priority.</p>
                                </div>
                                <button type="button" onClick={() => setShowInlineForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Target Property</label>
                                    <select
                                        required
                                        value={formPropertyId}
                                        onChange={(e) => {
                                            setFormPropertyId(e.target.value);
                                            setRequestForm({ ...requestForm, propertyId: e.target.value, unitId: '' });
                                        }}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                                    >
                                        {properties.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Unit / Space (Optional)</label>
                                    <select
                                        value={requestForm.unitId}
                                        onChange={(e) => setRequestForm({ ...requestForm, unitId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                                    >
                                        <option value="">Building Common Area / General</option>
                                        {units.map((u) => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.status})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Issue Category</label>
                                    <select
                                        value={requestForm.category}
                                        onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                                    >
                                        <option value="Plumbing">Plumbing & Water Intake</option>
                                        <option value="Electrical">Electrical & Power Grid</option>
                                        <option value="HVAC & Cooling">HVAC & Air Conditioning</option>
                                        <option value="Carpentry & Locks">Carpentry, Doors & Locks</option>
                                        <option value="Appliance">Appliance & White Goods</option>
                                        <option value="Structural & Paint">Structural & Painting</option>
                                        <option value="General Upkeep">General Facility Upkeep</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="md:col-span-2">
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Work Order Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Master bathroom faucet dripping, Main elevator sensor error"
                                        value={requestForm.title}
                                        onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Priority Level</label>
                                    <select
                                        value={requestForm.priority}
                                        onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
                                    >
                                        <option value="LOW">LOW</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HIGH">HIGH (Urgent queue)</option>
                                        <option value="URGENT">URGENT (Emergency repair)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="text-xs">
                                <label className="block font-semibold text-slate-700 uppercase mb-1">Problem Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Detailed description of the breakdown, symptoms, and access instructions..."
                                    value={requestForm.problemDescription}
                                    onChange={(e) => setRequestForm({ ...requestForm, problemDescription: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-slate-100 text-xs">
                                <div className="w-full sm:w-72">
                                    <label className="block font-semibold text-slate-600 uppercase mb-1">Assign Technician (Optional)</label>
                                    <select
                                        value={requestForm.assignedToUserId}
                                        onChange={(e) => setRequestForm({ ...requestForm, assignedToUserId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                                    >
                                        <option value="">Leave Unassigned</option>
                                        {staffList.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.role}) — {s.openTicketsCount} active tickets
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowInlineForm(false)}
                                        className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                                    >
                                        Dispatch Work Order
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* LEVEL 2 HORIZONTAL NAVIGATION TABS */}
                    <div className="flex border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">

                        <button
                            onClick={() => setActiveTab('kanban')}
                            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                activeTab === 'kanban'
                                    ? 'border-sky-600 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Kanban className="w-4 h-4" /> Kanban Pipeline Board ({totalCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('table')}
                            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                activeTab === 'table'
                                    ? 'border-sky-600 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <List className="w-4 h-4" /> Work Orders Directory
                        </button>
                        <button
                            onClick={() => setActiveTab('staff')}
                            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                activeTab === 'staff'
                                    ? 'border-sky-600 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Users className="w-4 h-4" /> Staff & Technicians ({staffList.length})
                        </button>
                    </div>

                    {/* SECTION 1: KANBAN PIPELINE BOARD */}
                    {activeTab === 'kanban' && (
                        <div className="space-y-4">
                            {/* Kanban Filter Toolbar */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="relative w-full md:w-72">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search tickets, technicians, spaces..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-slate-500 uppercase">Priority:</span>
                                        <select
                                            value={priorityFilter}
                                            onChange={(e) => setPriorityFilter(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 cursor-pointer"
                                        >
                                            <option value="ALL">All Priorities</option>
                                            <option value="URGENT">URGENT</option>
                                            <option value="HIGH">HIGH</option>
                                            <option value="MEDIUM">MEDIUM</option>
                                            <option value="LOW">LOW</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-slate-500 uppercase">Property:</span>
                                        <select
                                            value={propertyFilter}
                                            onChange={(e) => setPropertyFilter(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 cursor-pointer max-w-[160px] truncate"
                                        >
                                            <option value="ALL">All Properties</option>
                                            {properties.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 4 KANBAN PIPELINE COLUMNS */}
                            {loading ? (
                                <TableSkeleton rows={4} cols={4} />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                                    {kanbanColumns.map((col) => {
                                        const Icon = col.icon;
                                        return (
                                            <div
                                                key={col.key}
                                                className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3.5 space-y-3 min-h-[500px] flex flex-col"
                                            >
                                                {/* Column Header */}
                                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="w-4 h-4 text-slate-600" />
                                                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                                                            {col.title}
                                                        </h4>
                                                    </div>
                                                    <span className="px-2 py-0.5 text-xs font-bold bg-white text-slate-700 rounded-full border border-slate-200">
                                                        {col.items.length}
                                                    </span>
                                                </div>

                                                {/* Ticket Cards in Column */}
                                                <div className="space-y-3 flex-1 overflow-y-auto">
                                                    {col.items.length === 0 ? (
                                                        <div className="h-32 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 italic">
                                                            No tickets in this stage
                                                        </div>
                                                    ) : (
                                                        col.items.map((ticket) => {
                                                            const isSelected = selectedItem?.data?.id === ticket.id;
                                                            return (
                                                                <div
                                                                    key={ticket.id}
                                                                    onClick={() => handleSelectTicket(ticket)}
                                                                    className={`p-4 bg-white border rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group ${
                                                                        isSelected ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200'
                                                                    }`}
                                                                >

                                                                    {/* Card Header */}
                                                                    <div className="flex justify-between items-start gap-2">
                                                                        <span
                                                                            className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${getPriorityBadge(
                                                                                ticket.priority
                                                                            )}`}
                                                                        >
                                                                            {ticket.priority}
                                                                        </span>
                                                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-md truncate max-w-[140px]">
                                                                            {ticket.unit ? ticket.unit.name : 'Common Area'}
                                                                        </span>
                                                                    </div>

                                                                    {/* Title & Category */}
                                                                    <div>
                                                                        <h5 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
                                                                            {ticket.title}
                                                                        </h5>
                                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                                            {ticket.category} • {ticket.property?.name}
                                                                        </span>
                                                                    </div>

                                                                    <p className="text-[11px] text-slate-500 line-clamp-2">
                                                                        {ticket.problemDescription}
                                                                    </p>

                                                                    {/* Technician & Date Footer */}
                                                                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                                                                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                                                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                                                            <span>
                                                                                {ticket.assignedTo
                                                                                    ? `${ticket.assignedTo.firstName || ''} ${ticket.assignedTo.lastName || ''}`.trim()
                                                                                    : 'Unassigned'}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-slate-400">
                                                                            {new Date(ticket.requestedAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>

                                                                    {/* Quick Move Pipeline Bar */}
                                                                    <div className="pt-1 flex items-center justify-between gap-1 text-[10px] font-bold">
                                                                        {col.key === 'REQUESTED' && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleStatusTransition(ticket.id, 'REVIEWED');
                                                                                }}
                                                                                className="w-full py-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                                                                            >
                                                                                Review →
                                                                            </button>
                                                                        )}

                                                                        {col.key === 'REVIEWED' && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleStatusTransition(ticket.id, 'IN_PROGRESS');
                                                                                }}
                                                                                className="w-full py-1 text-center bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition-colors"
                                                                            >
                                                                                Start Work →
                                                                            </button>
                                                                        )}

                                                                        {col.key === 'IN_PROGRESS' && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setShowResolveModal(ticket);
                                                                                }}
                                                                                className="w-full py-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                                                            >
                                                                                Resolve & Close ✓
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 2: WORK ORDERS TABLE VIEW */}
                    {activeTab === 'table' && (
                        <div className="space-y-4">
                            {/* Toolbar */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="relative w-full md:w-72">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search title, category, spaces..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-slate-500 uppercase">Status:</span>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 cursor-pointer"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="REQUESTED">REQUESTED</option>
                                            <option value="REVIEWED">REVIEWED</option>
                                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-slate-500 uppercase">Priority:</span>
                                        <select
                                            value={priorityFilter}
                                            onChange={(e) => setPriorityFilter(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 cursor-pointer"
                                        >
                                            <option value="ALL">All Priorities</option>
                                            <option value="URGENT">URGENT</option>
                                            <option value="HIGH">HIGH</option>
                                            <option value="MEDIUM">MEDIUM</option>
                                            <option value="LOW">LOW</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            {loading ? (
                                <TableSkeleton rows={6} cols={7} />
                            ) : (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                                    <table className="w-full text-left text-xs text-slate-600">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="p-3.5">Priority</th>
                                                <th className="p-3.5">Issue Title & Category</th>
                                                <th className="p-3.5">Space / Property</th>
                                                <th className="p-3.5">Assigned Technician</th>
                                                <th className="p-3.5">Requested Date</th>
                                                <th className="p-3.5">Status</th>
                                                <th className="p-3.5 text-right">Inspect</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredRequests.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                                        No maintenance requests matching search criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredRequests.map((ticket) => {
                                                    const isSelected = selectedItem?.data?.id === ticket.id;
                                                    return (
                                                        <tr
                                                            key={ticket.id}
                                                            onClick={() => handleSelectTicket(ticket)}
                                                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                                                                isSelected ? 'bg-sky-50/50 font-medium' : ''
                                                            }`}
                                                        >

                                                            <td className="p-3.5">
                                                                <span
                                                                    className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${getPriorityBadge(
                                                                        ticket.priority
                                                                    )}`}
                                                                >
                                                                    {ticket.priority}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5">
                                                                <p className="font-bold text-slate-900">{ticket.title}</p>
                                                                <p className="text-[10px] text-slate-400">{ticket.category}</p>
                                                            </td>
                                                            <td className="p-3.5">
                                                                <p className="font-semibold text-slate-800">{ticket.unit?.name || 'Common Area'}</p>
                                                                <p className="text-[10px] text-slate-400">{ticket.property?.name}</p>
                                                            </td>
                                                            <td className="p-3.5">
                                                                <span className="font-semibold text-slate-700">
                                                                    {ticket.assignedTo
                                                                        ? `${ticket.assignedTo.firstName || ''} ${ticket.assignedTo.lastName || ''}`.trim()
                                                                        : 'Unassigned'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5 text-slate-600">
                                                                {new Date(ticket.requestedAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-3.5">
                                                                <span
                                                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(
                                                                        ticket.status
                                                                    )}`}
                                                                >
                                                                    {ticket.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5 text-right">
                                                                <span className="font-semibold text-sky-600 hover:text-sky-800">
                                                                    Inspect →
                                                                </span>
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

                    {/* SECTION 3: STAFF & TECHNICIANS DIRECTORY */}
                    {activeTab === 'staff' && (
                        <div className="space-y-4">
                            <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                                <h4 className="text-sm font-bold text-sky-900">Maintenance Personnel & Workload</h4>
                                <p className="text-xs text-sky-700 mt-0.5">Assigned staff members, active work order counts, and contact information.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {staffList.map((staff) => (
                                    <div key={staff.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                                                    {staff.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">{staff.name}</h4>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                                                        {staff.role}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                                                {staff.openTicketsCount} Active
                                            </span>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{staff.email}</span>
                                            </div>
                                            {staff.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{staff.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* LEVEL 3 PERSISTENT DRAWER: TICKET INSPECTOR & FULL EDITING */}
                <PersistentDrawer
                    selectedItem={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onSave={handleSaveEdit}
                    customWidth="w-full sm:w-[480px] lg:w-[480px] xl:w-[520px]"
                    editFormContent={
                        selectedItem?.type === 'MAINTENANCE' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Ticket Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={ticketEditForm.title}
                                        onChange={(e) => setTicketEditForm({ ...ticketEditForm, title: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                                        <select
                                            value={ticketEditForm.category}
                                            onChange={(e) => setTicketEditForm({ ...ticketEditForm, category: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                                        >
                                            <option value="PLUMBING">PLUMBING</option>
                                            <option value="ELECTRICAL">ELECTRICAL</option>
                                            <option value="HVAC">HVAC / CLIMATE</option>
                                            <option value="APPLIANCE">APPLIANCE</option>
                                            <option value="STRUCTURAL">STRUCTURAL</option>
                                            <option value="PEST_CONTROL">PEST CONTROL</option>
                                            <option value="CLEANING">CLEANING</option>
                                            <option value="SECURITY">SECURITY / LOCKS</option>
                                            <option value="GENERAL">GENERAL REPAIR</option>
                                            <option value="OTHER">OTHER</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Priority</label>
                                        <select
                                            value={ticketEditForm.priority}
                                            onChange={(e) => setTicketEditForm({ ...ticketEditForm, priority: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                                        >
                                            <option value="LOW">LOW</option>
                                            <option value="MEDIUM">MEDIUM</option>
                                            <option value="HIGH">HIGH</option>
                                            <option value="URGENT">URGENT</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Workflow Status</label>
                                        <select
                                            value={ticketEditForm.status}
                                            onChange={(e) => setTicketEditForm({ ...ticketEditForm, status: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer font-bold text-slate-800"
                                        >
                                            <option value="REQUESTED">REQUESTED</option>
                                            <option value="REVIEWED">REVIEWED</option>
                                            <option value="IN_PROGRESS">IN PROGRESS</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                            <option value="CLOSED">CLOSED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Technician</label>
                                        <select
                                            value={ticketEditForm.assignedToUserId}
                                            onChange={(e) => setTicketEditForm({ ...ticketEditForm, assignedToUserId: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                                        >
                                            <option value="">(Unassigned)</option>
                                            {staffList.map((st) => (
                                                <option key={st.id} value={st.id}>
                                                    {st.firstName} {st.lastName} ({st.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Estimated Cost ($)</label>
                                        <input
                                            type="number"
                                            value={ticketEditForm.estimatedCost}
                                            onChange={(e) => setTicketEditForm({ ...ticketEditForm, estimatedCost: e.target.value })}
                                            placeholder="0"
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Actual Incurred ($)</label>
                                        <input
                                            type="number"
                                            value={ticketEditForm.actualCost}
                                            onChange={(e) => setTicketEditForm({ ...ticketEditForm, actualCost: e.target.value })}
                                            placeholder="0"
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Issue Description & Notes</label>
                                    <textarea
                                        rows={4}
                                        value={ticketEditForm.problemDescription}
                                        onChange={(e) => setTicketEditForm({ ...ticketEditForm, problemDescription: e.target.value })}
                                        placeholder="Describe the issue or technician resolution steps..."
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed"
                                    />
                                </div>
                            </div>
                        )
                    }
                >

                    {selectedItem?.type === 'MAINTENANCE' && (
                        <div className="space-y-4">
                            {/* Ticket Header Banner */}
                            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xs space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                                            {selectedItem.data.category} • {selectedItem.data.property?.name}
                                        </span>
                                        <h3 className="text-base font-bold text-white mt-0.5">{selectedItem.data.title}</h3>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${getStatusBadge(
                                            selectedItem.data.status
                                        )}`}
                                    >
                                        {selectedItem.data.status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                                    <span
                                        className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${getPriorityBadge(
                                            selectedItem.data.priority
                                        )}`}
                                    >
                                        {selectedItem.data.priority} Priority
                                    </span>
                                    <span className="text-[11px] text-slate-300">
                                        Logged {new Date(selectedItem.data.requestedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* LIFECYCLE 4-STEP PROGRESSION PIPELINE */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Work Order Stage Pipeline
                                </span>
                                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                                    {['REQUESTED', 'REVIEWED', 'IN_PROGRESS', 'COMPLETED'].map((st, idx) => {
                                        const stages = ['REQUESTED', 'REVIEWED', 'IN_PROGRESS', 'COMPLETED'];
                                        const currentIdx = stages.indexOf(selectedItem.data.status);
                                        const isDone = idx <= currentIdx && selectedItem.data.status !== 'CANCELLED';
                                        const isCurrent = idx === currentIdx;

                                        return (
                                            <div
                                                key={st}
                                                className={`p-1.5 rounded-lg border transition-all ${
                                                    isCurrent
                                                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                                        : isDone
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-white text-slate-400 border-slate-200'
                                                }`}
                                            >
                                                <span>{st.replace('_', ' ')}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Location & Tenant Card */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Location & Space</span>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-800">{selectedItem.data.unit?.name || 'Building Common Area'}</p>
                                        <p className="text-[11px] text-slate-500">{selectedItem.data.property?.name}</p>
                                    </div>
                                    {selectedItem.data.tenant && (
                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded-md text-slate-700">
                                            Occupant: {selectedItem.data.tenant.firstName || selectedItem.data.tenant.businessName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Problem Description */}
                            <div className="space-y-1.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">Issue Description</span>
                                <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                                    {selectedItem.data.problemDescription}
                                </div>
                            </div>

                            {/* Assigned Technician Card */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Assigned Technician</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAssignStaffId(selectedItem.data.assignedToUserId || staffList[0]?.id || '');
                                            setShowAssignModal(selectedItem.data);
                                        }}
                                        className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                                    >
                                        {selectedItem.data.assignedTo ? 'Reassign Staff' : '+ Assign Staff'}
                                    </button>
                                </div>

                                <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                                    {selectedItem.data.assignedTo ? (
                                        <div>
                                            <p className="font-bold text-slate-800">
                                                {selectedItem.data.assignedTo.firstName} {selectedItem.data.assignedTo.lastName}
                                            </p>
                                            <p className="text-[11px] text-slate-400">{selectedItem.data.assignedTo.email}</p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic">No technician assigned yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Review & Resolution Notes */}
                            {selectedItem.data.reviewNotes && (
                                <div className="space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block">Review Notes</span>
                                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                                        {selectedItem.data.reviewNotes}
                                    </div>
                                </div>
                            )}

                            {selectedItem.data.resolutionNotes && (
                                <div className="space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">Resolution Summary</span>
                                    <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                                        {selectedItem.data.resolutionNotes}
                                    </div>
                                </div>
                            )}

                            {/* ACTION BUTTONS */}
                            <div className="space-y-2 pt-2">
                                {selectedItem.data.status === 'REQUESTED' && (
                                    <button
                                        onClick={() => handleStatusTransition(selectedItem.data.id, 'REVIEWED')}
                                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                    >
                                        Mark as Reviewed & Dispatched
                                    </button>
                                )}

                                {selectedItem.data.status === 'REVIEWED' && (
                                    <button
                                        onClick={() => handleStatusTransition(selectedItem.data.id, 'IN_PROGRESS')}
                                        className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                    >
                                        Start Work (In Progress)
                                    </button>
                                )}

                                {selectedItem.data.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => setShowResolveModal(selectedItem.data)}
                                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                    >
                                        Mark as Completed & Resolved ✓
                                    </button>
                                )}

                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        onClick={() => handleDeleteTicket(selectedItem.data.id)}
                                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </PersistentDrawer>
            </div>

            {/* MODAL 1: ASSIGN STAFF */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-sky-600" /> Assign Technician
                            </h4>
                            <button onClick={() => setShowAssignModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAssignStaffSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Select Staff Member</label>
                                <select
                                    required
                                    value={assignStaffId}
                                    onChange={(e) => setAssignStaffId(e.target.value)}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                                >
                                    <option value="">Select Technician / Staff...</option>
                                    {staffList.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.role}) — {s.openTicketsCount} active tickets
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                                >
                                    Confirm Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: RESOLVE / COMPLETE WORK ORDER */}
            {showResolveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Complete & Resolve Work Order
                            </h4>
                            <button onClick={() => setShowResolveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Resolution Summary</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Explain work carried out, parts replaced, and inspection outcome..."
                                    value={resolveNotes}
                                    onChange={(e) => setResolveNotes(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowResolveModal(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                                >
                                    Mark as Resolved
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
