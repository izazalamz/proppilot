import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Building,
    Mail,
    ArrowLeft,
    CheckCircle2,
    Shield,
    RotateCcw,
    Lock,
    Headphones,
    Check,
} from 'lucide-react';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call to send reset email
        setTimeout(() => {
            setLoading(false);
            setIsSubmitted(true);
        }, 600);
    };

    // STATE B: CHECK YOUR EMAIL SUCCESS CARD (MATCHING USER IMAGE 1)
    if (isSubmitted) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 font-sans text-slate-900">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-200/80 text-center space-y-6 animate-in fade-in duration-200">
                    {/* Green Check Circle */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                            <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Check your email</h2>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                            We've sent password reset instructions if an account exists for{' '}
                            <span className="font-semibold text-slate-800">{email}</span>. Please check your inbox and follow the link to reset your password.
                        </p>
                    </div>

                    {/* Black Return to Login Button */}
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs"
                    >
                        Return to Login
                    </button>
                </div>

                <div className="pt-8 text-center text-xs text-slate-400 font-mono">
                    PropPilot
                </div>
            </div>
        );
    }

    // STATE A: RECOVER YOUR ACCOUNT SPLIT-SCREEN (MATCHING USER IMAGE 4)
    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">
            {/* LEFT SPLIT: RECOVER YOUR ACCOUNT BRANDING */}
            <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/60 border-r border-slate-200">
                {/* Background Grid Pattern */}
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

                    {/* Headline */}
                    <div className="space-y-4 max-w-lg">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Recover your account
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            Manage your properties with confidence. We're here to help you get back to your workspace.
                        </p>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-4 max-w-md pt-2">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs text-slate-700">
                                <RotateCcw className="w-4 h-4 text-sky-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">Secure Recovery</span>
                        </div>

                        <div className="flex items-center gap-3.5">
                            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs text-slate-700">
                                <Lock className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">Encrypted Data</span>
                        </div>

                        <div className="flex items-center gap-3.5">
                            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs text-slate-700">
                                <Headphones className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">24/7 Support</span>
                        </div>
                    </div>
                </div>

                {/* Footer Copyright */}
                <div className="relative z-10 pt-12 text-xs text-slate-500">
                    © 2026 PropPilot Inc. All rights reserved.
                </div>
            </div>

            {/* RIGHT SPLIT: FORGOT PASSWORD FORM CARD */}
            <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-50">
                <div className="w-full max-w-md space-y-6">
                    {/* White Card */}
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-6 animate-in fade-in duration-200">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot your password?</h2>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Enter your email address and we'll send you instructions to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-xs"
                                    />
                                </div>
                            </div>

                            {/* Black Send Reset Link Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 text-xs"
                            >
                                {loading ? 'Sending link...' : 'Send Reset Link'}
                            </button>
                        </form>

                        {/* Back to Login */}
                        <div className="text-center pt-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back to Login</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
