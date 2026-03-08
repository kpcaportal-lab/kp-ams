import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FilePlus, ArrowLeft, Send, DollarSign, Target, FileText, Settings
} from 'lucide-react';
import api from '../../lib/api';
import type { Client, ProposalType, AssignmentType, ProposalTemplate } from '../../types';
import toast from 'react-hot-toast';
import AddClientModal from '../../components/modals/AddClientModal';

export default function CreateProposalPage() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [partners, setPartners] = useState<{ id: string, full_name: string }[]>([]);
    const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

    const [form, setForm] = useState({
        client_id: '',
        proposal_type: 'new' as ProposalType,
        assignment_type: 'internal_audit' as AssignmentType,
        template_id: '',
        scope_areas: '', // Legacy string field or structured if needed
        quotation_amount: '',
        responsible_partner: '',
        proposal_date: new Date().toISOString().split('T')[0],
        fiscal_year: '2025-26',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, partnersRes, templatesRes] = await Promise.all([
                    api.get('/api/clients'),
                    api.get('/api/proposals/users/partners'),
                    api.get('/api/proposals/templates')
                ]);
                setClients(clientsRes.data);
                setPartners(partnersRes.data);
                setTemplates(templatesRes.data);
            } catch {
                toast.error('Failed to load form requirements');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/proposals', {
                ...form,
                quotation_amount: Number(form.quotation_amount)
            });
            toast.success('Proposal generated successfully');
            navigate(`/proposals/${res.data.id}`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Failed to create proposal');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClientSuccess = async () => {
        try {
            const clientsRes = await api.get('/api/clients');
            setClients(clientsRes.data);
            toast.success('Client list updated');
        } catch {
            toast.error('Failed to refresh client list');
        }
    };

    // Generate fiscal years for the dropdown
    const currentYear = new Date().getFullYear();
    const fiscalYears = [
        `${currentYear - 1}-${currentYear.toString().slice(-2)}`,
        `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="space-y-4 mb-8">
                <button
                    onClick={() => navigate('/proposals')}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Pipeline
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                        <FilePlus className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">New Professional Proposal</h1>
                        <p className="text-sm text-slate-600">Prepare a professional service quotation for a client.</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-white border border-blue-200 rounded-2xl p-6 space-y-6 shadow-sm">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Core Parameters
                        </h2>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Client Entity</label>
                            <div className="flex items-center gap-2">
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={form.client_id}
                                    onChange={e => setForm({ ...form, client_id: e.target.value })}
                                >
                                    <option value="">Select a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsAddClientModalOpen(true)}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                                >
                                    New Client
                                </button>
                            </div>
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
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                    value={form.fiscal_year}
                                    onChange={e => setForm({ ...form, fiscal_year: e.target.value })}
                                >
                                    {fiscalYears.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Assignment Category</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                value={form.assignment_type}
                                onChange={e => setForm({ ...form, assignment_type: e.target.value as AssignmentType })}
                            >
                                <option value="internal_audit">Internal Audit</option>
                                <option value="forensic">Forensic Audit</option>
                                <option value="overseas">Overseas Audit</option>
                                <option value="mcs">MCS</option>
                                <option value="ifc">IFC Testing</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Reference Template (PPT)</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                value={form.template_id}
                                onChange={e => setForm({ ...form, template_id: e.target.value })}
                            >
                                <option value="">Standard Default Template</option>
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
                            Financial Terms
                        </h2>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Proposed Fee (Quoted Amount)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="0.00"
                                    value={form.quotation_amount}
                                    onChange={e => setForm({ ...form, quotation_amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Responsible Partner</label>
                            <select
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                value={form.responsible_partner}
                                onChange={e => setForm({ ...form, responsible_partner: e.target.value })}
                            >
                                <option value="">Select a partner...</option>
                                {partners.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Proposal Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                value={form.proposal_date}
                                onChange={e => setForm({ ...form, proposal_date: e.target.value })}
                            />
                        </div>

                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                            <Settings className="w-4 h-4 text-blue-500 mt-0.5" />
                            <p className="text-[10px] text-blue-600 leading-relaxed uppercase font-bold tracking-tight">
                                These values will pre-populate the corresponding fields in the generated PowerPoint template.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scope & Notes */}
                <div className="bg-white border border-blue-200 rounded-2xl p-8 space-y-6 shadow-sm">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Engagement Scope
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                <Target className="w-3.5 h-3.5 text-blue-500" />
                                Execution Scope (Will map to assignments)
                            </label>
                            <textarea
                                rows={6}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                                placeholder="Describe the specific areas to be audited or analyzed..."
                                value={form.scope_areas}
                                onChange={e => setForm({ ...form, scope_areas: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600">Internal Remarks / Special Considerations</label>
                            <textarea
                                rows={2}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Any internal notes for the partner or management..."
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        disabled={loading}
                        className="flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-500/30"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Send className="w-5 h-5" />
                                Generate Quote
                            </>
                        )}
                    </button>
                </div>
            </form>

            <AddClientModal
                isOpen={isAddClientModalOpen}
                onClose={() => setIsAddClientModalOpen(false)}
                onSuccess={handleAddClientSuccess}
            />
        </div>
    );
}
