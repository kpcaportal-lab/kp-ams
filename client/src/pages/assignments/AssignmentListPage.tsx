import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList, Search, Filter,
    CheckCircle2, Clock, PlayCircle, AlertCircle,
    Building2, ChevronRight, Tags, Calendar
} from 'lucide-react';
import api from '../../lib/api';
import type { Assignment, AssignmentStatus, AssignmentSubcategory } from '../../types';
import { formatCurrency, SUBCATEGORY_LABELS } from '../../types';
import toast from 'react-hot-toast';

export default function AssignmentListPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'all'>('all');
    const [subcategoryFilter, setSubcategoryFilter] = useState<AssignmentSubcategory | 'all'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/api/assignments');
                setAssignments(res.data);
            } catch (err: unknown) {
                console.error('Error fetching assignments:', err);
                toast.error('Failed to load assignments');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    const filtered = assignments.filter(a => {
        const matchesSearch = a.client_name?.toLowerCase().includes(search.toLowerCase()) ||
            a.proposal_number?.toLowerCase().includes(search.toLowerCase()) ||
            a.scope_item?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchesSub = subcategoryFilter === 'all' || a.subcategory === subcategoryFilter;
        return matchesSearch && matchesStatus && matchesSub;
    });

    const statusConfig: Record<AssignmentStatus, { icon: React.ComponentType<{ className?: string }>, color: string, bg: string, border: string }> = {
        active: { icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
        completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
        draft: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
        postponed: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Assignments</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage professional engagements and service delivery.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 uppercase tracking-widest">
                    <ClipboardList className="w-3.5 h-3.5" />
                    {filtered.length} Assignments Active
                </div>
            </header>

            {/* Premium Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Client, Ref #, or Scope Area..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold appearance-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as AssignmentStatus | 'all')}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="postponed">Postponed</option>
                    </select>
                </div>
                <div className="relative">
                    <Tags className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold appearance-none"
                        value={subcategoryFilter}
                        onChange={(e) => setSubcategoryFilter(e.target.value as AssignmentSubcategory | 'all')}
                    >
                        <option value="all">Sub-Categories</option>
                        {Object.entries(SUBCATEGORY_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Assignment Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filtered.map((a) => {
                    const status = statusConfig[a.status];
                    const StatusIcon = status.icon;
                    return (
                        <div
                            key={a.id}
                            onClick={() => navigate(`/assignments/${a.id}`)}
                            className="bg-white border border-blue-50 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Building2 className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-lg">
                                            {a.client_name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{a.proposal_number || 'INTERNAL REF'}</span>
                                        {a.assessment_year && (
                                            <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
                                                <Calendar className="w-3 h-3" /> AY {a.assessment_year}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${status.bg} ${status.color} ${status.border}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {a.status}
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Scope</span>
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                </div>
                                <p className="text-sm text-slate-600 font-medium line-clamp-2 leading-relaxed h-10 italic">
                                    {a.scope_item || a.scope_areas || 'No specific scope points defined.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 py-4 border-y border-slate-100 bg-slate-50 -mx-6 px-6">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Service Sub-Line</p>
                                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <Tags className="w-3.5 h-3.5 text-blue-400" />
                                        {SUBCATEGORY_LABELS[a.subcategory] || a.subcategory}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Commercial Value</p>
                                    <p className="text-sm font-black text-slate-900">{formatCurrency(a.total_fees)}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">P</div>
                                        <span className="text-[11px] font-bold text-slate-700">{a.partner_name?.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">M</div>
                                        <span className="text-[11px] font-bold text-slate-700">{a.manager_name?.split(' ')[0]}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    View Timeline
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-blue-100">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                        <ClipboardList className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No matching assignments</h3>
                    <p className="text-slate-500 mt-2 max-w-sm text-center">Adjust your filters or search terms to find the specific professional engagement you're looking for.</p>
                </div>
            )}
        </div>
    );
}
