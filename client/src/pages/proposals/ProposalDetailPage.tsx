import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FileText, ArrowLeft, Calendar, User,
    Briefcase, FileCheck, AlertCircle,
    Edit3, CheckCircle, XCircle, Share2,
    Download, Copy, History, ExternalLink,
    ChevronDown, ChevronRight, FileDown
} from 'lucide-react';
import api from '../../lib/api';
import type { Proposal } from '../../types';
import { formatDate, formatCurrency, ASSIGNMENT_TYPE_LABELS } from '../../types';
import toast from 'react-hot-toast';

export default function ProposalDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);
    const [showVersions, setShowVersions] = useState(false);

    const fetchProposal = async () => {
        try {
            const res = await api.get(`/api/proposals/${id}`);
            setProposal(res.data);
        } catch (err: unknown) {
            console.error('Error fetching proposal:', err);
            toast.error('Failed to load proposal details');
            navigate('/proposals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposal();
    }, [id, navigate]);

    const handleStatusUpdate = async (status: 'won' | 'lost' | 'pending') => {
        try {
            let gstn = '';
            if (status === 'won' && !proposal?.client_gstn) {
                const input = prompt('Please enter Client GSTN (optional):');
                if (input !== null) gstn = input;
            }

            await api.patch(`/api/proposals/${id}/status`, { status, gstn });
            toast.success(`Proposal status updated to ${status}`);
            setProposal(prev => prev ? { ...prev, status, status_date: new Date().toISOString() } : null);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Update failed');
        }
    };

    const handleCreateRevision = async () => {
        const revisionDetails = prompt('Enter revision details (what changes are being made):');
        if (revisionDetails === null) return;

        try {
            const res = await api.post(`/api/proposals/${id}/revise`, {
                revision_details: revisionDetails.trim() || 'Manual revision'
            });
            toast.success('Proposal revision created successfully');
            navigate(`/proposals/${res.data.id}`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Failed to create revision');
        }
    };

    const handleExport = (format: 'pdf' | 'pptx') => {
        const apiBase = import.meta.env.VITE_API_URL || '';
        const url = `${apiBase}/api/proposals/${id}/export/${format}`;
        window.open(url, '_blank');
    };

    const handleGenerateAssignments = async () => {
        if (!proposal) return;
        // In a real app, this would open a modal to select/confirm scope items
        // For now, let's just navigate to a generation helper or use a simplified prompt
        navigate(`/proposals/${id}/generate-assignments`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!proposal) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <header className="space-y-4">
                <button
                    onClick={() => navigate('/proposals')}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Pipeline
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-slate-900">{proposal.number}</h1>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${proposal.status === 'won' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    proposal.status === 'lost' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                    {proposal.status}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                    v{proposal.version_number}
                                </span>
                            </div>
                            <p className="text-slate-600 mt-1 font-medium">{proposal.client_name}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Persistent Status Controls */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                                onClick={() => handleStatusUpdate('won')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${proposal.status === 'won' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Won
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('lost')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${proposal.status === 'lost' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Lost
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('pending')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${proposal.status === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                <AlertCircle className="w-3.5 h-3.5" />
                                Pending
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

                        <button
                            onClick={() => navigate(`/proposals/${id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={handleCreateRevision}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all text-sm font-medium"
                        >
                            <Copy className="w-4 h-4" />
                            Revise
                        </button>

                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-all text-sm font-medium shadow-lg">
                                <Download className="w-4 h-4" />
                                Export
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
                                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <FileDown className="w-4 h-4 text-rose-500" /> Professional PDF
                                </button>
                                <button onClick={() => handleExport('pptx')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <FileDown className="w-4 h-4 text-blue-500" /> Presentation (PPTX)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Won Status - Assignment Generation Banner */}
                    {proposal.status === 'won' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-900">Proposal Won!</h3>
                                    <p className="text-sm text-emerald-700">You can now generate execution assignments from the scope.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerateAssignments}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Generate Assignments
                            </button>
                        </div>
                    )}

                    {/* Main Details */}
                    <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Proposal Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Assignment Type</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <Briefcase className="w-4 h-4 text-blue-600" />
                                        {ASSIGNMENT_TYPE_LABELS[proposal.assignment_type] || proposal.assignment_type}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Fiscal Year</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                        {proposal.fiscal_year}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Proposal Date</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                        {formatDate(proposal.proposal_date)}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Responsible Partner</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <User className="w-4 h-4 text-cyan-500" />
                                        {proposal.partner_name || 'Not assigned'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Prepared By</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <FileCheck className="w-4 h-4 text-amber-500" />
                                        {proposal.prepared_by_name}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Client GSTN</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-bold italic">
                                        {proposal.client_gstn || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-4">Proposed Scope of Work</h3>
                            <div className="p-6 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap text-sm border border-slate-200 shadow-inner">
                                {proposal.scope_areas || 'No details provided.'}
                            </div>
                        </div>
                    </div>

                    {/* Commercials */}
                    <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Commercial Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mb-2">Quoted Fee</p>
                                <p className="text-3xl font-black text-slate-900">{formatCurrency(proposal.quotation_amount)}</p>
                            </div>
                            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Fee Category</p>
                                <p className="text-xl font-bold text-slate-900 capitalize">{proposal.fee_category || 'Standard'}</p>
                            </div>
                        </div>
                        {proposal.revised_fee && (
                            <div className="mt-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-amber-700">Revised Fee:</span>
                                <span className="text-xl font-black text-amber-900">{formatCurrency(proposal.revised_fee)}</span>
                            </div>
                        )}
                        {proposal.notes && (
                            <div className="mt-8 flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <AlertCircle className="w-6 h-6 text-slate-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Internal Notes</p>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{proposal.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions & History */}
                <div className="space-y-6">
                    {/* Revision History */}
                    <div className="bg-white border border-blue-200 rounded-2xl shadow-sm overflow-hidden">
                        <button
                            onClick={() => setShowVersions(!showVersions)}
                            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <History className="w-5 h-5 text-slate-400" />
                                <h3 className="font-bold text-slate-900">Revision History</h3>
                            </div>
                            {showVersions ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>

                        {(showVersions || proposal.version_number > 1) && (
                            <div className="px-6 pb-6 space-y-4">
                                <div className="space-y-4">
                                    {/* Link to previous versions if they exist */}
                                    {proposal.parent_proposal_id && (
                                        <Link
                                            to={`/proposals/${proposal.parent_proposal_id}`}
                                            className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 group-hover:border-blue-300">
                                                <History className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-900">Previous Version</p>
                                                <p className="text-[10px] text-slate-500 italic">Click to view snapshot</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 self-center text-slate-300 group-hover:text-blue-500" />
                                        </Link>
                                    )}

                                    {proposal.versions?.map((v) => (
                                        <div key={v.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center border border-blue-200">
                                                <span className="text-[10px] font-black text-blue-700">v{v.version_number}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{v.changes_summary || 'Manual update'}</p>
                                                <p className="text-[10px] text-slate-500">{formatDate(v.created_at)} by {v.created_by_name}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center border border-emerald-200">
                                            <span className="text-[10px] font-black text-emerald-700">v{proposal.version_number}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 text-emerald-900">Current Version</p>
                                            <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mt-1">Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
                            <Share2 className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-bold text-lg">Generate Document</h3>
                            <p className="text-slate-400 text-xs">Download the official proposal based on the standardized CA template.</p>
                        </div>
                        <div className="grid grid-cols-1 w-full gap-3">
                            <button
                                onClick={() => handleExport('pdf')}
                                className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileDown className="w-5 h-5 text-rose-400" />
                                    <span className="text-sm font-bold uppercase tracking-widest">PDF Format</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => handleExport('pptx')}
                                className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileDown className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm font-bold uppercase tracking-widest">PowerPoint</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
