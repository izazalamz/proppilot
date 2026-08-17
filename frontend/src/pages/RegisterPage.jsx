import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    Building,
    Lock,
    Mail,
    User,
    Eye,
    EyeOff,
    Building2,
    Users,
    Receipt,
    Shield,
    Check,
    X,
    ArrowRight,
} from 'lucide-react';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Live Password Validations
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!agreeTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy.');
            return;
        }

        setLoading(true);

        try {
            await register({
                fullName,
                companyName,
                email,
                password,
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">
            {/* LEFT SPLIT: BRANDING & BENEFITS */}
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
                            Start Managing Properties Smarter
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            Create your own property management workspace in minutes.
                        </p>
                    </div>

                    {/* Benefit Points */}
                    <div className="space-y-6 max-w-md pt-2">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-800 shrink-0">
                                <Building2 className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Unlimited Properties</h3>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Scale your portfolio without limits or extra fees.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-800 shrink-0">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Tenant & Lease Management</h3>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Centralize tenant communication and lease documents.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-800 shrink-0">
                                <Receipt className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Billing & Maintenance Tracking</h3>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Automate rent collection and resolve maintenance requests faster.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Copyright */}
                <div className="relative z-10 pt-12 text-xs text-slate-500">
                    © 2026 PropPilot Inc. All rights reserved.
                </div>
            </div>

            {/* RIGHT SPLIT: REGISTRATION FORM */}
            <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-50">
                <div className="w-full max-w-md space-y-6">
                    {/* White Card */}
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-6 animate-in fade-in duration-200">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Your Account</h2>
                            <p className="text-xs text-slate-500">
                                Create your PropPilot workspace and start managing your portfolio.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                            {/* Full Name */}
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700">Full Name</label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-xs"
                                    />
                                </div>
                            </div>

                            {/* Company / Portfolio Name */}
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700">Company / Portfolio Name (Optional)</label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Doe Properties LLC"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-xs"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="jane@doeproperties.com"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-xs"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-xs"
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

                            {/* Password Requirement Checklist */}
                            {password && (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                                    <div className="flex items-center gap-2">
                                        {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                                        <span className={hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>Min 8 characters</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                                        <span className={hasUppercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>Uppercase letter</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                                        <span className={hasLowercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>Lowercase letter</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                                        <span className={hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>Number</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                                        <span className={hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>Special character</span>
                                    </div>
                                </div>
                            )}

                            {/* Confirm Password */}
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-xs"
                                    />
                                </div>
                            </div>

                            {/* Terms Agreement Checkbox */}
                            <div className="flex items-start gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    required
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 mt-0.5"
                                />
                                <label htmlFor="agreeTerms" className="text-slate-600 text-[11px] leading-snug cursor-pointer">
                                    I agree to the <span className="font-bold text-slate-900">Terms of Service</span> and{' '}
                                    <span className="font-bold text-slate-900">Privacy Policy</span>.
                                </label>
                            </div>

                            {/* Create Account Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                            >
                                <span>{loading ? 'Creating Workspace...' : 'Create Account'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center">
                            <div className="border-t border-slate-200 w-full" />
                            <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase">Or</span>
                            <div className="border-t border-slate-200 w-full" />
                        </div>

                        {/* Google Auth */}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
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

                        {/* Sign In Link */}
                        <p className="text-center text-xs text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-slate-900 hover:underline">
                                Sign In
                            </Link>
                        </p>
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
