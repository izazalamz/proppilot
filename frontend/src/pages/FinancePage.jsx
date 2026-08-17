import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PersistentDrawer from '../components/common/PersistentDrawer';
import TableSkeleton from '../components/common/TableSkeleton';

import {
    Receipt,
    CreditCard,
    Plus,
    Search,
    ChevronDown,
    SlidersHorizontal,
    Filter,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Printer,
    FileText,
    Layers,
    User,
    Building,
    Building2,
    X,
    ExternalLink,
    Tag,
    Zap,
    Send,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Trash2,
    Smartphone,
    Landmark,
} from 'lucide-react';

export default function FinancePage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Level 2 Section Tabs: 'invoices' | 'payments' | 'chargeTypes'
    const [activeTab, setActiveTab] = useState('invoices');
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [chargeTypes, setChargeTypes] = useState([]);
    const [leases, setLeases] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [propertyFilter, setPropertyFilter] = useState('ALL');

    // Level 3 Persistent Drawer
    const [selectedItem, setSelectedItem] = useState(null); // { type: 'INVOICE' | 'PAYMENT' | 'CHARGE_TYPE', data: {...} }
    const [isEditing, setIsEditing] = useState(false);

    // Substantial Creation Modality (Inline Expandable Panel)
    const [showInlineForm, setShowInlineForm] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({
        leaseId: '',
        invoiceNumber: '',
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        discount: 0,
        notes: '',
        items: [{ chargeTypeId: '', description: '', quantity: 1, unitPrice: 0 }],
    });

    // In-Drawer Add Line Item Form
    const [showAddItemDrawerForm, setShowAddItemDrawerForm] = useState(false);
    const [newItemDrawerForm, setNewItemDrawerForm] = useState({
        chargeTypeId: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
    });

    // Modals
    const [showPaymentModal, setShowPaymentModal] = useState(null); // Invoice object or null
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentMethod: 'CASH',
        paymentDate: new Date().toISOString().slice(0, 10),
        transactionReference: '',
        remarks: '',
    });

    const [showChargeTypeModal, setShowChargeTypeModal] = useState(false);
    const [chargeTypeForm, setChargeTypeForm] = useState({
        name: '',
        description: '',
        isRecurring: true,
        defaultAmount: '',
    });

    const [showMonthlyBatchModal, setShowMonthlyBatchModal] = useState(false);
    const [batchForm, setBatchForm] = useState({
        billingMonth: new Date().toISOString().slice(0, 7),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });

    // SSLCommerz Interactive Gateway Modal
    const [sslcommerzModal, setSslcommerzModal] = useState(null);
    const [gatewayTab, setGatewayTab] = useState('mobile'); // 'cards' | 'mobile' | 'bank'
    const [selectedGatewayMethod, setSelectedGatewayMethod] = useState('bKash');
    const [simulatedAccountInput, setSimulatedAccountInput] = useState('01711223344');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const [actionMessage, setActionMessage] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, payRes, ctRes, leasesRes, propRes] = await Promise.all([
                api.get('/finance/invoices'),
                api.get('/finance/payments'),
                api.get('/finance/charge-types'),
                api.get('/tenants/leases'),
                api.get('/properties'),
            ]);
            setInvoices(invRes.data.data || []);
            setPayments(payRes.data.data || []);
            setChargeTypes(ctRes.data.data || []);
            setLeases(leasesRes.data.data || []);
            setProperties(propRes.data.data || []);

            if (ctRes.data.data?.length > 0) {
                if (!invoiceForm.items[0].chargeTypeId) {
                    setInvoiceForm((prev) => ({
                        ...prev,
                        items: [{ ...prev.items[0], chargeTypeId: ctRes.data.data[0].id, unitPrice: Number(ctRes.data.data[0].defaultAmount || 0) }],
                    }));
                }
                if (!newItemDrawerForm.chargeTypeId) {
                    setNewItemDrawerForm({
                        chargeTypeId: ctRes.data.data[0].id,
                        description: '',
                        quantity: 1,
                        unitPrice: Number(ctRes.data.data[0].defaultAmount || 0),
                    });
                }
            }
        } catch (err) {
            console.error('Failed to load finance workspace data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Deep link detection (e.g. ?tab=invoices&invoiceId=...&search=...)
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const invoiceIdParam = searchParams.get('invoiceId');
        const paymentParam = searchParams.get('payment');
        const searchParam = searchParams.get('search');

        if (tabParam && ['invoices', 'payments', 'chargeTypes'].includes(tabParam)) {
            setActiveTab(tabParam);
        }

        if (searchParam) {
            setSearchTerm(searchParam);
        }

        if (invoiceIdParam && invoices.length > 0) {
            const found = invoices.find((inv) => inv.id === invoiceIdParam);
            if (found) setSelectedItem({ type: 'INVOICE', data: found });
        }

        if (paymentParam === 'success') {
            setActionMessage({ type: 'success', text: 'Payment successfully confirmed via SSLCommerz Gateway!' });
            setTimeout(() => setActionMessage(null), 5000);
        }
    }, [searchParams, invoices]);

    // Drawer Edit State & Handler
    const [invoiceEditForm, setInvoiceEditForm] = useState({
        dueDate: '',
        status: 'UNPAID',
        discount: 0,
        notes: '',
    });

    const handleSelectInvoice = (inv) => {
        setSelectedItem({ type: 'INVOICE', data: inv });
        setInvoiceEditForm({
            dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : '',
            status: inv.status || 'UNPAID',
            discount: Number(inv.discount || 0),
            notes: inv.notes || '',
        });
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        if (!selectedItem?.data?.id) return;
        try {
            const res = await api.put(`/finance/invoices/${selectedItem.data.id}`, {
                ...invoiceEditForm,
                discount: Number(invoiceEditForm.discount || 0),
            });
            setIsEditing(false);
            fetchData();
            if (res.data?.data) {
                setSelectedItem({ type: 'INVOICE', data: res.data.data });
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update invoice.');
        }
    };

    // Financial KPI Computations
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
    const totalOutstanding = Math.max(0, totalInvoiced - totalCollected);
    const overdueCount = invoices.filter((inv) => inv.status === 'OVERDUE' || (inv.status === 'UNPAID' && new Date(inv.dueDate) < new Date())).length;
    const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;


    const summaryStats = [
        { label: 'Total Invoiced', value: `$${totalInvoiced.toLocaleString()}` },
        { label: 'Total Collected', value: `$${totalCollected.toLocaleString()}` },
        { label: 'Outstanding Balance', value: `$${totalOutstanding.toLocaleString()}` },
        { label: 'Collection Rate', value: `${collectionRate}%` },
        { label: 'Active Invoices', value: invoices.length },
        { label: 'Overdue Invoices', value: overdueCount },
    ];

    // Handlers for Invoice Creation Form
    const handleAddLineItem = () => {
        const defaultCt = chargeTypes[0];
        setInvoiceForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    chargeTypeId: defaultCt?.id || '',
                    description: '',
                    quantity: 1,
                    unitPrice: Number(defaultCt?.defaultAmount || 0),
                },
            ],
        }));
    };

    const handleRemoveLineItem = (index) => {
        if (invoiceForm.items.length <= 1) return;
        setInvoiceForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, idx) => idx !== index),
        }));
    };

    const handleLineItemChange = (index, field, value) => {
        setInvoiceForm((prev) => {
            const updatedItems = [...prev.items];
            updatedItems[index] = { ...updatedItems[index], [field]: value };

            if (field === 'chargeTypeId') {
                const matchedCt = chargeTypes.find((ct) => ct.id === value);
                if (matchedCt && matchedCt.defaultAmount) {
                    updatedItems[index].unitPrice = Number(matchedCt.defaultAmount);
                }
            }
            return { ...prev, items: updatedItems };
        });
    };

    const calculateFormSubtotal = () => {
        return invoiceForm.items.reduce((sum, item) => sum + Number(item.quantity || 1) * Number(item.unitPrice || 0), 0);
    };

    const handleCreateInvoiceSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                leaseId: invoiceForm.leaseId,
                invoiceNumber: invoiceForm.invoiceNumber || undefined,
                issueDate: invoiceForm.issueDate,
                dueDate: invoiceForm.dueDate,
                discount: Number(invoiceForm.discount || 0),
                notes: invoiceForm.notes,
                items: invoiceForm.items.map((item) => ({
                    chargeTypeId: item.chargeTypeId,
                    description: item.description || 'Charge',
                    quantity: Number(item.quantity || 1),
                    unitPrice: Number(item.unitPrice || 0),
                })),
            };

            const res = await api.post('/finance/invoices', payload);
            setShowInlineForm(false);
            fetchData();
            setSelectedItem({ type: 'INVOICE', data: res.data.data });
            setActionMessage({ type: 'success', text: `Invoice #${res.data.data.invoiceNumber} created successfully!` });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create invoice.');
        }
    };

    // Handler: Batch Monthly Invoices
    const handleBatchGenerateSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/finance/invoices/generate-monthly', batchForm);
            setShowMonthlyBatchModal(false);
            fetchData();
            setActionMessage({ type: 'success', text: res.data.message });
            setTimeout(() => setActionMessage(null), 5000);
        } catch (err) {
            alert(err.response?.data?.error || 'Batch generation failed.');
        }
    };

    // Handler: Dynamic In-Drawer Add Charge Item
    const handleAddLineItemToInvoiceSubmit = async (e) => {
        e.preventDefault();
        if (!selectedItem?.data?.id) return;
        try {
            const res = await api.post(`/finance/invoices/${selectedItem.data.id}/items`, {
                chargeTypeId: newItemDrawerForm.chargeTypeId,
                description: newItemDrawerForm.description || 'Additional Charge',
                quantity: Number(newItemDrawerForm.quantity || 1),
                unitPrice: Number(newItemDrawerForm.unitPrice || 0),
            });
            setSelectedItem({ type: 'INVOICE', data: res.data.data });
            setShowAddItemDrawerForm(false);
            setNewItemDrawerForm({
                chargeTypeId: chargeTypes[0]?.id || '',
                description: '',
                quantity: 1,
                unitPrice: Number(chargeTypes[0]?.defaultAmount || 0),
            });
            fetchData();
            setActionMessage({ type: 'success', text: 'Charge item added to invoice successfully!' });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add charge item.');
        }
    };

    // Handler: Delete Line Item from Invoice
    const handleDeleteLineItem = async (itemId) => {
        if (!selectedItem?.data?.id) return;
        if (!confirm('Are you sure you want to remove this charge item?')) return;
        try {
            const res = await api.delete(`/finance/invoices/${selectedItem.data.id}/items/${itemId}`);
            setSelectedItem({ type: 'INVOICE', data: res.data.data });
            fetchData();
            setActionMessage({ type: 'success', text: 'Line item removed.' });
            setTimeout(() => setActionMessage(null), 3000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to remove item.');
        }
    };

    // Handler: Record Cash / Manual Payment
    const handleRecordPaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/finance/invoices/${showPaymentModal.id}/payments`, {
                amount: Number(paymentForm.amount),
                paymentMethod: paymentForm.paymentMethod,
                paymentDate: paymentForm.paymentDate,
                transactionReference: paymentForm.transactionReference,
                remarks: paymentForm.remarks,
            });

            setShowPaymentModal(null);
            fetchData();
            if (selectedItem?.data?.id === showPaymentModal.id) {
                setSelectedItem({ type: 'INVOICE', data: res.data.data.invoice });
            }
            setActionMessage({ type: 'success', text: `Payment of $${paymentForm.amount} recorded successfully!` });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to record payment.');
        }
    };

    // Handler: New Charge Type Submit
    const handleChargeTypeSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/charge-types', {
                name: chargeTypeForm.name,
                description: chargeTypeForm.description,
                isRecurring: chargeTypeForm.isRecurring,
                defaultAmount: chargeTypeForm.defaultAmount ? Number(chargeTypeForm.defaultAmount) : null,
            });
            setShowChargeTypeModal(false);
            setChargeTypeForm({ name: '', description: '', isRecurring: true, defaultAmount: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save charge type.');
        }
    };

    // Handler: Launch SSLCommerz Interactive Sandbox Modal
    const handleLaunchSSLCommerz = async (invoice) => {
        try {
            const res = await api.post(`/finance/invoices/${invoice.id}/sslcommerz/init`);
            setSslcommerzModal({
                ...res.data.data,
                invoice,
            });
            setGatewayTab('mobile');
            setSelectedGatewayMethod('bKash');
        } catch (err) {
            const dueAmount = Number(invoice.totalAmount) - Number(invoice.paidAmount);
            const tranId = `SSLCZ-${invoice.id.slice(0, 8)}-${Date.now().toString().slice(-4)}`;
            setSslcommerzModal({
                invoice,
                dueAmount,
                tranId,
                currency: invoice.lease?.unit?.property?.currency || 'USD',
            });
            setGatewayTab('mobile');
            setSelectedGatewayMethod('bKash');
        }
    };


    // Handler: Execute SSLCommerz Instant Sandbox Verification
    const handleExecuteSSLCommerzPayment = async () => {
        if (!sslcommerzModal?.invoice?.id) return;
        setIsProcessingPayment(true);
        try {
            const res = await api.post(`/finance/invoices/${sslcommerzModal.invoice.id}/payments`, {
                amount: Number(sslcommerzModal.dueAmount),
                paymentMethod: 'SSLCOMMERZ',
                paymentDate: new Date().toISOString().slice(0, 10),
                transactionReference: `${sslcommerzModal.tranId}-${selectedGatewayMethod.toUpperCase()}`,
                remarks: `Verified SSLCommerz Sandbox Digital Checkout via ${selectedGatewayMethod} (${simulatedAccountInput}).`,
            });

            setSslcommerzModal(null);
            fetchData();
            if (selectedItem?.data?.id === sslcommerzModal.invoice.id) {
                setSelectedItem({ type: 'INVOICE', data: res.data.data.invoice });
            }
            setActionMessage({
                type: 'success',
                text: `SSLCommerz Payment of $${sslcommerzModal.dueAmount} completed via ${selectedGatewayMethod}!`,
            });
            setTimeout(() => setActionMessage(null), 5000);
        } catch (err) {
            alert(err.response?.data?.error || 'Payment failed.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Filter Invoices
    const filteredInvoices = invoices.filter((inv) => {
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        const matchesProp = propertyFilter === 'ALL' || inv.lease?.unit?.propertyId === propertyFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes(q) ||
            inv.lease?.tenant?.firstName?.toLowerCase().includes(q) ||
            inv.lease?.tenant?.businessName?.toLowerCase().includes(q) ||
            inv.lease?.unit?.name?.toLowerCase().includes(q) ||
            inv.lease?.unit?.property?.name?.toLowerCase().includes(q);

        return matchesStatus && matchesProp && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PAID':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'PARTIALLY_PAID':
                return 'bg-sky-100 text-sky-800 border-sky-200';
            case 'OVERDUE':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'UNPAID':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'DRAFT':
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
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
                                <Receipt className="w-7 h-7 text-sky-600" />
                                Billing & Finance Engine
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Manage consolidated unit rent bills, dynamic charge items, cash ledgers, and digital SSLCommerz collections.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                onClick={() => setShowMonthlyBatchModal(true)}
                                className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span>Batch Generate Monthly</span>
                            </button>

                            <button
                                onClick={() => {
                                    setShowInlineForm(!showInlineForm);
                                    if (!showInlineForm && leases.length > 0 && !invoiceForm.leaseId) {
                                        setInvoiceForm((prev) => ({ ...prev, leaseId: leases[0].id }));
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{showInlineForm ? 'Close Invoice Builder' : 'New Custom Invoice'}</span>
                            </button>

                        </div>

                    </div>

                    {/* TOP FINANCIAL KPI CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Invoiced</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">${totalInvoiced.toLocaleString()}</p>
                            <span className="text-[11px] text-slate-500 block">{invoices.length} total bills</span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Collected Revenue</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">${totalCollected.toLocaleString()}</p>
                            <span className="text-[11px] text-emerald-700 font-semibold block">{collectionRate}% collection rate</span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Outstanding Balance</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-rose-600">${totalOutstanding.toLocaleString()}</p>
                            <span className="text-[11px] text-rose-700 block">{overdueCount} overdue/unpaid</span>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">Active Units Leased</span>
                            <p className="text-xl sm:text-2xl font-extrabold text-sky-900">{leases.filter((l) => l.status === 'ACTIVE').length}</p>
                            <span className="text-[11px] text-slate-500 block">Across {properties.length} properties</span>
                        </div>
                    </div>

                    {/* SUBSTANTIAL CREATION PANEL: INLINE EXPANDABLE INVOICE BUILDER */}
                    {showInlineForm && (
                        <form
                            onSubmit={handleCreateInvoiceSubmit}
                            className="bg-white border-2 border-sky-500 rounded-2xl p-5 sm:p-6 shadow-md space-y-5 animate-in slide-in-from-top duration-200"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-sky-600" /> Create Consolidated Monthly Unit Invoice
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Attach custom fee items (Rent, Water, Electricity, Parking) to build a unified monthly bill for a unit.</p>
                                </div>
                                <button type="button" onClick={() => setShowInlineForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Space & Active Lease</label>
                                    <select
                                        required
                                        value={invoiceForm.leaseId}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, leaseId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                                    >
                                        <option value="">Select Lease Contract...</option>
                                        {leases.map((l) => {
                                            const tName = l.tenant?.tenantType === 'BUSINESS' ? l.tenant?.businessName : `${l.tenant?.firstName || ''} ${l.tenant?.lastName || ''}`;
                                            return (
                                                <option key={l.id} value={l.id}>
                                                    {l.unit?.name} ({l.unit?.property?.name}) — {tName} (${Number(l.rentAmount).toLocaleString()}/mo)
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Issue Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={invoiceForm.issueDate}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={invoiceForm.dueDate}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            {/* LINE ITEMS TABLE BUILDER */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Itemized Charges Breakdown</span>
                                    <button
                                        type="button"
                                        onClick={handleAddLineItem}
                                        className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Another Charge
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {invoiceForm.items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                            <div className="col-span-4">
                                                <select
                                                    value={item.chargeTypeId}
                                                    onChange={(e) => handleLineItemChange(idx, 'chargeTypeId', e.target.value)}
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white"
                                                >
                                                    {chargeTypes.map((ct) => (
                                                        <option key={ct.id} value={ct.id}>
                                                            {ct.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-4">
                                                <input
                                                    type="text"
                                                    placeholder="Description (e.g. August 2026 Rent)"
                                                    value={item.description}
                                                    onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-center"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Unit Price ($)"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-right"
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLineItem(idx)}
                                                    disabled={invoiceForm.items.length <= 1}
                                                    className="text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TOTAL & SUBMISSION */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-slate-100">
                                <div className="text-xs text-slate-500">
                                    Subtotal: <span className="font-bold text-slate-800">${calculateFormSubtotal().toLocaleString()}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowInlineForm(false)}
                                        className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                                    >
                                        Discard Draft
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                                    >
                                        Generate Invoice (${calculateFormSubtotal().toLocaleString()})
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* LEVEL 2 HORIZONTAL NAVIGATION TABS */}
                    <div className="flex border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">

                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                activeTab === 'invoices'
                                    ? 'border-sky-600 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Receipt className="w-4 h-4" /> Invoices Directory ({invoices.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                activeTab === 'payments'
                                    ? 'border-sky-600 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <CreditCard className="w-4 h-4" /> Payments Ledger ({payments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('chargeTypes')}
                            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                activeTab === 'chargeTypes'
                                    ? 'border-sky-600 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Tag className="w-4 h-4" /> Charge Types Catalog ({chargeTypes.length})
                        </button>
                    </div>

                    {/* SECTION 1: INVOICES DIRECTORY */}
                    {activeTab === 'invoices' && (
                        <div className="space-y-4">
                            {/* Toolbar */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="relative w-full md:w-72">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search unit, invoice #, tenant..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 cursor-pointer"
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="UNPAID">UNPAID</option>
                                            <option value="PAID">PAID</option>
                                            <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                                            <option value="OVERDUE">OVERDUE</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-slate-500 uppercase">Property:</span>
                                        <select
                                            value={propertyFilter}
                                            onChange={(e) => setPropertyFilter(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 text-xs rounded-lg py-2 px-3 cursor-pointer max-w-[160px] truncate"
                                        >
                                            <option value="ALL">All Properties</option>
                                            {properties.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Invoices Table */}
                            {loading ? (
                                <TableSkeleton rows={6} cols={7} />
                            ) : (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                                    <table className="w-full text-left text-xs text-slate-600">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="p-3.5">Unit / Property</th>
                                                <th className="p-3.5">Invoice #</th>
                                                <th className="p-3.5">Tenant Party</th>
                                                <th className="p-3.5">Charge Items Included</th>
                                                <th className="p-3.5 text-right">Total Amount</th>
                                                <th className="p-3.5 text-right">Balance Due</th>
                                                <th className="p-3.5">Status</th>
                                                <th className="p-3.5 text-right">Inspect</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredInvoices.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                                                        No invoices found matching criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredInvoices.map((inv) => {
                                                    const isSelected = selectedItem?.data?.id === inv.id;
                                                    const tenantName =
                                                        inv.lease?.tenant?.tenantType === 'BUSINESS'
                                                            ? inv.lease?.tenant?.businessName
                                                            : `${inv.lease?.tenant?.firstName || ''} ${inv.lease?.tenant?.lastName || ''}`;
                                                    const balance = Number(inv.totalAmount) - Number(inv.paidAmount);

                                                    return (
                                                        <tr
                                                            key={inv.id}
                                                            onClick={() => handleSelectInvoice(inv)}
                                                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                                                                isSelected ? 'bg-sky-50/50 font-medium' : ''
                                                            }`}
                                                        >

                                                            <td className="p-3.5 font-bold text-slate-900">
                                                                <p className="text-slate-900">{inv.lease?.unit?.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-normal">{inv.lease?.unit?.property?.name}</p>
                                                            </td>
                                                            <td className="p-3.5 font-mono text-xs text-sky-700">
                                                                #{inv.invoiceNumber}
                                                            </td>
                                                            <td className="p-3.5">
                                                                <p className="font-semibold text-slate-800">{tenantName}</p>
                                                                <p className="text-[10px] text-slate-400">{inv.lease?.tenant?.email}</p>
                                                            </td>
                                                            <td className="p-3.5">
                                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                                    {inv.items?.map((item) => (
                                                                        <span key={item.id} className="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] rounded-md border border-slate-200">
                                                                            {item.chargeType?.name || item.description}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="p-3.5 text-right font-bold text-slate-900">
                                                                ${Number(inv.totalAmount).toLocaleString()}
                                                            </td>
                                                            <td className="p-3.5 text-right">
                                                                <span
                                                                    className={`font-bold ${
                                                                        balance > 0 ? 'text-rose-600' : 'text-slate-400'
                                                                    }`}
                                                                >
                                                                    ${balance.toLocaleString()}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5">
                                                                <span
                                                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(
                                                                        inv.status
                                                                    )}`}
                                                                >
                                                                    {inv.status}
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

                    {/* SECTION 2: PAYMENTS LEDGER */}
                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            {loading ? (
                                <TableSkeleton rows={5} cols={5} />
                            ) : (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                                    <table className="w-full text-left text-xs text-slate-600">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="p-3.5">Payment Date</th>
                                                <th className="p-3.5">Invoice #</th>
                                                <th className="p-3.5">Tenant / Unit</th>
                                                <th className="p-3.5">Method</th>
                                                <th className="p-3.5">Transaction Ref</th>
                                                <th className="p-3.5 text-right">Amount Paid</th>
                                                <th className="p-3.5">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                                        No payment transactions recorded yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                payments.map((p) => {
                                                    const tenantName =
                                                        p.invoice?.lease?.tenant?.tenantType === 'BUSINESS'
                                                            ? p.invoice?.lease?.tenant?.businessName
                                                            : `${p.invoice?.lease?.tenant?.firstName || ''} ${p.invoice?.lease?.tenant?.lastName || ''}`;

                                                    return (
                                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-3.5 font-medium text-slate-700">
                                                                {new Date(p.paymentDate).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-3.5 font-bold text-slate-900">
                                                                #{p.invoice?.invoiceNumber}
                                                            </td>
                                                            <td className="p-3.5">
                                                                <p className="font-semibold text-slate-800">{tenantName}</p>
                                                                <p className="text-[10px] text-slate-400">{p.invoice?.lease?.unit?.name}</p>
                                                            </td>
                                                            <td className="p-3.5">
                                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
                                                                    {p.paymentMethod}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5 font-mono text-[11px] text-slate-500">
                                                                {p.transactionReference || 'N/A'}
                                                            </td>
                                                            <td className="p-3.5 text-right font-bold text-emerald-600">
                                                                ${Number(p.amount).toLocaleString()}
                                                            </td>
                                                            <td className="p-3.5">
                                                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                                                                    {p.status}
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

                    {/* SECTION 3: CHARGE TYPES CATALOG */}
                    {activeTab === 'chargeTypes' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                                <div>
                                    <h4 className="text-sm font-bold text-sky-900">Configurable Fee Catalog</h4>
                                    <p className="text-xs text-sky-700 mt-0.5">Define fee categories and default rate templates used in tenant invoicing.</p>
                                </div>
                                <button
                                    onClick={() => setShowChargeTypeModal(true)}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Fee Type
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {chargeTypes.map((ct) => (
                                    <div key={ct.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold text-slate-800">{ct.name}</h4>
                                                <span
                                                    className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                                        ct.isRecurring ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {ct.isRecurring ? 'Recurring' : 'One-time'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{ct.description || 'Standard fee template.'}</p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                                            <span className="text-slate-400">Default Rate</span>
                                            <span className="font-bold text-slate-900">
                                                {ct.defaultAmount ? `$${Number(ct.defaultAmount).toLocaleString()}` : 'Variable Rate'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* LEVEL 3 PERSISTENT DRAWER: INVOICE INSPECTOR WITH LINE-ITEM EDITING */}
                <PersistentDrawer
                    selectedItem={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onSave={handleSaveEdit}
                    customWidth="w-full sm:w-[480px] lg:w-[480px] xl:w-[520px]"
                    editFormContent={
                        selectedItem?.type === 'INVOICE' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={invoiceEditForm.dueDate}
                                        onChange={(e) => setInvoiceEditForm({ ...invoiceEditForm, dueDate: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Invoice Status</label>
                                    <select
                                        value={invoiceEditForm.status}
                                        onChange={(e) => setInvoiceEditForm({ ...invoiceEditForm, status: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    >
                                        <option value="DRAFT">DRAFT</option>
                                        <option value="UNPAID">UNPAID</option>
                                        <option value="PAID">PAID</option>
                                        <option value="OVERDUE">OVERDUE</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Discount Amount ($)</label>
                                    <input
                                        type="number"
                                        value={invoiceEditForm.discount}
                                        onChange={(e) => setInvoiceEditForm({ ...invoiceEditForm, discount: e.target.value })}
                                        placeholder="0"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Memo / Invoice Notes</label>
                                    <textarea
                                        rows={3}
                                        value={invoiceEditForm.notes}
                                        onChange={(e) => setInvoiceEditForm({ ...invoiceEditForm, notes: e.target.value })}
                                        placeholder="Add private or public notes..."
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>
                            </div>
                        )
                    }
                >

                    {selectedItem?.type === 'INVOICE' && (
                        <div className="space-y-4">
                            {/* Invoice Header */}
                            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xs space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                                            {selectedItem.data.lease?.unit?.name} — {selectedItem.data.lease?.unit?.property?.name}
                                        </span>
                                        <h3 className="text-xl font-bold text-white mt-0.5">#{selectedItem.data.invoiceNumber}</h3>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(
                                            selectedItem.data.status
                                        )}`}
                                    >
                                        {selectedItem.data.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Issue Date</span>
                                        <span className="font-semibold text-slate-200">
                                            {new Date(selectedItem.data.issueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Due Date</span>
                                        <span className="font-semibold text-slate-200">
                                            {new Date(selectedItem.data.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tenant Info Card */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tenant Party</span>
                                <div className="flex justify-between items-center text-xs">
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            {selectedItem.data.lease?.tenant?.tenantType === 'BUSINESS'
                                                ? selectedItem.data.lease?.tenant?.businessName
                                                : `${selectedItem.data.lease?.tenant?.firstName || ''} ${selectedItem.data.lease?.tenant?.lastName || ''}`}
                                        </p>
                                        <p className="text-[11px] text-slate-500">{selectedItem.data.lease?.tenant?.email}</p>
                                    </div>
                                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                                        {selectedItem.data.lease?.unit?.name}
                                    </span>
                                </div>
                            </div>

                            {/* DYNAMIC LINE ITEMS MANAGEMENT (+ Plus icon to add item to existing invoice) */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Itemized Bill Charges ({selectedItem.data.items?.length || 0})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddItemDrawerForm(!showAddItemDrawerForm)}
                                        className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer bg-sky-50 px-2 py-1 rounded-lg border border-sky-100"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Charge Item
                                    </button>
                                </div>

                                {/* IN-DRAWER ADD ITEM ACCORDION */}
                                {showAddItemDrawerForm && (
                                    <form
                                        onSubmit={handleAddLineItemToInvoiceSubmit}
                                        className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3 text-xs animate-in fade-in duration-150"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-sky-900">Add Item to this Invoice</span>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddItemDrawerForm(false)}
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Charge Type</label>
                                                <select
                                                    value={newItemDrawerForm.chargeTypeId}
                                                    onChange={(e) => {
                                                        const ctId = e.target.value;
                                                        const ct = chargeTypes.find((c) => c.id === ctId);
                                                        setNewItemDrawerForm({
                                                            ...newItemDrawerForm,
                                                            chargeTypeId: ctId,
                                                            unitPrice: Number(ct?.defaultAmount || 0),
                                                        });
                                                    }}
                                                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                                                >
                                                    {chargeTypes.map((ct) => (
                                                        <option key={ct.id} value={ct.id}>{ct.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Description</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Utility Charge, Additional Maintenance"
                                                    value={newItemDrawerForm.description}
                                                    onChange={(e) => setNewItemDrawerForm({ ...newItemDrawerForm, description: e.target.value })}
                                                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Qty</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={newItemDrawerForm.quantity}
                                                        onChange={(e) => setNewItemDrawerForm({ ...newItemDrawerForm, quantity: Number(e.target.value) })}
                                                        className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Unit Price ($)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={newItemDrawerForm.unitPrice}
                                                        onChange={(e) => setNewItemDrawerForm({ ...newItemDrawerForm, unitPrice: Number(e.target.value) })}
                                                        className="w-full p-2 border border-slate-200 rounded-lg bg-white text-right"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddItemDrawerForm(false)}
                                                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                                            >
                                                Save to Invoice
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* ITEMS LIST */}
                                <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
                                    {selectedItem.data.items?.map((item) => (
                                        <div key={item.id} className="p-3 flex justify-between items-center group hover:bg-slate-50/60 transition-colors">
                                            <div className="min-w-0 pr-2">
                                                <p className="font-semibold text-slate-800 truncate">{item.chargeType?.name || item.description}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {item.quantity} × ${Number(item.unitPrice).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <p className="font-bold text-slate-900">${Number(item.amount).toLocaleString()}</p>
                                                {selectedItem.data.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteLineItem(item.id)}
                                                        title="Remove charge item"
                                                        className="p-1 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="p-3.5 bg-slate-50/80 space-y-1.5">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Subtotal</span>
                                            <span>${Number(selectedItem.data.subtotal).toLocaleString()}</span>
                                        </div>
                                        {Number(selectedItem.data.discount) > 0 && (
                                            <div className="flex justify-between text-emerald-600">
                                                <span>Discount</span>
                                                <span>-${Number(selectedItem.data.discount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                                            <span>Grand Total</span>
                                            <span>${Number(selectedItem.data.totalAmount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-emerald-600">
                                            <span>Paid to Date</span>
                                            <span>${Number(selectedItem.data.paidAmount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between font-extrabold text-rose-600 pt-1 border-t border-slate-200">
                                            <span>Outstanding Balance</span>
                                            <span>
                                                $
                                                {(
                                                    Number(selectedItem.data.totalAmount) - Number(selectedItem.data.paidAmount)
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recorded Payments History */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                                    Payment History ({selectedItem.data.payments?.length || 0})
                                </span>
                                {selectedItem.data.payments?.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                        No payments recorded yet.
                                    </p>
                                ) : (
                                    selectedItem.data.payments?.map((pay) => (
                                        <div key={pay.id} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                                            <div>
                                                <span className="font-bold text-emerald-700">${Number(pay.amount).toLocaleString()}</span>
                                                <span className="text-[10px] text-slate-400 block font-mono">{pay.transactionReference}</span>
                                            </div>
                                            <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-700 rounded-md">
                                                {pay.paymentMethod}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="space-y-2 pt-2">
                                {Number(selectedItem.data.totalAmount) - Number(selectedItem.data.paidAmount) > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                const remaining = Number(selectedItem.data.totalAmount) - Number(selectedItem.data.paidAmount);
                                                setPaymentForm({
                                                    amount: remaining,
                                                    paymentMethod: 'CASH',
                                                    paymentDate: new Date().toISOString().slice(0, 10),
                                                    transactionReference: `CASH-${Date.now().toString().slice(-4)}`,
                                                    remarks: 'Payment recorded by manager.',
                                                });
                                                setShowPaymentModal(selectedItem.data);
                                            }}
                                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                        >
                                            <DollarSign className="w-4 h-4" /> Record Cash
                                        </button>

                                        <button
                                            onClick={() => handleLaunchSSLCommerz(selectedItem.data)}
                                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                        >
                                            <ShieldCheck className="w-4 h-4" /> SSLCommerz Pay
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => window.print()}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" /> Print Receipt
                                </button>
                            </div>
                        </div>
                    )}
                </PersistentDrawer>
            </div>

            {/* MODAL 1: RECORD MANUAL CASH / BANK PAYMENT */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-600" /> Record Payment for #{showPaymentModal.invoiceNumber}
                            </h4>
                            <button onClick={() => setShowPaymentModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Amount to Pay ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={Number(showPaymentModal.totalAmount) - Number(showPaymentModal.paidAmount)}
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-600 font-semibold uppercase mb-1">Payment Method</label>
                                    <select
                                        value={paymentForm.paymentMethod}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                                    >
                                        <option value="CASH">CASH</option>
                                        <option value="BANK_TRANSFER">BANK TRANSFER</option>
                                        <option value="CHEQUE">CHEQUE</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-600 font-semibold uppercase mb-1">Payment Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={paymentForm.paymentDate}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Receipt / Ref #</label>
                                <input
                                    type="text"
                                    placeholder="e.g. REC-9921"
                                    value={paymentForm.transactionReference}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: BATCH GENERATE MONTHLY INVOICES */}
            {showMonthlyBatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" /> Automated Monthly Invoices
                            </h4>
                            <button onClick={() => setShowMonthlyBatchModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleBatchGenerateSubmit} className="space-y-4 text-xs">
                            <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 text-sky-800 space-y-1">
                                <p className="font-bold">Unit Monthly Invoice Batch Generator</p>
                                <p className="text-[11px]">
                                    Will scan all {leases.filter((l) => l.status === 'ACTIVE').length} active leased units and generate a unified rent invoice for the month.
                                </p>
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Billing Month</label>
                                <input
                                    type="month"
                                    required
                                    value={batchForm.billingMonth}
                                    onChange={(e) => setBatchForm({ ...batchForm, billingMonth: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Payment Due Date</label>
                                <input
                                    type="date"
                                    required
                                    value={batchForm.dueDate}
                                    onChange={(e) => setBatchForm({ ...batchForm, dueDate: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowMonthlyBatchModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                                >
                                    Run Generator
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: NEW CHARGE TYPE */}
            {showChargeTypeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-sky-600" /> Add New Fee Template
                            </h4>
                            <button onClick={() => setShowChargeTypeModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleChargeTypeSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Charge Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Elevator Upkeep, Generator Fuel"
                                    value={chargeTypeForm.name}
                                    onChange={(e) => setChargeTypeForm({ ...chargeTypeForm, name: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Default Amount ($) - Optional</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 50"
                                    value={chargeTypeForm.defaultAmount}
                                    onChange={(e) => setChargeTypeForm({ ...chargeTypeForm, defaultAmount: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold uppercase mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    placeholder="Description of this fee..."
                                    value={chargeTypeForm.description}
                                    onChange={(e) => setChargeTypeForm({ ...chargeTypeForm, description: e.target.value })}
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    checked={chargeTypeForm.isRecurring}
                                    onChange={(e) => setChargeTypeForm({ ...chargeTypeForm, isRecurring: e.target.checked })}
                                    className="w-4 h-4 text-sky-600 rounded"
                                />
                                <label htmlFor="isRecurring" className="text-slate-700 font-medium cursor-pointer">
                                    Recurring monthly charge
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowChargeTypeModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                                >
                                    Save Charge Type
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: INTERACTIVE SSLCOMMERZ SANDBOX CHECKOUT MODAL (No blank pages!) */}
            {sslcommerzModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">SSLCommerz Digital Payment Gateway</h4>
                                    <p className="text-[11px] text-slate-400">Sandbox Verified Checkout • #{sslcommerzModal.invoice.invoiceNumber}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSslcommerzModal(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Amount Due Summary */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                            <div>
                                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Payee Space / Unit</span>
                                <span className="font-bold text-slate-800">{sslcommerzModal.invoice.lease?.unit?.name}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-500 uppercase font-semibold text-[10px] block">Amount to Charge</span>
                                <span className="text-lg font-extrabold text-sky-600">
                                    ${Number(sslcommerzModal.dueAmount).toLocaleString()} {sslcommerzModal.currency}
                                </span>
                            </div>
                        </div>

                        {/* Payment Method Selector Tabs */}
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setGatewayTab('mobile')}
                                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                        gatewayTab === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <Smartphone className="w-3.5 h-3.5" /> Mobile Wallet
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGatewayTab('cards')}
                                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                        gatewayTab === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <CreditCard className="w-3.5 h-3.5" /> Cards
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGatewayTab('bank')}
                                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                        gatewayTab === 'bank' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <Landmark className="w-3.5 h-3.5" /> Net Banking
                                </button>
                            </div>

                            {/* Mobile Banking Options */}
                            {gatewayTab === 'mobile' && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-4 gap-2">
                                        {['bKash', 'Nagad', 'Rocket', 'Upay'].map((method) => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setSelectedGatewayMethod(method)}
                                                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                                                    selectedGatewayMethod === method
                                                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                                }`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-slate-600 font-semibold text-[11px] uppercase mb-1">
                                            {selectedGatewayMethod} Account Number
                                        </label>
                                        <input
                                            type="text"
                                            value={simulatedAccountInput}
                                            onChange={(e) => setSimulatedAccountInput(e.target.value)}
                                            placeholder="017xxxxxxxx"
                                            className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Cards Option */}
                            {gatewayTab === 'cards' && (
                                <div className="space-y-3 text-xs">
                                    <div>
                                        <label className="block text-slate-600 font-semibold text-[11px] uppercase mb-1">Card Number</label>
                                        <input
                                            type="text"
                                            defaultValue="4111 2222 3333 4444"
                                            className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs font-semibold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-slate-600 font-semibold text-[11px] uppercase mb-1">Expiry</label>
                                            <input
                                                type="text"
                                                defaultValue="12/28"
                                                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-600 font-semibold text-[11px] uppercase mb-1">CVV</label>
                                            <input
                                                type="password"
                                                defaultValue="888"
                                                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Net Banking Option */}
                            {gatewayTab === 'bank' && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {['City Touch', 'BRAC Bank', 'Islami Bank', 'DBBL NexusPay'].map((b) => (
                                        <button
                                            key={b}
                                            type="button"
                                            onClick={() => setSelectedGatewayMethod(b)}
                                            className={`p-3 rounded-xl border font-bold text-center transition-all ${
                                                selectedGatewayMethod === b
                                                    ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                            }`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Submit Digital Payment */}
                            <button
                                type="button"
                                disabled={isProcessingPayment}
                                onClick={handleExecuteSSLCommerzPayment}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isProcessingPayment ? (
                                    <span>Processing Transaction...</span>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>
                                            Pay ${Number(sslcommerzModal.dueAmount).toLocaleString()} via {selectedGatewayMethod}
                                        </span>
                                    </>
                                )}
                            </button>

                            {sslcommerzModal.sessionUrl && (
                                <a
                                    href={sslcommerzModal.sessionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> Launch External SSLCommerz Hosted Page
                                </a>
                            )}
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
}
