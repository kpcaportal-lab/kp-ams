'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useNavigate } from '@/hooks/useNavigate';
import {
    ArrowLeft, Save, DollarSign, Target, FileEdit, FileText,
    Copy, Settings
} from 'lucide-react';
import api from '@/lib/api';
import type { Client, ProposalType, AssignmentType, Proposal, ProposalTemplate } from '@/types';
import toast from 'react-hot-toast';

export default function EditProposalPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [partners, setPartners] = useState<{ id: string, full_name: string }[]>([]);
    const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [proposal, setProposal] = useState<Proposal | null>(null);

    const [form, setForm] = useState({
        client_id: '',
        proposal_type: 'new' as ProposalType,
        assignment_type: 'internal_audit' as AssignmentType,
        template_id: '',
        scope_areas: '',
        quotation_amount: '',
        responsible_partner: '',
        proposal_date: '',
        fiscal_year: '',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, partnersRes, templatesRes, proposalRes] = await Promise.all([
                    api.get('/api/clients'),
                    api.get('/api/proposals/users/partners'),
                    api.get('/api/proposals/templates'),
                    api.get(`/api/proposals/${id}`)
                ]);
                setClients(clientsRes.data);
                setPartners(partnersRes.data);
                setTemplates(templatesRes.data);

                const prop = proposalRes.data;
                setProposal(prop);
                setForm({
                    client_id: prop.client_id,
                    proposal_type: prop.proposal_type,
                    assignment_type: prop.assignment_type,
                    template_id: prop.template_id || '',
                    scope_areas: prop.scope_areas || '',
                    quotation_amount: prop.quotation_amount.toString(),
                    responsible_partner: prop.responsible_partner,
                    proposal_date: prop.proposal_date?.split('T')[0] || '',
                    fiscal_year: prop.fiscal_year,
                    notes: prop.notes || ''
                });
            } catch (err) {
                console.error('Error fetching data:', err);
                toast.error('Failed to load proposal data');
                navigate('/proposals');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/api/proposals/${id}`, {
                ...form,
                quotation_amount: Number(form.quotation_amount)
            });
            toast.success('Proposal updated successfully');
            navigate(`/proposals/${id}`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Failed to update proposal');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRevision = async () => {
        if (!proposal) return;
        const revisionDetails = prompt('What is changing in this revision?');
        if (revisionDetails === null) return;

        setLoading(true);
        try {
            const res = await api.post(`/api/proposals/${id}/revise`, {
                revision_details: revisionDetails.trim() || 'Manual Update'
            });
            toast.success('New revision created');
            navigate(`/proposals/${res.data.id}`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Failed to create revision');
            setLoading(false);
        }
    };

    if (fetchLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!proposal) return null;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="space-y-4 mb-8">
                <button
                    onClick={() => navigate(`/proposals/${id}`)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Detail
                </button>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
                            <FileEdit className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Editing Proposal: {proposal.number}</h1>
                            <p className="text-sm text-slate-600">Refining execution scope and quotation details.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreateRevision}
                            disabled={loading}
                            type="button"
                            title="Snapshot current state and start a new revision"
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20"
                        >
                            <Copy className="w-4 h-4" />
                            Branch Revision
                        </button>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-white border border-blue-200 rounded-2xl p-6 space-y-6 shadow-sm">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Identity & Category
                        </h2>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Client</label>
                            <select
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={form.client_id}
                                onChange={e => setForm({ ...form, client_id: e.target.value })}
                            >
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600">Type</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                    value={form.proposal_type}
                                    onChange={e => setForm({ ...form, proposal_type: e.target.value as ProposalType })}
                                >
                                    <option value="new">New Proposal</option>
                                    <option value="renewal">Renewal</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600">Fiscal Year</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 font-mono"
                                    value={form.fiscal_year}
                                    onChange={e => setForm({ ...form, fiscal_year: e.target.value })}
                                    placeholder="2025-26"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Ref Template (PPT)</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                value={form.template_id}
                                onChange={e => setForm({ ...form, template_id: e.target.value })}
                            >
                                <option value="">Default Standard Template</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Commercials */}
                    <div className="bg-white border border-blue-200 rounded-2xl p-6 space-y-6 shadow-sm">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Financials
                        </h2>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Quotation Fee (INR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                    value={form.quotation_amount}
                                    onChange={e => setForm({ ...form, quotation_amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Partner in Charge</label>
                            <select
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                value={form.responsible_partner}
                                onChange={e => setForm({ ...form, responsible_partner: e.target.value })}
                            >
                                {partners.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Document Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                value={form.proposal_date}
                                onChange={e => setForm({ ...form, proposal_date: e.target.value })}
                            />
                        </div>

                        <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex items-start gap-3">
                            <Settings className="w-4 h-4 text-orange-500 mt-0.5" />
                            <p className="text-[10px] text-orange-600 leading-relaxed uppercase font-bold tracking-tight">
                                Careful: Changing the Assignment Category might invalidate current template field mappings.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-blue-200 rounded-2xl p-8 space-y-6 shadow-sm">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Engagement Scope
                    </h2>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-blue-500" />
                            Scope Context & Specifics
                        </label>
                        <textarea
                            rows={8}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
                            placeholder="Direct scope areas..."
                            value={form.scope_areas}
                            onChange={e => setForm({ ...form, scope_areas: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate(`/proposals/${id}`)}
                        className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm uppercase tracking-widest"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-3 px-10 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 transition-all"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}