'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useNavigate } from '@/hooks/useNavigate';
import {
    Building2, ArrowLeft, Mail, Phone, User,
    ShieldCheck, Calendar, Info, Clock, Edit3, Trash2
} from 'lucide-react';
import api from '@/lib/api';
import type { Client, ClientSpoc } from '@/types';
import { formatDate } from '@/types';
import toast from 'react-hot-toast';

export default function ClientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [spocs, setSpocs] = useState<ClientSpoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const [clientRes, spocsRes] = await Promise.all([
                    api.get(`/api/clients/${id}`),
                    api.get(`/api/clients/${id}/spocs`)
                ]);
                setClient(clientRes.data);
                setSpocs(spocsRes.data);
            } catch (err: unknown) {
                toast.error('Failed to load client details');
                console.error(err);
                navigate('/clients');
            } finally {
                setLoading(false);
            }
        };
        fetchClientData();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!client) return null;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/clients')}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Directory
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="px-2 py-0.5 rounded bg-slate-50 border border-blue-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                    {client.gstn || 'No GSTN'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                    {client.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-900 rounded-lg border border-blue-200 transition-all text-sm font-medium">
                            <Edit3 className="w-4 h-4" />
                            Edit Client
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all text-sm font-medium">
                            <Trash2 className="w-4 h-4" />
                            Archive
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Cards */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Details Card */}
                    <div className="bg-slate-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6 text-slate-600">
                            <Info className="w-4 h-4" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider">About Client</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-600">Registration Date</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        {formatDate(client.created_at)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-600">Added By</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                                        <User className="w-4 h-4 text-emerald-400" />
                                        {client.added_by_name || 'System Admin'}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-600">Internal Audit Status</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                                        Compliant
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-600">Last Assessment</p>
                                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                                        <Clock className="w-4 h-4 text-amber-400" />
                                        12 Days Ago
                                    </div>
                                </div>
                            </div>
                        </div>
                        {client.notes && (
                            <div className="mt-8 pt-6 border-t border-blue-200">
                                <p className="text-xs text-slate-600 mb-2">Administrative Notes</p>
                                <p className="text-sm text-slate-500 leading-relaxed italic">
                                    "{client.notes}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contacts Card */}
                    <div className="bg-slate-50 border border-blue-200 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-blue-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Contact Persons (SPOCs)</h2>
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Manage SPOCs</button>
                        </div>
                        <div className="divide-y divide-blue-200">
                            {spocs.length > 0 ? spocs.map((spoc) => (
                                <div key={spoc.id} className="p-6 flex items-center justify-between group hover:bg-blue-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                                            {spoc.contact_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-slate-900">{spoc.contact_name}</h3>
                                                {spoc.is_primary && (
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase tracking-tighter border border-blue-200">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600">{spoc.designation || 'Key Liaison'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
                                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                                            {spoc.email}
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
                                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                            {spoc.phone}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-slate-600 italic text-sm">
                                    No designated contact persons listed for this client.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-blue-600 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl shadow-blue-500/10">
                        <div className="relative z-10">
                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Financial Status</h3>
                            <div className="space-y-1">
                                <p className="text-3xl font-bold">INR 0</p>
                                <p className="text-xs opacity-70">Outstanding Billing</p>
                            </div>
                            <div className="mt-8 space-y-3">
                                <div className="flex justify-between text-xs pb-2 border-b border-blue-300">
                                    <span className="opacity-70">Total Proposals</span>
                                    <span className="font-bold">0</span>
                                </div>
                                <div className="flex justify-between text-xs pb-2 border-b border-blue-300">
                                    <span className="opacity-70">Active Projects</span>
                                    <span className="font-bold">0</span>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-2 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                                Generate Client Statement
                            </button>
                        </div>
                        <Building2 className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}
