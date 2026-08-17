import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Building,
    Lock,
    Mail,
    Eye,
    EyeOff,
    ShieldCheck,
    Activity,
    Building2,
    Shield,
    Sparkles,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('sarah.connor@example.com');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(email, password);
            if (res.hasManagementAccess) {
                navigate('/dashboard');
            } else {
                navigate('/portal');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password.');
        } finally {

            setLoading(false);
        }
    };

    // Fast Persona Fill Helper for Viva/Demo
    const handleQuickFill = (testEmail) => {
        setEmail(testEmail);
        setPassword('password123');
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">
            {/* LEFT SPLIT: HERO BRANDING & BENEFITS */}
            <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/60 border-r border-slate-200">
                {/* Background Subtle Grid Texture */}
                <div 
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}
                />

                <div className="relative z-10 space-y-12">
                    {/* Brand Header */}
                    <Link to="/" className="flex items-center gap-2.5 w-fit group">
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl group-hover:bg-sky-600 transition-colors shadow-xs">
                            <Building className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900">PropPilot</span>
                    </Link>

                    {/* Headline & Overview */}
                    <div className="space-y-4 max-w-lg">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            Sign in to manage your properties, tenants, leases, payments, and maintenance from one centralized workspace.
                        </p>
                    </div>

                    {/* Benefit Points */}
                    <div className="space-y-6 max-w-md pt-2">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-800 shrink-0">
                                <ShieldCheck className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Secure Authentication</h3>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Bank-grade security protocols and JWT session tokens to protect your data.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-800 shrink-0">
                                <Activity className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Real-time Property Management</h3>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Live updates on maintenance dispatch, payments, and space occupancy.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-800 shrink-0">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Enterprise-grade Workspace</h3>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Scalable tools designed for multi-unit buildings and large portfolios.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Status Footer */}
                <div className="relative z-10 pt-12 text-xs text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>System Status: All systems operational</span>
                </div>
            </div>

            {/* RIGHT SPLIT: AUTH FORM CARD */}
            <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-50">
                <div className="w-full max-w-md space-y-6">
                    {/* Centered White Card */}
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-6 animate-in fade-in duration-200">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
                            <p className="text-xs text-slate-500">Sign in to continue to your workspace.</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2 animate-shake">
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            {/* Email */}
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-xs"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="font-bold text-slate-700">Password</label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-slate-500 hover:text-slate-900 font-semibold transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                                />
                                <label htmlFor="rememberMe" className="text-slate-600 font-medium cursor-pointer">
                                    Remember me for 30 days
                                </label>
                            </div>

                            {/* Black Sign In Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 text-xs"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center">
                            <div className="border-t border-slate-200 w-full" />
                            <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase">Or</span>
                            <div className="border-t border-slate-200 w-full" />
                        </div>

                        {/* Continue with Google */}
                        <button
                            type="button"
                            onClick={() => handleQuickFill('sarah.connor@example.com')}
                            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        {/* Sign Up Link */}
                        <p className="text-center text-xs text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-slate-900 hover:underline">
                                Create Account
                            </Link>
                        </p>

                        {/* Quick Persona Autofill Pills (for Testing & Viva) */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                                Fast Demo Autofill
                            </span>
                            <div className="flex flex-wrap gap-1.5 justify-center">
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('sarah.connor@example.com')}
                                    className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer transition-colors"
                                >
                                    👑 Owner
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('marcus.manager@example.com')}
                                    className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer transition-colors"
                                >
                                    👔 Manager
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('kyle.technician@example.com')}
                                    className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer transition-colors"
                                >
                                    🔧 Tech
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('alex.murphy@example.com')}
                                    className="px-2 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg cursor-pointer transition-colors"
                                >
                                    🏠 Tenant (Apt 101)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Security Note */}
                    <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>Protected with secure authentication and encrypted communication.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}