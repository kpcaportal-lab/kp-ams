import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import api from '../lib/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/api/auth/login', { email, password });
                    const { token, user } = res.data;
                    localStorage.setItem('kp_token', token);
                    set({ user, token, isAuthenticated: true, isLoading: false });
                } catch (err: any) {
                    set({ isLoading: false });
                    const message = err.response?.data?.details || err.response?.data?.error || err.message || 'Login failed';
                    throw new Error(message);
                }
            },

            logout: () => {
                localStorage.removeItem('kp_token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            setUser: (user) => set({ user }),
        }),
        {
            name: 'kp-auth',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
