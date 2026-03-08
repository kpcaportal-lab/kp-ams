import { useEffect, useState } from 'react';
import {
    Receipt, Search,
    DollarSign, ExternalLink, Mail, Clock, CheckCircle2
} from 'lucide-react';
import api from '../../lib/api';
import type { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../types';
import toast from 'react-hot-toast';

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                // Assuming /api/invoices exists based on the server route file examined earlier
                const res = await api.get('/api/invoices');
                setInvoices(res.data);
            } catch (err: unknown) {
                console.error('Error fetching invoices:', err);
                toast.error('Failed to load billing records');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const filtered = invoices.filter(i =>
        i.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        i.udin?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Billing & Invoicing</h1>
                    <p className="text-slate-500 mt-1">Monitor revenue stream and manage professional fee invoices.</p>
                </div>
            </header>

            {/* Financial Overview Tags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-100 border border-blue-200 rounded-2xl p-6 relative overflow-hidden group">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Total Billed</p>
                    <p className="text-3xl font-black text-slate-900">INR 0</p>
                    <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
                </div>
                <div className="bg-emerald-100 border border-emerald-200 rounded-2xl p-6 relative overflow-hidden group">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Collected</p>
                    <p className="text-3xl font-black text-slate-900">INR 0</p>
                    <CheckCircle2 className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
                </div>
                <div className="bg-rose-100 border border-rose-200 rounded-2xl p-6 relative overflow-hidden group">
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">Outstanding</p>
                    <p className="text-3xl font-black text-slate-900">INR 0</p>
                    <Clock className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search invoices by client or UDIN..."
                    className="w-full bg-white border border-blue-200 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white border border-blue-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-blue-200 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                <th className="px-6 py-4 font-black">Date</th>
                                <th className="px-6 py-4 font-black">Client / Assignment</th>
                                <th className="px-6 py-4 font-black">UDIN</th>
                                <th className="px-6 py-4 font-black text-right">Net Amount</th>
                                <th className="px-6 py-4 font-black text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-200">
                            {filtered.map((i) => (
                                <tr key={i.id} className="hover:bg-blue-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-slate-900">{formatDate(i.invoice_date)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{i.client_name}</p>
                                            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{i.narration}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-400">{i.udin || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-sm font-bold text-slate-900">{formatCurrency(i.net_amount)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white" title="View PDF">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white" title="Email Client">
                                                <Mail className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="p-20 text-center">
                        <Receipt className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                        <h3 className="text-slate-900 font-medium">No billing records found</h3>
                        <p className="text-slate-500 text-sm mt-1">Historical invoices will appear here once generated.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
