import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

interface Props {
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
    const { isAuthenticated, user } = useAuthStore();

    console.log('🛡️ ProtectedRoute:', { path: window.location.pathname, isAuthenticated, role: user?.role });

    if (!isAuthenticated) {
        console.warn('🚫 Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.warn(`🚫 Forbidden: Role ${user.role} not in`, allowedRoles);
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
