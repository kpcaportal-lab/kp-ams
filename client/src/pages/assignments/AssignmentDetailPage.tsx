'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useNavigate } from '@/hooks/useNavigate';
import Link from 'next/link';
import {
    ArrowLeft, Calendar, Building2, FileText, CheckCircle2,
    PlayCircle, AlertCircle, Clock, Milestone, Edit3, Tags,
    ExternalLink, ShieldCheck, DollarSign, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import type { Assignment, AssignmentStatus } from '@/types';
import { formatCurrency, SUBCATEGORY_LABELS } from '@/types';
import toast from 'react-hot-toast';

export default function AssignmentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await api.get(`/api/assignments/${id}`);
                setAssignment(res.data);
            } catch (err: unknown) {
                const error = err as { response?: { data?: { error?: string } } };
                toast.error(error.response?.data?.error || 'Failed to load assignment details');
                navigate('/assignments');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignment();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!assignment) return null;

    const statusConfig: Record<AssignmentStatus, { icon: React.ComponentType<{ className?: string }>, color: string, bg: string, border: string }> = {
        active: { icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        draft: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
        postponed: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
    };

    const StatusIcon = statusConfig[assignment.status].icon;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <header className="space-y-4">
                <button
                    onClick={() => navigate('/assignments')}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Assignments
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{assignment.client_name}</h2>
                                </div>
                                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                                    {assignment.subcategory === 'compliance' ? 'Statutory Compliance' : (SUBCATEGORY_LABELS[assignment.subcategory] || 'Assignment View')}
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusConfig[assignment.status].bg} ${statusConfig[assignment.status].color} ${statusConfig[assignment.status].border}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {assignment.status}
                            </div>
                            {assignment.assessment_year && (
                                <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> AY {assignment.assessment_year}
                                </span>
                            )}
                            <span className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                FY {assignment.fiscal_year}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {assignment.proposal_id && (
                            <Link
                                to={`/proposals/${assignment.proposal_id}`}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-500 text-slate-600 hover:text-blue-600 rounded-xl transition-all text-sm font-bold shadow-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Proposal
                            </Link>
                        )}
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                            <Edit3 className="w-4 h-4" />
                            Update Progress
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Professional Metadata */}
                    <div className="bg-white border border-blue-100 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-2 text-slate-900">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-lg">Engagement Specifications</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref: {assignment.proposal_number || 'N/A'}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Service Classification</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <Tags className="w-4 h-4 text-indigo-500" />
                                        {SUBCATEGORY_LABELS[assignment.subcategory] || assignment.subcategory}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Specific Scope Target</p>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                                        {assignment.scope_item || 'Primary execution scope of the engagement.'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Ownership & Management</p>
                                    <div className="space-y-3 mt-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 ring-2 ring-white">P</div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">Partner</p>
                                                <p className="text-xs font-bold text-slate-900 leading-none">{assignment.partner_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 ring-2 ring-white">M</div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold leading-none mb-1">Manager</p>
                                                <p className="text-xs font-bold text-slate-900 leading-none">{assignment.manager_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {assignment.scope_areas && (
                            <div className="mt-10 pt-8 border-t border-slate-50">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-4">Master Proposal Scope Context</p>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 leading-relaxed whitespace-pre-wrap font-medium">
                                    {assignment.scope_areas}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline & Progress (Placeholder for future expansion) */}
                    <div className="bg-white border border-blue-50 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-8 text-slate-900">
                            <Milestone className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-bold text-lg">Execution Roadmap</h3>
                        </div>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-slate-200" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium">No active milestones defined for this assignment.</p>
                            <button className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest scale-95 hover:scale-100 transition-transform">
                                + Define Delivery Milestones
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vertical Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        {/* Abstract background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Financial Analytics</h3>

                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Total Contract Value</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black">{formatCurrency(assignment.total_fees)}</span>
                                    <span className="text-xs font-bold text-slate-500">Gross</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Billing Efficiency</span>
                                    <span className="text-white">0%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden ring-1 ring-white/10">
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full w-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-tighter">Billed to Date</span>
                                    <span className="font-black text-white">INR 0</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-tighter">Budget Remaining</span>
                                    <span className="font-black text-rose-400">{formatCurrency(assignment.total_fees)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-3">
                            <button className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
                                <DollarSign className="w-3.5 h-3.5" />
                                Initiate Billing
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Links</h4>
                        <div className="space-y-2">
                            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/50 transition-all group">
                                <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700">Audit Checklists</span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/50 transition-all group">
                                <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700">Internal File Repository</span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
