import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import api from '../api/axios';
import TableSkeleton from '../components/common/TableSkeleton';

import {
    Building,
    Building2,
    Users,
    Receipt,
    Wrench,
    FolderArchive,
    Megaphone,
    LogOut,
    CreditCard,
    DollarSign,
    Calendar,
    CheckCircle2,
    Clock,
    Plus,
    X,
    Download,
    ExternalLink,
    AlertCircle,
    Bell,
    FileText,
    Shield,
    Sparkles,
    Check,
    User,
    Phone,
    Mail,
    ArrowRight,
    Settings,
} from 'lucide-react';

export default function TenantPortalPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, managerialWorkspaces, hasManagementAccess, switchWorkspace, logout } = useAuth();

    const [portalData, setPortalData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Tabs: 'invoices' | 'maintenance' | 'notices' | 'documents'
    const [activeTab, setActiveTab] = useState('invoices');

    // Modals
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [maintenanceForm, setMaintenanceForm] = useState({
        title: '',
        category: 'Plumbing',
        priority: 'MEDIUM',
        problemDescription: '',
    });

    const [showPaymentModal, setShowPaymentModal] = useState(null); // Invoice object or null
    const [paymentSession, setPaymentSession] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [actionMessage, setActionMessage] = useState(null);

    const [leaseDropdownOpen, setLeaseDropdownOpen] = useState(false);
    const leaseDropdownRef = useRef(null);


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (leaseDropdownRef.current && !leaseDropdownRef.current.contains(e.target)) {
                setLeaseDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const fetchPortalData = async (targetLeaseId = null) => {
        setLoading(true);
        try {
            const url = targetLeaseId ? `/portal/overview?leaseId=${encodeURIComponent(targetLeaseId)}` : '/portal/overview';
            const res = await api.get(url);
            setPortalData(res.data.data);
        } catch (err) {
            console.error('Failed to load tenant portal data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortalData();
        const paymentStatus = searchParams.get('payment');
        const invoiceId = searchParams.get('invoiceId');
        if (paymentStatus === 'success') {
            setActionMessage({
                type: 'success',
                text: `Payment confirmed successfully! Invoice #${invoiceId || ''} settled.`,
            });
            setTimeout(() => setActionMessage(null), 5000);
        }
    }, []);



    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Handler: Submit Maintenance Ticket
    const handleCreateMaintenance = async (e) => {
        e.preventDefault();
        try {
            await api.post('/portal/maintenance', maintenanceForm);
            setShowMaintenanceModal(false);
            setMaintenanceForm({
                title: '',
                category: 'Plumbing',
                priority: 'MEDIUM',
                problemDescription: '',
            });
            fetchPortalData();
            setActionMessage({ type: 'success', text: 'Repair request submitted to property management!' });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit repair ticket.');
        }
    };

    // Handler: Initiate SSLCommerz Session
    const handleInitPayment = async (invoice) => {
        setShowPaymentModal(invoice);
        setPaymentSession(null);
        setIsSubmittingPayment(true);
        try {
            const res = await api.post(`/portal/invoices/${invoice.id}/sslcommerz/init`);
            setPaymentSession(res.data.data);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to initialize payment gateway.');
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    // Handler: Instant Sandbox Payment Confirmation
    const handleCompletePaymentSimulation = async () => {
        if (!showPaymentModal || !paymentSession) return;
        setIsSubmittingPayment(true);
        try {
            const due = Number(showPaymentModal.totalAmount) - Number(showPaymentModal.paidAmount);
            await api.post('/finance/payments', {
                invoiceId: showPaymentModal.id,
                amount: due,
                paymentMethod: 'SSLCOMMERZ',
                remarks: `Paid via SSLCommerz Sandbox (${paymentMethod.toUpperCase()}) by ${portalData?.tenant?.name}`,
            });

            setShowPaymentModal(null);
            setPaymentSession(null);
            fetchPortalData();
            setActionMessage({ type: 'success', text: `Invoice #${showPaymentModal.invoiceNumber} paid successfully!` });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err) {
            alert(err.response?.data?.error || 'Payment failed.');
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <TableSkeleton rows={6} cols={4} />
            </div>
        );
    }

    if (!portalData || !portalData.hasActiveLease) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 space-y-5">
                <div className="p-4 bg-sky-50 text-sky-600 rounded-3xl border border-sky-100 shadow-xs">
                    <Building className="w-10 h-10" />
                </div>
                <div className="text-center space-y-1.5 max-w-md">
                    <h2 className="text-xl font-black text-slate-900">
                        {hasManagementAccess ? 'No Resident Lease on File' : 'No Active Lease Profile Found'}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        {hasManagementAccess
                            ? `Your account (${user?.email}) is currently configured as a Portfolio Manager/Owner. To view residential tenant contracts, an active apartment lease must be linked to your email.`
                            : `Your account (${user?.email}) is not currently linked to an active apartment lease agreement. Please contact your property manager to finalize your rental assignment.`}
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {hasManagementAccess && (
                        <button
                            onClick={() => {
                                if (managerialWorkspaces.length > 0) {
                                    switchWorkspace(managerialWorkspaces[0].id, '/dashboard');
                                } else {
                                    navigate('/dashboard');
                                }
                            }}
                            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
                        >
                            <Building2 className="w-4 h-4 text-sky-400" /> Return to Management Dashboard
                        </button>
                    )}
                    <button
                        onClick={() => fetchPortalData()}
                        className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                    >
                        ↻ Refresh
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                        <Settings className="w-3.5 h-3.5 text-slate-500" /> Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                </div>
            </div>
        );
    }

    const tenant = portalData?.tenant || {};
    const space = portalData?.space || {};
    const financials = portalData?.financials || { totalInvoiced: 0, totalPaid: 0, outstandingDue: 0, invoices: [] };
    const maintenanceRequests = portalData?.maintenanceRequests || [];
    const announcements = portalData?.announcements || [];
    const documents = portalData?.documents || [];


    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
            {/* WORKSPACE BANNER & ALERTS */}
            {actionMessage && (
                <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between shadow-xs sticky top-0 z-50">
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {actionMessage.text}
                    </span>
                    <button onClick={() => setActionMessage(null)} className="text-emerald-100 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* TOP TENANT NAVBAR */}
            <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between shadow-xs shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-950 text-white p-2 rounded-xl shadow-xs">
                        <Building className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-base tracking-wide text-slate-900 flex items-center gap-2">
                            PropPilot <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">Resident Portal</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 text-xs">
                    <div className="hidden sm:flex items-center gap-2 text-slate-700">
                        <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs">
                            {tenant.name?.[0] || 'T'}
                        </div>
                        <span className="font-bold">{tenant.name}</span>
                        <span className="text-slate-400">({space?.unitName})</span>
                    </div>

                    {hasManagementAccess && (
                        <button
                            onClick={() => {
                                if (managerialWorkspaces.length > 0) {
                                    switchWorkspace(managerialWorkspaces[0].id, '/dashboard');
                                } else {
                                    navigate('/dashboard');
                                }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer font-semibold shadow-xs"
                            title="Switch to property management workspace (Owner/Manager view)"
                        >
                            <Building2 className="w-3.5 h-3.5 text-sky-400" />
                            <span className="hidden sm:inline">Management View</span>
                        </button>
                    )}


                    <button
                        onClick={() => navigate('/settings')}
                        title="Account Settings"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Settings</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>

            </header>

            {/* MAIN PORTAL BODY */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-6">
                {/* MULTI-LEASE RENTAL SELECTOR (If User Rents Multiple Apartments) */}
                {portalData.availableLeases && portalData.availableLeases.length > 1 && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-sky-50 text-sky-700 rounded-2xl shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                    Switch Rented Apartment ({portalData.availableLeases.length} Active Leases)
                                </span>
                                <p className="text-xs font-bold text-slate-800">
                                    You have multiple active apartment leases across portfolios.
                                </p>
                            </div>
                        </div>

                        {/* CUSTOM INTERACTIVE LEASE DROPDOWN */}
                        <div className="relative w-full sm:w-auto min-w-[320px]" ref={leaseDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setLeaseDropdownOpen(!leaseDropdownOpen)}
                                className={`
                                    w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-2xs
                                    ${
                                        leaseDropdownOpen
                                            ? 'bg-sky-50/60 border-sky-400 ring-2 ring-sky-100'
                                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300'
                                    }
                                `}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-900 truncate">
                                        📍 {space?.unitName} — {space?.propertyName}
                                    </div>
                                    <div className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                                        {space?.accountName || 'Portfolio'} • ${space?.monthlyRent?.toLocaleString()}/mo
                                    </div>
                                </div>
                                <div className={`p-1 text-slate-400 transition-transform duration-200 shrink-0 ${leaseDropdownOpen ? 'rotate-180 text-sky-600' : ''}`}>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </button>

                            {/* FLOATING LEASE POPOVER */}
                            {leaseDropdownOpen && (
                                <div className="absolute right-0 sm:left-auto left-0 top-full mt-2 w-full sm:w-[380px] bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Select Leased Space
                                    </div>
                                    <div className="mt-1 space-y-1 max-h-[260px] overflow-y-auto">
                                        {portalData.availableLeases.map((lease) => {
                                            const isSelected = lease.id === portalData.selectedLeaseId;
                                            return (
                                                <button
                                                    key={lease.id}
                                                    type="button"
                                                    onClick={() => {
                                                        fetchPortalData(lease.id);
                                                        setLeaseDropdownOpen(false);
                                                    }}
                                                    className={`
                                                        w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer
                                                        ${
                                                            isSelected
                                                                ? 'bg-sky-50 text-sky-950 border border-sky-200 shadow-2xs font-semibold'
                                                                : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                                                        }
                                                    `}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-slate-900 truncate">
                                                            {lease.unitName} — {lease.propertyName}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                                            {lease.accountName} • ${Number(lease.rentAmount).toLocaleString()}/mo
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="p-1 text-sky-600 shrink-0">
                                                            <Check className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* RENTED SPACE & BALANCE OVERVIEW BANNER */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                                Active Resident Lease
                            </span>
                            <span className="text-xs text-slate-400">Lease ID: {space?.leaseId?.slice(0, 8)}...</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            {space?.unitName} — {space?.propertyName}
                        </h2>
                        <p className="text-xs text-slate-500 flex items-center gap-4 flex-wrap">
                            <span>Portfolio: <b>{space?.accountName || 'Primary Workspace'}</b></span>
                            <span>Type: <b>{space?.unitTypeName || 'Apartment'}</b></span>
                            <span>Group: <b>{space?.unitGroupName || 'Primary'}</b></span>

                            <span>Monthly Rent: <b>${space?.monthlyRent?.toLocaleString()}</b></span>
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 min-w-[240px] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Total Outstanding Due
                        </span>
                        <p className={`text-2xl font-extrabold ${financials.outstandingDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            ${financials.outstandingDue?.toLocaleString()}
                        </p>
                        <span className="text-[11px] text-slate-500">
                            {financials.outstandingDue === 0 ? '✓ All invoices fully settled' : 'Payment required'}
                        </span>
                    </div>
                </div>

                {/* HORIZONTAL SECTION TABS */}
                <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-xs font-bold overflow-x-auto no-scrollbar whitespace-nowrap">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'invoices' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Receipt className="w-4 h-4" /> My Invoices & Payments ({financials.invoices.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'maintenance' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Wrench className="w-4 h-4" /> Maintenance Requests ({maintenanceRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('notices')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'notices' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Megaphone className="w-4 h-4" /> Building Notices ({announcements.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'documents' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <FolderArchive className="w-4 h-4" /> My Lease & Files ({documents.length})
                    </button>
                </div>

                {/* TAB 1: INVOICES & PAYMENTS */}
                {activeTab === 'invoices' && (
                    <div className="space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">Invoice #</th>
                                        <th className="p-4">Billing Month</th>
                                        <th className="p-4">Line Items</th>
                                        <th className="p-4">Total Amount</th>
                                        <th className="p-4">Paid</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {financials.invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                                No invoices generated for this unit yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        financials.invoices.map((inv) => {
                                            const isPaid = inv.status === 'PAID';
                                            const due = Number(inv.totalAmount) - Number(inv.paidAmount);

                                            return (
                                                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="p-4 font-bold text-slate-900 font-mono">{inv.invoiceNumber}</td>
                                                    <td className="p-4">
                                                        {new Date(inv.issueDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-0.5">
                                                            {inv.items?.map((item, idx) => (
                                                                <span key={idx} className="block text-[11px] text-slate-500">
                                                                    • {item.chargeType?.name || 'Charge'}: ${Number(item.amount)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-bold text-slate-900">${Number(inv.totalAmount)?.toLocaleString()}</td>
                                                    <td className="p-4 text-emerald-600 font-semibold">${Number(inv.paidAmount)?.toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                                                                isPaid
                                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                                            }`}
                                                        >
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {!isPaid ? (
                                                            <button
                                                                onClick={() => handleInitPayment(inv)}
                                                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer text-xs"
                                                            >
                                                                <CreditCard className="w-3.5 h-3.5" />
                                                                <span>Pay ${due}</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-emerald-600 text-xs font-semibold flex items-center justify-end gap-1">
                                                                <Check className="w-3.5 h-3.5" /> Settled
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: MAINTENANCE REQUESTS */}
                {activeTab === 'maintenance' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Unit Maintenance & Repair Requests</h3>
                                <p className="text-xs text-slate-500">Log issues with plumbing, AC, electrical, or fixtures in your unit.</p>
                            </div>
                            <button
                                onClick={() => setShowMaintenanceModal(true)}
                                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Submit Repair Request</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {maintenanceRequests.length === 0 ? (
                                <div className="col-span-full p-12 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 italic">
                                    No maintenance requests logged. All fixtures operating properly.
                                </div>
                            ) : (
                                maintenanceRequests.map((req) => (
                                    <div key={req.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                                    {req.category}
                                                </span>
                                                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{req.title}</h4>
                                            </div>
                                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                                {req.status}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {req.problemDescription}
                                        </p>

                                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                                            <span>Logged {new Date(req.requestedAt).toLocaleDateString()}</span>
                                            <span>
                                                Assigned: {req.assignedTo ? `${req.assignedTo.firstName} ${req.assignedTo.lastName}` : 'Queued'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: BUILDING NOTICES */}
                {activeTab === 'notices' && (
                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl">
                            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-amber-600" /> Building Notice Board
                            </h3>
                            <p className="text-xs text-amber-800/80 mt-0.5">Official advisories and announcements from your property manager.</p>
                        </div>

                        <div className="space-y-3">
                            {announcements.length === 0 ? (
                                <div className="p-12 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 italic">
                                    No active notices posted for your property.
                                </div>
                            ) : (
                                announcements.map((notice) => (
                                    <div key={notice.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-900">{notice.title}</h4>
                                            <span className="text-[10px] text-slate-400 font-semibold">
                                                {new Date(notice.publishedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {notice.message}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 4: DOCUMENTS */}
                {activeTab === 'documents' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.length === 0 ? (
                                <div className="col-span-full p-12 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 italic">
                                    No documents attached.
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="truncate">
                                                <h5 className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</h5>
                                                <span className="text-[10px] text-slate-400">{doc.category}</span>
                                            </div>
                                        </div>

                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
                                            title="Download File"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL 1: SUBMIT REPAIR REQUEST */}
            {showMaintenanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs text-slate-700 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-slate-800" /> Log Unit Maintenance Request
                            </h4>
                            <button onClick={() => setShowMaintenanceModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMaintenance} className="space-y-4">
                            <div>
                                <label className="block text-slate-700 font-semibold uppercase mb-1">Issue Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Bathroom faucet dripping, AC cooling low"
                                    value={maintenanceForm.title}
                                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold uppercase mb-1">Category</label>
                                    <select
                                        value={maintenanceForm.category}
                                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, category: e.target.value })}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900"
                                    >
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="HVAC & Cooling">HVAC / Cooling</option>
                                        <option value="Carpentry & Locks">Locks & Doors</option>
                                        <option value="Appliance">Appliance</option>
                                        <option value="General Upkeep">General</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-semibold uppercase mb-1">Priority</label>
                                    <select
                                        value={maintenanceForm.priority}
                                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent (Emergency)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold uppercase mb-1">Problem Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Provide details of the problem and where it is located..."
                                    value={maintenanceForm.problemDescription}
                                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, problemDescription: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowMaintenanceModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: SSLCOMMERZ CHECKOUT FOR TENANT */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-xs text-slate-700 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-emerald-600" /> SSLCommerz Payment Gateway
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Invoice #{showPaymentModal.invoiceNumber} • Unit {space.unitName}
                                </p>
                            </div>
                            <button onClick={() => setShowPaymentModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Payable Amount</span>
                                <p className="text-2xl font-extrabold text-emerald-600">
                                    ${Number(showPaymentModal.totalAmount) - Number(showPaymentModal.paidAmount)}
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                SSLCommerz Sandbox
                            </span>
                        </div>

                        {/* LIVE GATEWAY URL LINK */}
                        {paymentSession?.sessionUrl && (
                            <a
                                href={paymentSession.sessionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                            >
                                <span>🚀 Launch SSLCommerz Gateway Page</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}

                        <div className="space-y-3 pt-1 border-t border-slate-100">
                            <span className="text-slate-600 font-bold block">Or Simulate Sandbox Checkout:</span>
                            <div className="grid grid-cols-3 gap-2">
                                {['bkash', 'nagad', 'visa'].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setPaymentMethod(m)}
                                        className={`p-2.5 rounded-xl border text-center font-bold uppercase transition-all cursor-pointer ${
                                            paymentMethod === m
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleCompletePaymentSimulation}
                                disabled={isSubmittingPayment}
                                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer text-xs"
                            >
                                {isSubmittingPayment ? 'Processing Sandbox Transaction...' : `Confirm Demo Payment (${paymentMethod.toUpperCase()})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
