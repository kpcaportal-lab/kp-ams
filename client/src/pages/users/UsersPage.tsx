'use client';

import { useEffect, useState } from 'react';
import {
    UserPlus, Search, Shield, Mail, MoreVertical,
    UserCircle, BadgeCheck
} from 'lucide-react';
import api from '@/lib/api';
import type { User, UserRole } from '@/types';
import toast from 'react-hot-toast';
import AddUserModal from '@/components/modals/AddUserModal';

export default function UsersPage() {
    const [profiles, setProfiles] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/users');
            setProfiles(res.data);
        } catch (err: unknown) {
            console.error('Error fetching users:', err);
            toast.error('Failed to load user management data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filtered = profiles.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const roleStyles: Record<UserRole, string> = {
        admin: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        partner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        director: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        manager: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
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
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-1">Control access levels and manage team profiles across the organization.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Invite User</span>
                </button>
            </header>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by name or email address..."
                    className="w-full bg-white border border-blue-200 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((user) => (
                    <div key={user.id} className="bg-white border border-blue-200 rounded-2xl p-6 hover:border-blue-300 transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {user.full_name.charAt(0)}
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${roleStyles[user.role]}`}>
                                {user.role}
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                    {user.full_name}
                                </h3>
                                <BadgeCheck className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{user.email}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-blue-200 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                <Shield className="w-3.5 h-3.5 text-slate-400" />
                                {user.role} Access
                            </div>
                            <button className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="p-20 text-center bg-slate-50 rounded-2xl border border-dashed border-blue-200">
                    <UserCircle className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-slate-900 font-medium">No users found</h3>
                    <p className="text-slate-500 text-sm mt-1">Adjust your search parameters.</p>
                </div>
            )}

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </div>
    );
}
