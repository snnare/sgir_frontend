import { useMemo, useEffect } from 'react';
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
import { PostRegisterWizard } from './pages/PostRegisterWizard';
import { BulkUploadPage } from './pages/BulkUploadPage';
import { AddServerPage } from './pages/AddServerPage';
import { AddCredentialPage } from './pages/AddCredentialPage'
import { AddInstancePage } from './pages/AddInstancePage'
import { AddDbmsPage } from './pages/AddDbmsPage'
import { AddBackupPolicyPage } from './pages/AddBackupPolicyPage';
import { AddBackupPathPage } from './pages/AddBackupPathPage';
import { DashboardLayout } from './layouts/DashboardLayout';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
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
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { status } = useAuthStore();

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return children;
};

import { GlobalNotification } from './components/GlobalNotification';

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
            <Route path="setup-wizard/:serverId" element={<PostRegisterWizard />} />
            <Route path="add-server" element={<AddServerPage />} />
            <Route path="bulk-upload" element={<BulkUploadPage />} />
            <Route path="credenciales" element={<CredentialsPage />} />
            <Route path="credenciales/nueva" element={<AddCredentialPage />} />
            <Route path="credenciales/editar/:id" element={<EditCredentialPage />} />
            <Route path="add-instance" element={<AddInstancePage />} />
            <Route path="add-dbms" element={<AddDbmsPage />} />
            <Route path="add-policy" element={<AddBackupPolicyPage />} />
            <Route path="add-path" element={<AddBackupPathPage />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;