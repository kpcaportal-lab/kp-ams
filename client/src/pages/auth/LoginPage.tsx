'use client';

import { useState } from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { useAuthStore } from '@/store/authStore';
import { Building2, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('🚀 Initiating login...');
            await login(email, password);
            console.log('✅ Login store update complete');
            toast.success('Login successful! Redirecting...');
            navigate('/dashboard');
        } catch (err: any) {
            console.error('❌ Login failed:', err.message);
            toast.error(err.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] relative overflow-hidden px-4">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
            </div>

            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-4 shadow-sm">
                        <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Kirtane &amp; Pandit LLP</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium tracking-wide">Audit Management System</p>
                </div>

                {/* Card */}
                <div className="card p-8 bg-white shadow-xl border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Sign in to your account</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="label">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="input pl-9"
                                    placeholder="you@kirtanepandit.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input pl-9 pr-10"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full btn-lg mt-2">
                            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo hint */}
                    <div className="mt-6 p-3 rounded-lg bg-white/3 border border-white/8">
                        <p className="text-xs text-gray-400 font-medium mb-2">Demo Credentials</p>
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                            <span>admin@kirtanepandit.com</span><span>KpAms@2025</span>
                            <span>partner1@kirtanepandit.com</span><span>KpAms@2025</span>
                            <span>manager1@kirtanepandit.com</span><span>KpAms@2025</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-600 mt-6">
                    Internal portal — authorized personnel only
                </p>
            </div>
        </div>
    );
}
