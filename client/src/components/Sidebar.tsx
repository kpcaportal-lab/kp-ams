'use client';

import { useState } from 'react';
import NavLink from './NavLink';
import { useNavigate } from '@/hooks/useNavigate';
import { useAuthStore } from '@/store/authStore';
import {
    LayoutDashboard, Users, FileText, ClipboardList,
    Receipt, Building2, LogOut, Menu, ChevronRight,
    UserCircle, BarChart3
} from 'lucide-react';
import type { UserRole } from '../types';

const NAV = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'partner', 'director', 'manager'] as UserRole[] },
    { to: '/work-progress', icon: BarChart3, label: 'Work Progress', roles: ['admin', 'partner', 'director', 'manager'] as UserRole[] },
    { to: '/clients', icon: Building2, label: 'Clients', roles: ['admin', 'partner', 'director', 'manager'] as UserRole[] },
    { to: '/proposals', icon: FileText, label: 'Proposals', roles: ['admin', 'partner', 'director', 'manager'] as UserRole[] },
    { to: '/assignments', icon: ClipboardList, label: 'Assignments', roles: ['admin', 'partner', 'director', 'manager'] as UserRole[] },
    { to: '/billing', icon: Receipt, label: 'Billing', roles: ['admin', 'partner', 'director', 'manager'] as UserRole[] },
    { to: '/users', icon: Users, label: 'User Management', roles: ['admin', 'partner', 'director'] as UserRole[] },
];

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };
    const links = NAV.filter(n => user && n.roles.includes(user.role));

    const roleBadgeClass: Record<UserRole, string> = {
        admin: 'badge-purple', partner: 'badge-blue', director: 'badge-amber', manager: 'badge-green'
    };

    return (
        <aside className={`flex flex-col ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out 
      bg-white border-r border-blue-200 h-screen sticky top-0 flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(37,99,235,0.08)]`}>

            {/* Header */}
            <div className="flex items-center h-20 px-4 border-b border-blue-100">
                <div className={`flex items-center gap-3 flex-1 overflow-hidden transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-[1px]">
                        <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 tracking-widest uppercase">K&amp;P AMS</p>
                    </div>
                </div>
                <button onClick={() => setCollapsed(!collapsed)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all ml-auto flex-shrink-0 active:scale-95">
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} title={collapsed ? label : undefined}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group
                            ${isActive
                                ? 'bg-blue-50 text-blue-600 shadow-[inset_3px_0_0_#2563eb]'
                                : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`
                        }>
                        {({ isActive }) => (
                            <>
                                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'text-blue-600 drop-shadow-[0_0_8px_rgba(37,99,235,0.2)]' : 'group-hover:scale-110'}`} />
                                <span className={`truncate transition-all duration-300 ${collapsed ? 'opacity-0 w-0 translate-x-4' : 'opacity-100 w-auto translate-x-0'}`}>
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* User footer */}
            <div className="p-3 border-t border-blue-100 bg-slate-50">
                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${collapsed ? 'justify-center' : 'hover:bg-slate-100'}`}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 relative">
                        <UserCircle className="w-6 h-6 text-blue-600" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className={`flex-1 overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.display_name || user?.full_name}</p>
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest mt-0.5 block ${roleBadgeClass[user?.role as UserRole]?.replace('badge ', '') || 'text-slate-500'}`}>
                            {user?.role}
                        </span>
                    </div>

                    {!collapsed && (
                        <button onClick={handleLogout} title="Logout"
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0 mt-auto shadow-[0_0_0_rgba(225,29,72,0)] hover:shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
                {collapsed && (
                    <button onClick={handleLogout} title="Logout"
                        className="w-full mt-2 flex items-center justify-center py-3 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </div>
        </aside>
    );
}
