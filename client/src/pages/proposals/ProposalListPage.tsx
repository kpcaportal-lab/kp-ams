import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Plus, Search, Filter,
    Clock, CheckCircle2, XCircle,
    User, ChevronRight
} from 'lucide-react';
import api from '../../lib/api';
import type { Proposal, ProposalStatus } from '../../types';
import { formatDate, formatCurrency } from '../../types';
import toast from 'react-hot-toast';

export default function ProposalListPage() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const res = await api.get('/api/proposals');
                setProposals(res.data);
            } catch (err: unknown) {
                console.error('Error fetching proposals:', err);
                toast.error('Failed to load proposals');
            } finally {
                setLoading(false);
            }
        };
        fetchProposals();
    }, []);

    const filteredProposals = proposals.filter(p => {
        const matchesSearch = p.number.toLowerCase().includes(search.toLowerCase()) ||
            p.client_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusConfig: Record<ProposalStatus, { icon: React.ComponentType<{ className?: string }>, color: string, bg: string, border: string }> = {
        won: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        lost: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Proposal Pipeline</h1>
                    <p className="text-slate-500 mt-1">Track and manage service proposals and quotations.</p>
                </div>
                <button
                    onClick={() => navigate('/proposals/new')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Proposal</span>
                </button>
            </header>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-xl border border-blue-200">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by proposal number or client name..."
                        className="w-full bg-white border border-blue-200 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        className="bg-white border border-blue-200 rounded-lg py-2 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
            </div>

            {/* Proposal List */}
            <div className="bg-white border border-blue-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-blue-200 text-[11px] uppercase tracking-wider font-bold text-slate-600">
                                <th className="px-6 py-4">Proposal Details</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Responsible Partner</th>
                                <th className="px-6 py-4">Quotation Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-200">
                            {filteredProposals.map((p) => {
                                const status = statusConfig[p.status];
                                const StatusIcon = status.icon;
                                return (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-blue-50 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/proposals/${p.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{p.number}</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(p.proposal_date)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-700 font-medium truncate max-w-[150px]">{p.client_name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-blue-600" />
                                                <span className="text-sm text-slate-700">{p.partner_name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 font-mono text-sm text-slate-900">
                                                {formatCurrency(p.quotation_amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.color} ${status.border}`}>
                                                <StatusIcon className="w-2.5 h-2.5" />
                                                {p.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-slate-900 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredProposals.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FileText className="w-12 h-12 text-slate-500 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No proposals found</h3>
                        <p className="text-slate-600 mt-1">Refine your search parameters or create a new proposal.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
