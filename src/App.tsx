import React, { useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { getTheme } from './theme';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';

import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { CheckPage } from './pages/CheckPage'

import { ProfilePage } from './pages/ProfilePage';
import { CredentialsPage } from './pages/CredentialsPage';
import { EditCredentialPage } from './pages/EditCredentialPage';
import { BulkUploadPage } from './pages/BulkUploadPage';
import { AddServerPage } from './pages/AddServerPage';
import { SearchAssetsPage } from './pages/SearchAssetsPage';
import { UpdateServerInfoPage } from './pages/UpdateServerInfoPage';
import { ServerDetailsPage } from './pages/ServerDetailsPage';
import { AddCredentialPage } from './pages/AddCredentialPage'
import { AddInstancePage } from './pages/AddInstancePage'
import { AddDbmsPage } from './pages/AddDbmsPage'
import { AddBackupPolicyPage } from './pages/AddBackupPolicyPage';
import { BackupPoliciesPage } from './pages/BackupPoliciesPage';
import { EditBackupPolicyPage } from './pages/EditBackupPolicyPage';
import { BackupPoliciesDetailsPage } from './pages/BackupPoliciesDetailsPage';
import { AddBackupPathPage } from './pages/AddBackupPathPage';
import { EditBackupPathPage } from './pages/EditBackupPathPage';
import { BackupPathsPage } from './pages/BackupPathsPage';
import { BackupDiscoveryPage } from './pages/BackupDiscoveryPage';
import { MonitoringLogsPage } from './pages/MonitoringLogsPage';
import { MonitoringAlertsPage } from './pages/MonitoringAlertsPage';
import { DashboardLayout } from './layouts/DashboardLayout';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAuthStore();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Componente para rutas públicas (login/register) que no deben ser accesibles si ya estás logueado
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAuthStore();

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return children;
};

import { GlobalNotification } from './components/GlobalNotification';
import { ConfirmDialog } from './components/ConfirmDialog';
import { AlertDialog } from './components/AlertDialog';

function App() {
  const mode = useThemeStore((state) => state.mode);
  const { checkAuth, status } = useAuthStore();

  // Generamos el tema basado en el modo del store
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Validar sesión al cargar la aplicación
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Mostrar pantalla de carga solo en el arranque inicial (idle)
  if (status === 'idle') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalNotification />
      <ConfirmDialog />
      <AlertDialog />
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/ping" element={<CheckPage />} />
          {/* Rutas Protegidas (Bajo DashboardLayout) */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="activos" element={<SearchAssetsPage />} />
            <Route path="add-server" element={<AddServerPage />} />
            <Route path="server/:id" element={<ServerDetailsPage />} />
            <Route path="server/edit/:id" element={<UpdateServerInfoPage />} />
            <Route path="bulk-upload" element={<BulkUploadPage />} />
            <Route path="credenciales" element={<CredentialsPage />} />
            <Route path="credenciales/nueva" element={<AddCredentialPage />} />
            <Route path="credenciales/editar/:id" element={<EditCredentialPage />} />
            <Route path="add-instance" element={<AddInstancePage />} />
            <Route path="add-dbms" element={<AddDbmsPage />} />
            <Route path="backups/politicas" element={<BackupPoliciesPage />} />
            <Route path="backups/politica/:id" element={<BackupPoliciesDetailsPage />} />
            <Route path="add-policy" element={<AddBackupPolicyPage />} />
            <Route path="edit-policy/:id" element={<EditBackupPolicyPage />} />
            <Route path="backups/rutas" element={<BackupPathsPage />} />
            <Route path="add-path" element={<AddBackupPathPage />} />
            <Route path="edit-path/:id" element={<EditBackupPathPage />} />
            <Route path="backups/explorador" element={<BackupDiscoveryPage />} />
            <Route path="monitoreo/logs" element={<MonitoringLogsPage />} />
            <Route path="monitoreo/alertas" element={<MonitoringAlertsPage />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;