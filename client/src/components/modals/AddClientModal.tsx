'use client';

import React, { useState } from 'react';
import { X, Building2, Save } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
    const [name, setName] = useState('');
    const [gstn, setGstn] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Client name is required');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/clients', {
                name: name.trim(),
                gstn: gstn.trim() || null,
                notes: notes.trim() || null
            });
            toast.success('Client added successfully');
            onSuccess();
            onClose();
            // Reset form
            setName('');
            setGstn('');
            setNotes('');
        } catch (err) {
            console.error('Error adding client:', err);
            const error = err as { response?: { data?: { error?: string } } };
            toast.error(error.response?.data?.error || 'Failed to add client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-blue-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Add New Client</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Client Name *
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white border border-blue-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400"
                            placeholder="e.g. Acme Corporation"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            GSTN (Optional)
                        </label>
                        <input
                            type="text"
                            className="w-full bg-white border border-blue-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400"
                            placeholder="e.g. 27AAAAA0000A1Z5"
                            value={gstn}
                            onChange={(e) => setGstn(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            className="w-full bg-white border border-blue-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 min-h-[100px] resize-none"
                            placeholder="Add any internal notes about this client..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-medium transition-colors border border-blue-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Add Client</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
