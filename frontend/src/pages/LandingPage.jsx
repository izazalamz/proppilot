import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import {
    Building,
    Building2,
    Users,
    Receipt,
    Wrench,
    FolderArchive,
    LayoutDashboard,
    CreditCard,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    Play,
    Shield,
    FileText,
    Activity,
    Layers,
    ChevronRight,
    ExternalLink,
    Check,
    Lock,
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [activeDemoModal, setActiveDemoModal] = useState(false);

    // 1-Click Test Persona Login
    const handleQuickLogin = async (email, password, redirectPath = '/dashboard') => {
        try {
            await login(email, password);
            navigate(redirectPath);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to sign in.');
        }
    };

    const featureCards = [
        {
            icon: Building2,
            title: 'Property & Unit Management',
            desc: 'Centralize all property details, unit statuses, and building documents in one accessible location.',
        },
        {
            icon: Users,
            title: 'Tenant & Occupancy',
            desc: 'Track tenant information, communication history, and occupancy rates with real-time dashboards.',
        },
        {
            icon: FileText,
            title: 'Lease Management',
            desc: 'Automate lease renewals, store digital contracts, and manage complex lease structures effortlessly.',
        },
        {
            icon: Receipt,
            title: 'Billing & Payments',
            desc: 'Streamline rent collection, automate late fees, and reconcile accounts with robust ledger tools.',
        },
        {
            icon: Wrench,
            title: 'Maintenance',
            desc: 'Receive, assign, and track maintenance requests from submission to resolution with vendor portals.',
        },
        {
            icon: FolderArchive,
            title: 'Documents',
            desc: 'Securely store and organize insurance policies, inspection reports, and compliance documentation.',
        },
    ];

    const demoPersonas = [
        {
            role: 'Property Owner',
            name: 'Sarah Connor',
            email: 'sarah.connor@example.com',
            icon: '👑',
            badge: 'bg-sky-50 text-sky-700 border-sky-200',
            desc: 'Full portfolio control, executive KPIs, global charge catalogs, and financial analytics.',
            target: '/dashboard',
        },
        {
            role: 'Property Manager',
            name: 'Marcus Wright',
            email: 'marcus.manager@example.com',
            icon: '👔',
            badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            desc: 'Unit 360° inspector, lease drafting, batch invoice generation, and work order dispatch.',
            target: '/dashboard',
        },
        {
            role: 'Maintenance Technician',
            name: 'Kyle Reese',
            email: 'kyle.technician@example.com',
            icon: '🔧',
            badge: 'bg-amber-50 text-amber-700 border-amber-200',
            desc: 'Interactive Kanban pipeline, work order progress transitions, and resolution logging.',
            target: '/maintenance',
        },
        {
            role: 'Resident Tenant (Apt 101)',
            name: 'Alex Murphy',
            email: 'alex.murphy@example.com',
            icon: '🏠',
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            desc: 'Dedicated Resident Portal, SSLCommerz digital rent payment, and repair requests.',
            target: '/portal',
        },
        {
            role: 'Commercial Tenant (Suite 301)',
            name: 'Elena Rostova',
            email: 'elena.rostova@example.com',
            icon: '🏢',
            badge: 'bg-purple-50 text-purple-700 border-purple-200',
            desc: 'Itemized utility receipts, signed commercial agreements, and building bulletins.',
            target: '/portal',
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            {/* TOP NAVIGATION BAR */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 lg:px-16 h-20 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-slate-950 text-white p-2 rounded-xl">
                            <Building className="w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-900">PropPilot</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
                        <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
                        <a href="#demo" className="hover:text-slate-950 transition-colors">Live Sandbox</a>
                        <a href="#visibility" className="hover:text-slate-950 transition-colors">Product UI</a>
                        <Link to="/portal" className="text-emerald-700 hover:text-emerald-800 font-bold">Resident Portal</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-full shadow-sm transition-all flex items-center gap-1.5"
                    >
                        <span>Get Started</span>
                    </Link>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="pt-16 pb-20 px-6 lg:px-16 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column Text & CTAs */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>PropPilot Real Estate Operating System</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]">
                            Manage Every Property. <br className="hidden sm:inline" />
                            <span className="text-slate-900">Simplify Every Lease.</span>
                        </h1>

                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                            Manage properties, units, tenants, leases, billing, maintenance, and documents from one centralized platform.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link
                                to="/register"
                                className="px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                            >
                                Get Started
                            </Link>

                            <a
                                href="#demo"
                                className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                            >
                                <Play className="w-3.5 h-3.5 fill-slate-800 text-slate-800" />
                                <span>Watch Demo & Try Personas</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Hero UI Preview Card */}
                    <div className="lg:col-span-6">
                        <div className="relative rounded-3xl p-3 bg-gradient-to-b from-slate-100 to-slate-200/50 border border-slate-200 shadow-2xl shadow-slate-300/40">
                            {/* Realistic UI Mock Container */}
                            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-inner text-white text-xs">
                                {/* Top Browser Bar */}
                                <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] text-slate-400 font-mono ml-2">app.proppilot.io/dashboard</span>
                                    </div>
                                    <span className="text-[9px] px-2 py-0.5 bg-sky-500/20 text-sky-400 font-bold rounded">Live Sandbox</span>
                                </div>

                                {/* Mock App UI Dashboard */}
                                <div className="p-5 space-y-4 bg-slate-900">
                                    {/* Mock Mini Header */}
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                        <div>
                                            <h4 className="font-bold text-sm text-white">Sunset Portfolio Overview</h4>
                                            <span className="text-[10px] text-slate-400">12 Total Units • 91.7% Occupancy</span>
                                        </div>
                                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-lg">
                                            $26,500 Invoiced
                                        </span>
                                    </div>

                                    {/* Mock KPI Mini Grid */}
                                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                                        <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                                            <span className="text-slate-400 block">Collection Rate</span>
                                            <span className="text-emerald-400 font-bold text-sm">100%</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                                            <span className="text-slate-400 block">Occupied Units</span>
                                            <span className="text-white font-bold text-sm">11 / 12</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                                            <span className="text-slate-400 block">Open Repairs</span>
                                            <span className="text-amber-400 font-bold text-sm">3 Tickets</span>
                                        </div>
                                    </div>

                                    {/* Mock Revenue Trend Bars */}
                                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                                        <div className="flex justify-between text-[10px] text-slate-400">
                                            <span>Monthly Revenue Collection Trend</span>
                                            <span className="text-sky-400 font-bold">6-Month Trend</span>
                                        </div>
                                        <div className="flex items-end justify-between gap-2 h-14 pt-2">
                                            {[40, 55, 70, 85, 95, 100].map((h, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                    <div className="w-full bg-sky-500/40 rounded-t-sm" style={{ height: `${h}%` }}>
                                                        <div className="w-full bg-sky-400 rounded-t-sm" style={{ height: `${h * 0.9}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: EVERYTHING YOU NEED TO MANAGE YOUR PORTFOLIO (MATCHING IMAGE 3) */}
            <section id="features" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-100 space-y-12">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                        Everything you need to manage your portfolio
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        A complete suite of tools designed for high-efficiency property management operations.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featureCards.map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                            <div
                                key={idx}
                                className="p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl w-fit">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* SECTION 3: UNPARALLELED VISIBILITY INTO YOUR OPERATIONS (MATCHING IMAGE 3) */}
            <section id="visibility" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-100 space-y-12">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                        Unparalleled visibility into your operations
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        High-fidelity tools designed for scale.
                    </p>
                </div>

                {/* Desk Mockup Visual Card */}
                <div className="relative rounded-3xl p-6 sm:p-10 bg-slate-900 text-white shadow-2xl border border-slate-800 space-y-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Executive Command Center</span>
                            <h3 className="text-xl font-bold text-white mt-1">Multi-Tab Unit 360° Operations</h3>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold">
                                Real-Time WebSockets
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
                                SSLCommerz Sandbox
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                            <span className="text-slate-400 font-bold block">1. 360° Space Explorer</span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                                Inspect unit occupancy, financial ledgers, active leases, and documents without refreshing the page.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                            <span className="text-slate-400 font-bold block">2. Kanban Work Order Pipeline</span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                                Move repairs through 4 stages with staff workload tracking and technician resolution logs.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                            <span className="text-slate-400 font-bold block">3. Accordion Documents Vault</span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                                Navigate documents hierarchically: Property → Unit Groups → Units → Attached Signed PDFs.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: 1-CLICK DEMO TEST SANDBOX (FOR EXAMINERS / VIVA / DEMO) */}
            <section id="demo" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-100 space-y-8">
                <div className="text-center space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Demonstration Ready</span>
                    <h2 className="text-3xl font-extrabold text-slate-950">1-Click Live Test Personas</h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                        Click any role below to immediately log in with full pre-seeded data and test its dedicated interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {demoPersonas.map((account, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleQuickLogin(account.email, 'password123', account.target)}
                            className="p-5 bg-white border border-slate-200 hover:border-slate-400 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-3xl">{account.icon}</span>
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${account.badge}`}>
                                        {account.role.split(' ')[0]}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                                        {account.name}
                                    </h4>
                                    <span className="text-[10px] text-slate-500 font-mono block truncate">
                                        {account.email}
                                    </span>
                                </div>

                                <p className="text-[11px] text-slate-600 leading-snug">
                                    {account.desc}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="w-full py-2 text-center text-xs font-bold bg-slate-950 group-hover:bg-slate-800 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span>Log In & View</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 5: START MANAGING YOUR PROPERTIES TODAY CTA BANNER (MATCHING IMAGE 3) */}
            <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-100 text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                    Start managing your properties today
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Join thousands of modern property managers scaling their operations with PropPilot.
                </p>

                <div className="pt-2">
                    <Link
                        to="/register"
                        className="px-8 py-3.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-block"
                    >
                        Create Free Account
                    </Link>
                </div>
            </section>

            {/* FOOTER (MATCHING IMAGE 3) */}
            <footer className="border-t border-slate-100 bg-slate-50/50 py-16 px-6 lg:px-16">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
                    {/* Left Column Brand */}
                    <div className="col-span-2 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-950 text-white p-1.5 rounded-lg">
                                <Building className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-sm text-slate-900">PropPilot</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed max-w-xs">
                            High-utility property management software designed for operational efficiency.
                        </p>
                    </div>

                    {/* Product */}
                    <div className="space-y-2.5">
                        <span className="font-bold text-slate-900 block">Product</span>
                        <ul className="space-y-2 text-slate-500 text-[11px]">
                            <li><a href="#features" className="hover:text-slate-900">Features</a></li>
                            <li><a href="#demo" className="hover:text-slate-900">Live Demo</a></li>
                            <li><Link to="/portal" className="hover:text-slate-900">Tenant Portal</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-2.5">
                        <span className="font-bold text-slate-900 block">Company</span>
                        <ul className="space-y-2 text-slate-500 text-[11px]">
                            <li><span className="text-slate-400">About</span></li>
                            <li><span className="text-slate-400">Careers</span></li>
                            <li><span className="text-slate-400">Blog</span></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-2.5">
                        <span className="font-bold text-slate-900 block">Legal</span>
                        <ul className="space-y-2 text-slate-500 text-[11px]">
                            <li><span className="text-slate-400">Privacy Policy</span></li>
                            <li><span className="text-slate-400">Terms of Service</span></li>
                            <li><span className="text-slate-400">Cookie Policy</span></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-200/60 flex justify-between items-center text-[11px] text-slate-400">
                    <span>© 2026 PropPilot Inc. All rights reserved.</span>
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        All Systems Operational
                    </span>
                </div>
            </footer>
        </div>
    );
}
