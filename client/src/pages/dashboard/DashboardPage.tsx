import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react';
import api from '../../lib/api';
import type { DashboardSummary } from '../../types';
import { formatCurrency } from '../../types';
import toast from 'react-hot-toast';

// Explicitly type the summary parameter in stats array
const stats = [
    { label: 'Total Billed', value: (summary: DashboardSummary) => formatCurrency(summary?.totalBilled || 0), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Billing %', value: (summary: DashboardSummary) => `${summary?.billingPct || 0}%`, icon: ArrowUpRight, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { label: 'Overdue', value: (summary: DashboardSummary) => formatCurrency(summary?.overdue || 0), icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-500/10' },
];

export default function DashboardPage() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/api/dashboard/summary');
            setSummary(res.data);
        } catch {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const retryFetch = () => {
        setLoading(true);
        fetchDashboard();
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <button
                onClick={retryFetch}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium"
            >
                Retry
            </button>
        </div>
    );

    if (!summary) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-slate-500">No data available. Please try again later.</p>
            <button
                onClick={retryFetch}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Dashboard Oversight</h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Real-time performance metrics and financial summaries.</p>
                </div>
                <button
                    onClick={() => navigate('/work-progress')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
                >
                    <BarChart3 className="w-4 h-4" />
                    View Work Progress
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-6 bg-white border border-blue-200 rounded-2xl hover:border-blue-300 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[60px] opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-300 pointer-events-none -translate-y-1/2 translate-x-1/2`} />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className={`p-3 rounded-xl bg-slate-50 border border-blue-100 ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:shadow-[0_0_20px_rgba(37,99,235,0.1)]`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider relative z-10">{stat.label}</h3>
                        <p className="text-3xl font-bold text-slate-900 mt-2 relative z-10">{stat.value(summary)}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Partner Breakdown */}
                <section className="card bg-white border border-blue-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-blue-100 flex items-center justify-between bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-900 tracking-wide">Partner Performance</h2>
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {summary?.partnerBreakdown.map((partner) => (
                                <div key={partner.id} className="space-y-3 group">
                                    <div className="flex justify-between items-end text-sm">
                                        <span className="text-slate-600 font-medium group-hover:text-blue-600 transition-colors">{partner.display_name || partner.full_name}</span>
                                        <span className="text-slate-900 font-semibold">{formatCurrency(partner.billed)}</span>
                                    </div>
                                    <div className="h-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-full shadow-sm"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quick Actions / Recent Activity Placeholder */}
                <section className="card bg-white border border-blue-200 rounded-2xl overflow-hidden p-8 flex flex-col items-center justify-center text-center relative shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200 rounded-2xl flex items-center justify-center mb-6 relative z-10 rotate-3 hover:rotate-6 transition-transform duration-500 shadow-sm">
                        <LayoutDashboard className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">Explore More Features</h2>
                    <p className="text-slate-500 mb-8 max-w-sm relative z-10 leading-relaxed font-medium">Check out detailed reports and advanced analytics for better insights.</p>
                    <div className="flex gap-4 relative z-10">
                        <button
                            onClick={() => navigate('/assignments')}
                            className="btn-primary px-8"
                        >
                            Explore Assignments
                        </button>
                        <button
                            onClick={() => navigate('/billing')}
                            className="btn-secondary px-8"
                        >
                            View Billing
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
