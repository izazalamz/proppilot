import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PersistentDrawer from '../components/common/PersistentDrawer';
import TableSkeleton from '../components/common/TableSkeleton';

import {
    FolderArchive,
    Megaphone,
    FileText,
    File,
    Image,
    Download,
    Plus,
    Search,
    Filter,
    Building2,
    Calendar,
    User,
    Tag,
    Trash2,
    ExternalLink,
    CheckCircle2,
    Clock,
    X,
    Bell,
    Send,
    Layers,
    SlidersHorizontal,
    Sparkles,
    ChevronDown,
    ChevronRight,
    Folder,
    FolderOpen,
    DoorClosed,
    LayoutGrid,
    ListTree,
} from 'lucide-react';

export default function DocumentsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Level 2 Section Tabs: 'vault' | 'notices'
    const [activeTab, setActiveTab] = useState('vault');
    const [vaultViewMode, setVaultViewMode] = useState('tree'); // 'tree' | 'grid'

    const [documents, setDocuments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [properties, setProperties] = useState([]);
    const [leases, setLeases] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [propertyFilter, setPropertyFilter] = useState('ALL');

    // Hierarchy Accordion State
    const [expandedProperties, setExpandedProperties] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});
    const [activeUnitId, setActiveUnitId] = useState(null);

    // Level 3 Persistent Drawer
    const [selectedItem, setSelectedItem] = useState(null); // { type: 'DOCUMENT' | 'ANNOUNCEMENT', data: {...} }
    const [isEditing, setIsEditing] = useState(false);

    // Substantial Creation Modality (Inline Expandable Panel for Documents)
    const [showInlineDocForm, setShowInlineDocForm] = useState(false);
    const [docForm, setDocForm] = useState({
        fileName: '',
        category: 'Lease Agreement',
        propertyId: '',
        leaseId: '',
        tenantId: '',
        fileSize: 245760,
        mimeType: 'application/pdf',
        fileUrl: '',
        description: '',
    });

    // Modals
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [noticeForm, setNoticeForm] = useState({
        propertyId: '',
        title: '',
        message: '',
        isPublished: true,
        expiresAt: '',
    });

    const [actionMessage, setActionMessage] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [docsRes, noticesRes, propRes, leasesRes, tenantsRes] = await Promise.all([
                api.get('/documents'),
                api.get('/documents/announcements'),
                api.get('/properties'),
                api.get('/tenants/leases'),
                api.get('/tenants'),
            ]);
            const docsData = docsRes.data.data || [];
            const propsData = propRes.data.data || [];

            setDocuments(docsData);
            setAnnouncements(noticesRes.data.data || []);
            setProperties(propsData);
            setLeases(leasesRes.data.data || []);
            setTenants(tenantsRes.data.data || []);

            // Set default expanded states for the first property and group
            if (propsData.length > 0) {
                const initialExpProps = {};
                const initialExpGroups = {};
                initialExpProps[propsData[0].id] = true;
                if (propsData[0].unitGroups?.length > 0) {
                    initialExpGroups[propsData[0].unitGroups[0].id] = true;
                    if (propsData[0].unitGroups[0].units?.length > 0) {
                        setActiveUnitId(propsData[0].unitGroups[0].units[0].id);
                    }
                }
                setExpandedProperties(initialExpProps);
                setExpandedGroups(initialExpGroups);

                if (!docForm.propertyId) setDocForm((prev) => ({ ...prev, propertyId: propsData[0].id }));
                if (!noticeForm.propertyId) setNoticeForm((prev) => ({ ...prev, propertyId: propsData[0].id }));
            }
        } catch (err) {
            console.error('Failed to load documents workspace data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Deep link detection (e.g. ?tab=notices&noticeId=...&search=...)
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const docIdParam = searchParams.get('docId');
        const noticeIdParam = searchParams.get('noticeId');
        const searchParam = searchParams.get('search');

        if (tabParam && ['vault', 'notices'].includes(tabParam)) {
            setActiveTab(tabParam);
        }

        if (searchParam) {
            setSearchTerm(searchParam);
        }

        if (docIdParam && documents.length > 0) {
            const found = documents.find((d) => d.id === docIdParam);
            if (found) setSelectedItem({ type: 'DOCUMENT', data: found });
        }

        if (noticeIdParam && announcements.length > 0) {
            const found = announcements.find((a) => a.id === noticeIdParam);
            if (found) setSelectedItem({ type: 'ANNOUNCEMENT', data: found });
        }
    }, [searchParams, documents, announcements]);


    // Accordion Toggle Handlers
    const togglePropertyAccordion = (propId) => {
        setExpandedProperties((prev) => ({ ...prev, [propId]: !prev[propId] }));
    };

    const toggleGroupAccordion = (groupId) => {
        setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    // KPI Calculations
    const totalFiles = documents.length;
    const leaseContractsCount = documents.filter((d) => d.category.includes('Lease') || d.category.includes('Contract')).length;
    const inspectionFilesCount = documents.filter((d) => d.category.includes('Inspection') || d.category.includes('Photo')).length;
    const publishedNoticesCount = announcements.filter((a) => a.isPublished).length;

    const summaryStats = [
        { label: 'Total Vault Files', value: totalFiles },
        { label: 'Lease & Contracts', value: leaseContractsCount },
        { label: 'Inspection Media', value: inspectionFilesCount },
        { label: 'Published Notices', value: publishedNoticesCount },
        { label: 'Covered Properties', value: properties.length },
    ];

    // Filter Documents for Flat Grid View
    const filteredDocs = documents.filter((doc) => {
        const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
        const matchesProp = propertyFilter === 'ALL' || doc.propertyId === propertyFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            doc.fileName.toLowerCase().includes(q) ||
            doc.category.toLowerCase().includes(q) ||
            (doc.description && doc.description.toLowerCase().includes(q)) ||
            (doc.property && doc.property.name.toLowerCase().includes(q)) ||
            (doc.lease?.unit && doc.lease.unit.name.toLowerCase().includes(q));

        return matchesCategory && matchesProp && matchesSearch;
    });

    // Filter Notices
    const filteredNotices = announcements.filter((notice) => {
        const matchesProp = propertyFilter === 'ALL' || notice.propertyId === propertyFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            notice.title.toLowerCase().includes(q) ||
            notice.message.toLowerCase().includes(q) ||
            (notice.property && notice.property.name.toLowerCase().includes(q));

        return matchesProp && matchesSearch;
    });

    // Handler: Create / Register Document
    const handleCreateDocumentSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                fileName: docForm.fileName,
                category: docForm.category,
                propertyId: docForm.propertyId || null,
                leaseId: docForm.leaseId || null,
                tenantId: docForm.tenantId || null,
                fileSize: Number(docForm.fileSize || 102400),
                mimeType: docForm.mimeType || 'application/pdf',
                fileUrl: docForm.fileUrl || `https://storage.proppilot.io/docs/${encodeURIComponent(docForm.fileName)}`,
                description: docForm.description || null,
            };

            const res = await api.post('/documents', payload);
            setShowInlineDocForm(false);
            setDocForm({
                fileName: '',
                category: 'Lease Agreement',
                propertyId: properties[0]?.id || '',
                leaseId: '',
                tenantId: '',
                fileSize: 245760,
                mimeType: 'application/pdf',
                fileUrl: '',
                description: '',
            });
            fetchData();
            setSelectedItem({ type: 'DOCUMENT', data: res.data.data });
            setActionMessage({ type: 'success', text: `Document "${payload.fileName}" uploaded to vault!` });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to upload document.');
        }
    };

    // Handler: Create Announcement
    const handleCreateNoticeSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                propertyId: noticeForm.propertyId,
                title: noticeForm.title,
                message: noticeForm.message,
                isPublished: noticeForm.isPublished,
                expiresAt: noticeForm.expiresAt || null,
            };

            const res = await api.post('/documents/announcements', payload);
            setShowNoticeModal(false);
            setNoticeForm({
                propertyId: properties[0]?.id || '',
                title: '',
                message: '',
                isPublished: true,
                expiresAt: '',
            });
            fetchData();
            setSelectedItem({ type: 'ANNOUNCEMENT', data: res.data.data });
            setActionMessage({ type: 'success', text: 'Announcement published to property notice board!' });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to publish announcement.');
        }
    };

    // Handler: Delete Document
    const handleDeleteDocument = async (id) => {
        if (!confirm('Are you sure you want to delete this document from the vault?')) return;
        try {
            await api.delete(`/documents/${id}`);
            setSelectedItem(null);
            fetchData();
            setActionMessage({ type: 'success', text: 'Document removed from vault.' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete document.');
        }
    };

    // Handler: Delete Announcement
    const handleDeleteNotice = async (id) => {
        if (!confirm('Are you sure you want to remove this announcement?')) return;
        try {
            await api.delete(`/documents/announcements/${id}`);
            setSelectedItem(null);
            fetchData();
            setActionMessage({ type: 'success', text: 'Announcement deleted.' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete announcement.');
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 KB';
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (category, mimeType) => {
        if (mimeType?.includes('image') || category.includes('Photo')) {
            return <Image className="w-5 h-5 text-indigo-500" />;
        }
        if (category.includes('Lease') || category.includes('Contract')) {
            return <FileText className="w-5 h-5 text-sky-500" />;
        }
        return <File className="w-5 h-5 text-slate-500" />;
    };

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
                                <FolderArchive className="w-7 h-7 text-sky-600" />
                                Documents Vault & Notice Board
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Hierarchical repository organized by Property → Unit Groups → Units with lease agreements, tenant KYC, and notice bulletins.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                onClick={() => setShowNoticeModal(true)}
                                className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                                <Megaphone className="w-4 h-4 text-amber-500" />
                                <span>Publish Notice</span>
                            </button>

                            <button
                                onClick={() => setShowInlineDocForm(!showInlineDocForm)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{showInlineDocForm ? 'Close Upload Form' : 'Upload Document'}</span>
                            </button>

                        </div>

                    </div>

                    {/* TOP OPERATIONAL KPI CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Vault Files</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{totalFiles}</p>
                            <span className="text-[11px] text-slate-500 block">Encrypted & categorized</span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">Lease & Contracts</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-sky-600">{leaseContractsCount}</p>
                            <span className="text-[11px] text-sky-700 font-semibold block">Signed legal agreements</span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Inspection & Media</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-indigo-600">{inspectionFilesCount}</p>
                            <span className="text-[11px] text-indigo-700 block">Condition logs & photos</span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Notice Board Bulletins</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-amber-600">{publishedNoticesCount}</p>
                            <span className="text-[11px] text-amber-700 block">Active announcements</span>
                        </div>
                    </div>

                    {/* SUBSTANTIAL CREATION PANEL: INLINE EXPANDABLE DOCUMENT UPLOADER */}
                    {showInlineDocForm && (
                        <form
                            onSubmit={handleCreateDocumentSubmit}
                            className="bg-white border-2 border-sky-500 rounded-2xl p-5 sm:p-6 shadow-md space-y-5 animate-in slide-in-from-top duration-200"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <FolderArchive className="w-4 h-4 text-sky-600" /> Upload & Register File to Vault
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Attach contracts, tenant ID scans, property deeds, and handover reports.</p>
                                </div>
                                <button type="button" onClick={() => setShowInlineDocForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Document File Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Signed_Lease_Apt101.pdf"
                                        value={docForm.fileName}
                                        onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Document Category</label>
                                    <select
                                        value={docForm.category}
                                        onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                                    >
                                        <option value="Lease Agreement">Lease Agreement & Contract</option>
                                        <option value="Tenant ID / KYC">Tenant Government ID / KYC</option>
                                        <option value="Property Deed">Property Deed & Title Document</option>
                                        <option value="Inspection Report">Move-in / Move-out Inspection</option>
                                        <option value="Invoice Receipt">Paid Invoice Receipt</option>
                                        <option value="Maintenance Photo">Maintenance Proof Photo</option>
                                        <option value="Utility Statement">Utility Bill Statement</option>
                                        <option value="General Document">General Document</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Associate Property</label>
                                    <select
                                        value={docForm.propertyId}
                                        onChange={(e) => setDocForm({ ...docForm, propertyId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                                    >
                                        <option value="">Select Property...</option>
                                        {properties.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Associate Unit & Active Lease (Optional)</label>
                                    <select
                                        value={docForm.leaseId}
                                        onChange={(e) => setDocForm({ ...docForm, leaseId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                                    >
                                        <option value="">None / Building-Wide Archival</option>
                                        {leases.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.unit?.name} — {l.tenant?.firstName || l.tenant?.businessName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase mb-1">Associate Tenant (Optional)</label>
                                    <select
                                        value={docForm.tenantId}
                                        onChange={(e) => setDocForm({ ...docForm, tenantId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                                    >
                                        <option value="">None</option>
                                        {tenants.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.tenantType === 'BUSINESS' ? t.businessName : `${t.firstName} ${t.lastName}`} ({t.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="text-xs">
                                <label className="block font-semibold text-slate-700 uppercase mb-1">Document Description & Tags</label>
                                <textarea
                                    rows={2}
                                    placeholder="Brief summary of the document, legal terms, or inspection notes..."
                                    value={docForm.description}
                                    onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setShowInlineDocForm(false)}
                                    className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                    Upload to Vault
                                </button>
                            </div>
                        </form>
                    )}

                    {/* LEVEL 2 HORIZONTAL NAVIGATION TABS */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 gap-3 pb-2 sm:pb-0">
                        <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">

                            <button
                                onClick={() => setActiveTab('vault')}
                                className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                    activeTab === 'vault'
                                        ? 'border-sky-600 text-sky-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <FolderArchive className="w-4 h-4" /> Documents Vault ({totalFiles})
                            </button>
                            <button
                                onClick={() => setActiveTab('notices')}
                                className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                    activeTab === 'notices'
                                        ? 'border-sky-600 text-sky-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Megaphone className="w-4 h-4" /> Property Notice Board ({announcements.length})
                            </button>
                        </div>

                        {/* View Switcher for Documents Vault */}
                        {activeTab === 'vault' && (
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-2 text-xs font-semibold">
                                <button
                                    onClick={() => setVaultViewMode('tree')}
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                                        vaultViewMode === 'tree' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <ListTree className="w-3.5 h-3.5" /> Accordion Tree
                                </button>
                                <button
                                    onClick={() => setVaultViewMode('grid')}
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                                        vaultViewMode === 'grid' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" /> Flat Grid
                                </button>
                            </div>
                        )}
                    </div>

                    {/* SECTION 1: DOCUMENTS VAULT */}
                    {activeTab === 'vault' && (
                        <div className="space-y-4">
                            {/* Filter & Search Toolbar */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="relative w-full md:w-72">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search document name, tags, spaces..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-slate-500 uppercase">Category:</span>
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 cursor-pointer"
                                        >
                                            <option value="ALL">All Categories</option>
                                            <option value="Lease Agreement">Lease Agreement</option>
                                            <option value="Tenant ID / KYC">Tenant ID / KYC</option>
                                            <option value="Property Deed">Property Deed</option>
                                            <option value="Inspection Report">Inspection Report</option>
                                            <option value="Invoice Receipt">Invoice Receipt</option>
                                            <option value="Maintenance Photo">Maintenance Photo</option>
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

                            {/* VIEW MODE A: ACCORDION HIERARCHICAL TREE (Property → Unit Groups → Units) */}
                            {vaultViewMode === 'tree' && (
                                <div className="space-y-4">
                                    {loading ? (
                                        <TableSkeleton rows={4} cols={4} />
                                    ) : properties.length === 0 ? (
                                        <div className="p-12 bg-white border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-400 italic">
                                            No properties registered in workspace.
                                        </div>
                                    ) : (
                                        properties
                                            .filter((p) => propertyFilter === 'ALL' || p.id === propertyFilter)
                                            .map((prop) => {
                                                const isPropExpanded = !!expandedProperties[prop.id];
                                                const propDocs = documents.filter((d) => d.propertyId === prop.id);
                                                const buildingWideDocs = propDocs.filter(
                                                    (d) => !d.lease?.unit?.id && !d.lease?.unitId && !d.maintenanceRequest?.unitId
                                                );

                                                return (
                                                    <div
                                                        key={prop.id}
                                                        className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all"
                                                    >
                                                        {/* PROPERTY ACCORDION HEADER */}
                                                        <div
                                                            onClick={() => togglePropertyAccordion(prop.id)}
                                                            className="p-4 bg-slate-50/80 hover:bg-slate-100/90 flex items-center justify-between cursor-pointer border-b border-slate-200 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
                                                                    <Building2 className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                                        {prop.name}
                                                                        <span className="text-[10px] font-semibold text-slate-500">
                                                                            ({prop.city || 'Property'})
                                                                        </span>
                                                                    </h3>
                                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                                        {prop.unitGroups?.length || 0} Unit Groups • {prop.units?.length || 0} Units •{' '}
                                                                        <span className="font-semibold text-slate-900">{propDocs.length} Documents</span>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <span className="px-3 py-1 text-xs font-bold bg-white text-slate-800 rounded-full border border-slate-200 shadow-xs">
                                                                    {propDocs.length} files
                                                                </span>
                                                                {isPropExpanded ? (
                                                                    <ChevronDown className="w-5 h-5 text-slate-600" />
                                                                ) : (
                                                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* PROPERTY ACCORDION BODY */}
                                                        {isPropExpanded && (
                                                            <div className="p-5 space-y-6 animate-in fade-in duration-150">
                                                                {/* 1. Building-Wide Documents Banner */}
                                                                {buildingWideDocs.length > 0 && (
                                                                    <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                                                                <Folder className="w-4 h-4 text-amber-500" /> Building-Wide Records & Deeds ({buildingWideDocs.length})
                                                                            </h4>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                            {buildingWideDocs.map((doc) => (
                                                                                <div
                                                                                    key={doc.id}
                                                                                    onClick={() => setSelectedItem({ type: 'DOCUMENT', data: doc })}
                                                                                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                                                                                >
                                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                                        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg shrink-0">
                                                                                            {getFileIcon(doc.category, doc.mimeType)}
                                                                                        </div>
                                                                                        <div className="truncate">
                                                                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                                                                {doc.fileName}
                                                                                            </p>
                                                                                            <span className="text-[10px] text-slate-400">
                                                                                                {doc.category} • {formatFileSize(doc.fileSize)}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <a
                                                                                        href={doc.fileUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg"
                                                                                    >
                                                                                        <Download className="w-4 h-4" />
                                                                                    </a>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* 2. Unit Groups & Assigned Units Section */}
                                                                <div className="space-y-4">
                                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                                        Spaces & Attached Documents by Unit Group
                                                                    </h4>

                                                                    {prop.unitGroups?.length === 0 ? (
                                                                        <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 italic">
                                                                            No unit groups configured for this property.
                                                                        </div>
                                                                    ) : (
                                                                        prop.unitGroups.map((group) => {
                                                                            const groupUnits = group.units || [];
                                                                            const groupDocs = documents.filter((d) =>
                                                                                groupUnits.some((u) => u.id === d.lease?.unit?.id || u.id === d.lease?.unitId || u.id === d.maintenanceRequest?.unitId)
                                                                            );

                                                                            return (
                                                                                <div
                                                                                    key={group.id}
                                                                                    className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-3"
                                                                                >
                                                                                    <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <FolderOpen className="w-4 h-4 text-slate-700" />
                                                                                            <span className="text-xs font-extrabold text-slate-900">
                                                                                                {group.name}
                                                                                            </span>
                                                                                            <span className="text-[10px] text-slate-500">
                                                                                                ({groupUnits.length} Units)
                                                                                            </span>
                                                                                        </div>
                                                                                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-white text-slate-700 border border-slate-200">
                                                                                            {groupDocs.length} Attached Files
                                                                                        </span>
                                                                                    </div>

                                                                                    {/* Units Directory in Group */}
                                                                                    <div className="space-y-2">
                                                                                        {groupUnits.map((unit) => {
                                                                                            const unitDocs = documents.filter(
                                                                                                (d) =>
                                                                                                    d.lease?.unit?.id === unit.id ||
                                                                                                    d.lease?.unitId === unit.id ||
                                                                                                    d.maintenanceRequest?.unitId === unit.id
                                                                                            );

                                                                                            return (
                                                                                                <div
                                                                                                    key={unit.id}
                                                                                                    className="p-3.5 bg-white border border-slate-200/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                                                                                                >
                                                                                                    <div className="flex items-center gap-3 min-w-[200px]">
                                                                                                        <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                                                                                                            <DoorClosed className="w-4 h-4" />
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <h5 className="text-xs font-bold text-slate-900">{unit.name}</h5>
                                                                                                            <span className="text-[10px] text-slate-500">
                                                                                                                Status: <span className="font-semibold text-slate-700">{unit.status}</span>
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* Attached Files List for this unit */}
                                                                                                    <div className="flex-1 flex flex-wrap items-center gap-2">
                                                                                                        {unitDocs.length === 0 ? (
                                                                                                            <span className="text-[11px] text-slate-400 italic">
                                                                                                                No documents uploaded for this unit
                                                                                                            </span>
                                                                                                        ) : (
                                                                                                            unitDocs.map((doc) => (
                                                                                                                <div
                                                                                                                    key={doc.id}
                                                                                                                    onClick={() => setSelectedItem({ type: 'DOCUMENT', data: doc })}
                                                                                                                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors"
                                                                                                                >
                                                                                                                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                                                                                                                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                                                                                                                        {doc.fileName}
                                                                                                                    </span>
                                                                                                                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-white text-slate-600 border border-slate-200">
                                                                                                                        {doc.category.split(' ')[0]}
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                            ))
                                                                                                        )}
                                                                                                    </div>

                                                                                                    {/* Upload Action */}
                                                                                                    <button
                                                                                                        onClick={() => {
                                                                                                            setDocForm((prev) => ({
                                                                                                                ...prev,
                                                                                                                propertyId: prop.id,
                                                                                                            }));
                                                                                                            setShowInlineDocForm(true);
                                                                                                        }}
                                                                                                        className="text-[11px] font-bold text-slate-700 hover:text-slate-950 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 self-end md:self-center"
                                                                                                    >
                                                                                                        + Upload File
                                                                                                    </button>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            )}
                            {/* VIEW MODE B: FLAT GRID VIEW */}
                            {vaultViewMode === 'grid' && (
                                <div>
                                    {loading ? (
                                        <TableSkeleton rows={4} cols={4} />
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filteredDocs.length === 0 ? (
                                                <div className="col-span-full p-12 bg-white border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-400 italic">
                                                    No documents found matching search criteria.
                                                </div>
                                            ) : (
                                                filteredDocs.map((doc) => {
                                                    const isSelected = selectedItem?.data?.id === doc.id;
                                                    return (
                                                        <div
                                                            key={doc.id}
                                                            onClick={() => setSelectedItem({ type: 'DOCUMENT', data: doc })}
                                                            className={`p-4 bg-white border rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between group ${
                                                                isSelected ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200'
                                                            }`}
                                                        >
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-sky-50 transition-colors">
                                                                        {getFileIcon(doc.category, doc.mimeType)}
                                                                    </div>
                                                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                                                        {doc.category}
                                                                    </span>
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-sky-600 transition-colors">
                                                                        {doc.fileName}
                                                                    </h4>
                                                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                                                                        {doc.description || 'Verified archival record in PropPilot vault.'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="pt-2.5 border-t border-slate-100 space-y-2">
                                                                <div className="flex justify-between items-center text-[10px] text-slate-400">
                                                                    <span>{formatFileSize(doc.fileSize)}</span>
                                                                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                                </div>

                                                                {doc.property && (
                                                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100 truncate">
                                                                        <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                                                        <span className="truncate">
                                                                            {doc.property.name} {doc.lease?.unit ? `• ${doc.lease.unit.name}` : ''}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 2: PROPERTY NOTICE BOARD */}
                    {activeTab === 'notices' && (
                        <div className="space-y-4">
                            {/* Toolbar */}
                            <div className="flex justify-between items-center bg-amber-50/70 p-4 rounded-xl border border-amber-200/60">
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                                        <Megaphone className="w-4 h-4 text-amber-600" /> Building Bulletins & Announcements
                                    </h4>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        Post maintenance advisories, schedule changes, and security notices to tenants across properties.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowNoticeModal(true)}
                                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                                >
                                    + Post Notice
                                </button>
                            </div>

                            {/* Notices Stream */}
                            <div className="space-y-3">
                                {filteredNotices.length === 0 ? (
                                    <div className="p-12 bg-white border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-400 italic">
                                        No active announcements posted.
                                    </div>
                                ) : (
                                    filteredNotices.map((notice) => {
                                        const isSelected = selectedItem?.data?.id === notice.id;
                                        return (
                                            <div
                                                key={notice.id}
                                                onClick={() => setSelectedItem({ type: 'ANNOUNCEMENT', data: notice })}
                                                className={`p-5 bg-white border rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 ${
                                                    isSelected ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                                                            <Bell className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-900">{notice.title}</h4>
                                                            <span className="text-[10px] text-slate-400 font-semibold">
                                                                {notice.property?.name} • Published {new Date(notice.publishedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                                                        Active Notice
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                                                    {notice.message}
                                                </p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* LEVEL 3 PERSISTENT DRAWER: INSPECTOR */}
                <PersistentDrawer
                    selectedItem={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    summaryTitle="Vault Summary"
                    summaryStats={summaryStats}
                    customWidth="w-full sm:w-[460px] lg:w-[460px] xl:w-[500px]"
                >
                    {selectedItem?.type === 'DOCUMENT' && (
                        <div className="space-y-4">
                            {/* Document Header */}
                            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xs space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                                            {selectedItem.data.category}
                                        </span>
                                        <h3 className="text-base font-bold text-white mt-0.5">{selectedItem.data.fileName}</h3>
                                    </div>
                                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-slate-700 text-slate-200">
                                        {formatFileSize(selectedItem.data.fileSize)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                                    <span className="text-slate-300">
                                        Uploaded {new Date(selectedItem.data.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-slate-400 font-mono text-[10px]">
                                        {selectedItem.data.mimeType}
                                    </span>
                                </div>
                            </div>

                            {/* Associated Space & Tenant Card */}
                            {selectedItem.data.property && (
                                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Associated Space</span>
                                    <p className="font-bold text-slate-800">{selectedItem.data.property.name}</p>
                                    {selectedItem.data.lease?.unit && (
                                        <p className="text-[11px] text-slate-600">Unit: {selectedItem.data.lease.unit.name}</p>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            {selectedItem.data.description && (
                                <div className="space-y-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">File Notes</span>
                                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                                        {selectedItem.data.description}
                                    </div>
                                </div>
                            )}

                            {/* ACTION BUTTONS */}
                            <div className="space-y-2 pt-2">
                                <a
                                    href={selectedItem.data.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Download className="w-4 h-4" /> Download / Open Document
                                </a>

                                <button
                                    onClick={() => handleDeleteDocument(selectedItem.data.id)}
                                    className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete File from Vault
                                </button>
                            </div>
                        </div>
                    )}

                    {selectedItem?.type === 'ANNOUNCEMENT' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-xs space-y-2">
                                <span className="text-[10px] uppercase font-bold text-amber-100 tracking-wider">
                                    Notice Bulletin
                                </span>
                                <h3 className="text-base font-bold text-white">{selectedItem.data.title}</h3>
                                <p className="text-[11px] text-amber-100">
                                    Target: {selectedItem.data.property?.name}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">Message Body</span>
                                <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                                    {selectedItem.data.message}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => handleDeleteNotice(selectedItem.data.id)}
                                    className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Announcement
                                </button>
                            </div>
                        </div>
                    )}
                </PersistentDrawer>
            </div>

            {/* MODAL: PUBLISH ANNOUNCEMENT */}
            {showNoticeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-amber-500" /> Publish Property Notice
                            </h4>
                            <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateNoticeSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Target Property</label>
                                <select
                                    required
                                    value={noticeForm.propertyId}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, propertyId: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                                >
                                    {properties.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Notice Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Scheduled Water Pressure Fluctuation"
                                    value={noticeForm.title}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Announcement Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Full details of the notice for tenants..."
                                    value={noticeForm.message}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowNoticeModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                                >
                                    Publish Bulletin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
