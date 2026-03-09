'use client';

import { useEffect, useState } from 'react';
import {
    Users, CheckCircle, Clock, DollarSign,
    Target
} from 'lucide-react';
import api from '@/lib/api';
import type { UserWorkProgress } from '@/types';
import { formatCurrency } from '@/types';
import toast from 'react-hot-toast';

export default function WorkProgressPage() {
    const [progress, setProgress] = useState<UserWorkProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkProgress = async () => {
            try {
                const res = await api.get('/api/dashboard/work-progress');
                setProgress(res.data);
            } catch {
                toast.error('Failed to load work progress data');
            } finally {
                setLoading(false);
            }
        };
        fetchWorkProgress();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!progress) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header>
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">My Work Progress</h1>
                <p className="text-slate-500 mt-1 font-medium italic">Your proposal completion and billing progress tracking.</p>
            </header>

            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-widest">Completed</p>
                            <p className="text-3xl font-bold text-emerald-900 mt-1">{progress.completed_percentage}%</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-amber-700 uppercase tracking-widest">Pending</p>
                            <p className="text-3xl font-bold text-amber-900 mt-1">{progress.pending_percentage}%</p>
                        </div>
                        <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-blue-700 uppercase tracking-widest">Completed Amount</p>
                            <p className="text-xl font-bold text-blue-900 mt-1">{formatCurrency(progress.completed_amount)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-700 uppercase tracking-widest">Pending Amount</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(progress.pending_amount)}</p>
                        </div>
                        <Target className="w-8 h-8 text-slate-600" />
                    </div>
                </div>
            </div>

            {/* User Progress Card */}
            <UserProgressCard user={progress} />
        </div>
    );
}

function UserProgressCard({ user }: { user: UserWorkProgress }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">{user.user_name}</h3>
                    <p className="text-sm text-slate-500">{user.total_proposals} total proposals</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-emerald-600">Completed: {user.completed_percentage}%</span>
                    <span className="text-amber-600">Pending: {user.pending_percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                        className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${user.completed_percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-600 uppercase font-bold tracking-widest">Completed</p>
                    <p className="text-lg font-bold text-emerald-900">{user.completed_proposals}</p>
                    <p className="text-xs text-emerald-600">{formatCurrency(user.completed_amount)}</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600 uppercase font-bold tracking-widest">Pending</p>
                    <p className="text-lg font-bold text-amber-900">{user.pending_proposals}</p>
                    <p className="text-xs text-amber-600">{formatCurrency(user.pending_amount)}</p>
                </div>
            </div>

            {/* Completed Items */}
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Cleared Proposals ({user.completed_items.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    {user.completed_items.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg">
                            <span className="text-sm text-slate-900 truncate flex-1">{item.client_name}</span>
                            <span className="text-sm font-medium text-emerald-700 ml-2">{formatCurrency(item.proposal_amount)}</span>
                        </div>
                    ))}
                    {user.completed_items.length > 5 && (
                        <p className="text-xs text-slate-500 text-center">+{user.completed_items.length - 5} more</p>
                    )}
                </div>
            </div>

            {/* Pending Items */}
            <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Remaining Proposals ({user.pending_items.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    {user.pending_items.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-amber-50 rounded-lg">
                            <span className="text-sm text-slate-900 truncate flex-1">{item.client_name}</span>
                            <span className="text-xs text-amber-600 ml-2">
                                {item.tentative_date ? new Date(item.tentative_date).toLocaleDateString() : 'TBD'}
                            </span>
                        </div>
                    ))}
                    {user.pending_items.length > 5 && (
                        <p className="text-xs text-slate-500 text-center">+{user.pending_items.length - 5} more</p>
                    )}
                </div>
            </div>
        </div>
    );
}