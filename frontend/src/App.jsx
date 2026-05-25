import { lazy, Suspense } from 'react';
import { useSocketIO } from './hooks/useSocketIO';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { CenteredSpinner } from './components/LoadingSkeletons';

// ── Public ──────────────────────────────────────────────────────────────────
const HomePage = lazy(() => import('./pages/public/HomePage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ResidentLoginPage = lazy(() => import('./pages/public/ResidentLoginPage'));
const StaffLoginPage = lazy(() => import('./pages/public/StaffLoginPage'));
const UnauthorizedPage = lazy(() => import('./pages/public/UnauthorizedPage'));
const VerifyCertificate = lazy(() => import('./pages/public/VerifyCertificate'));
// ── Resident ────────────────────────────────────────────────────────────────
const ResidentDashboard = lazy(() => import('./pages/resident/ResidentDashboard'));
const ResidentRequest = lazy(() => import('./pages/resident/ResidentRequest'));
const MyRequests = lazy(() => import('./pages/resident/MyRequests'));
const UpdateResident = lazy(() => import('./pages/resident/UpdateResident'));
const ResidentCivilStatus = lazy(() => import('./pages/resident/ResidentCivilStatus'));

// ── Clerk ───────────────────────────────────────────────────────────────────
const ClerkDashboard = lazy(() => import('./pages/clerk/ClerkDashboard'));
const ClerkRegisterResident = lazy(() => import('./pages/clerk/ClerkRegisterResident'));
const ClerkRequests = lazy(() => import('./pages/clerk/ClerkRequests'));
const ClerkVitalEvents = lazy(() => import('./pages/clerk/ClerkVitalEvents'));
const ClerkMarriageDivorce = lazy(() => import('./pages/clerk/ClerkMarriageDivorce'));
const VerifyResident = lazy(() => import('./pages/clerk/VerifyResident'));
const UploadCertificate = lazy(() => import('./pages/clerk/UploadCertificate'));
const CreateCertificate = lazy(() => import('./pages/clerk/CreateCertificate'));
const CreateMarriageCertificate = lazy(() => import('./pages/clerk/CreateMarriageCertificate'));
const CreateDivorceCertificate = lazy(() => import('./pages/clerk/CreateDivorceCertificate'));
const CreateMigrationCertificate = lazy(() => import('./pages/clerk/CreateMigrationCertificate'));
const ClerkProfile = lazy(() => import('./pages/shared/StaffProfile'));
const MigrationsPage = lazy(() => import('./pages/shared/MigrationsPage'));

// ── Shared ──────────────────────────────────────────────────────────────────
const ResidentsPage = lazy(() => import('./pages/shared/ResidentsPage'));

// ── Admin ───────────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests'));
const AdminMarriageDivorce = lazy(() => import('./pages/admin/AdminMarriageDivorce'));
const AdminVerifyResident = lazy(() => import('./pages/admin/AdminVerifyResident'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const AdminAuditLog = lazy(() => import('./pages/admin/AdminAuditLog'));

// ── Super Admin ──────────────────────────────────────────────────────────────
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const SuperAdminUsers = lazy(() => import('./pages/superadmin/SuperAdminUsers'));
const SuperAdminRoles = lazy(() => import('./pages/superadmin/SuperAdminRoles'));
const SuperAdminSystem = lazy(() => import('./pages/superadmin/SuperAdminSystem'));
const SystemSettings = lazy(() => import('./pages/superadmin/SystemSettings'));

// ── Suspense fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return <CenteredSpinner message="Loading page..." />;
}

function AppContent() {
  const { user } = useAuth();
  useSocketIO();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── PUBLIC ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/resident" element={<ResidentLoginPage />} />
          <Route path="/login/staff" element={<StaffLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:number" element={<VerifyCertificate />} />
          {/* ── DASHBOARD (protected) ── */}
          <Route element={<DashboardLayout />}>

            {/* Resident */}
            <Route path="resident" element={
              <ProtectedRoute roles={['resident']}><Outlet /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ResidentDashboard />} />
              <Route path="request" element={<ResidentRequest />} />
              <Route path="my-requests" element={<MyRequests />} />
              <Route path="profile" element={<UpdateResident />} />
              <Route path="civil-status" element={<ResidentCivilStatus />} />
            </Route>

            {/* Clerk */}
            <Route path="clerk" element={
              <ProtectedRoute roles={['clerk']}><Outlet /></ProtectedRoute>
            }>
              <Route index element={<ClerkDashboard />} />
              <Route path="register-resident" element={<ClerkRegisterResident />} />
              <Route path="residents" element={<ResidentsPage />} />
              <Route path="requests" element={<ClerkRequests />} />
              <Route path="vital-events" element={<ClerkVitalEvents />} />
              <Route path="marriage-divorce" element={<ClerkMarriageDivorce />} />
              <Route path="migrations" element={<MigrationsPage />} />
              <Route path="verify-resident" element={<VerifyResident />} />
              <Route path="upload-certificate" element={<UploadCertificate />} />
              <Route path="profile" element={<ClerkProfile />} />
              <Route path="create-certificate/:id" element={<CreateCertificate />} />
              <Route path="create-marriage-certificate/:id" element={<CreateMarriageCertificate />} />
              <Route path="create-divorce-certificate/:id" element={<CreateDivorceCertificate />} />
              <Route path="create-migration-certificate/:id" element={<CreateMigrationCertificate />} />
            </Route>

            {/* Admin */}
            <Route path="admin" element={
              <ProtectedRoute roles={['admin', 'superadmin']}><Outlet /></ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="residents" element={<ResidentsPage />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="marriage-divorce" element={<AdminMarriageDivorce />} />
              <Route path="migrations" element={<MigrationsPage />} />
              <Route path="verify-residents" element={<AdminVerifyResident />} />
              <Route path="reports" element={<Reports />} />
              <Route path="audit" element={<AdminAuditLog />} />
              <Route path="profile" element={<ClerkProfile />} />
            </Route>

            {/* Super Admin */}
            <Route path="superadmin" element={
              <ProtectedRoute roles={['superadmin']}><Outlet /></ProtectedRoute>
            }>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="users" element={<SuperAdminUsers />} />
              <Route path="roles" element={<SuperAdminRoles />} />
              <Route path="system" element={<SuperAdminSystem />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="audit" element={<AdminAuditLog />} />
              <Route path="profile" element={<ClerkProfile />} />
            </Route>

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <DataProvider>
              <AppContent />
            </DataProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;