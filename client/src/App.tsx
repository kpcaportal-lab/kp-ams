import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import WorkProgressPage from './pages/dashboard/WorkProgressPage';
import ClientListPage from './pages/clients/ClientListPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import ProposalListPage from './pages/proposals/ProposalListPage';
import CreateProposalPage from './pages/proposals/CreateProposalPage';
import EditProposalPage from './pages/proposals/EditProposalPage';
import ProposalDetailPage from './pages/proposals/ProposalDetailPage';
import AssignmentListPage from './pages/assignments/AssignmentListPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import BillingPage from './pages/billing/BillingPage';
import UsersPage from './pages/users/UsersPage';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Force light mode by removing any dark class and ensuring light is set
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            fontWeight: '600',
            fontSize: '14px',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Protected Routes - Admin/Leadership Only */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'partner', 'director']} />}>
          <Route element={<Layout />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>

        {/* General Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/work-progress" element={<WorkProgressPage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/proposals" element={<ProposalListPage />} />
            <Route path="/proposals/new" element={<CreateProposalPage />} />
            <Route path="/proposals/:id" element={<ProposalDetailPage />} />
            <Route path="/proposals/:id/edit" element={<EditProposalPage />} />
            <Route path="/assignments" element={<AssignmentListPage />} />
            <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
            <Route path="/billing" element={<BillingPage />} />
          </Route>
        </Route>

        {/* Catch-all Redirects */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
