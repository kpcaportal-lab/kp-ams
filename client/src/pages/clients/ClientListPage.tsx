import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Filter, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import type { Client, ClientStatus } from '../../types';
import { formatDate } from '../../types';
import toast from 'react-hot-toast';
import AddClientModal from '../../components/modals/AddClientModal';

export default function ClientListPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/clients');
            setClients(res.data);
        } catch (err: unknown) {
            console.error('Error fetching clients:', err);
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const filteredClients = clients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.gstn?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusStyles: Record<ClientStatus, string> = {
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        prospect: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
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
                    <h1 className="text-2xl font-bold text-slate-900">Client Directory</h1>
                    <p className="text-slate-500 mt-1">Manage all client accounts and their associated status.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Client</span>
                </button>
            </header>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-xl border border-blue-200">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search clients by name or GSTN..."
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
                        onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'all')}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="prospect">Prospect</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Client Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                    <div
                        key={client.id}
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="group bg-white border border-blue-200 rounded-xl p-5 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyles[client.status]}`}>
                                {client.status}
                            </span>
                        </div>

                        <div className="mt-4 relative z-10">
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {client.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">
                                {client.gstn || 'No GSTN Provided'}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                            <span>Added: {formatDate(client.created_at)}</span>
                            <div className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>View Details</span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Subtle Background Glow */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
                    </div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-dashed border-blue-200">
                    <Building2 className="w-12 h-12 text-blue-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No clients found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
                </div>
            )}

            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchClients}
            />
        </div>
    );
}
