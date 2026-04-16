import { Box, Avatar, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/useAuthStore';

const SIDEBAR_WIDTH = 260;

export const DashboardLayout = () => {
  const { user } = useAuthStore();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Área de contenido principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          ml: `${SIDEBAR_WIDTH}px`, // Empujamos el contenido el ancho del sidebar
          minHeight: '100vh',
          bgcolor: 'background.default',
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`
        }}
      >
        {/* Topbar minimalista */}
        <Box 
          sx={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            px: 4,
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            bgcolor: 'background.default',
            zIndex: 10
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {user ? `${user.nombres} ${user.apellidos}` : 'Usuario SGIR'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.id_rol === 1 ? 'Administrador' : 'Operador'}
              </Typography>
            </Box>
            <Avatar 
              sx={{ 
                width: 35, 
                height: 35, 
                bgcolor: 'text.primary',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              {user ? `${user.nombres[0]}${user.apellidos[0]}`.toUpperCase() : 'SG'}
            </Avatar>
          </Stack>
        </Box>

        {/* El contenido de cada página */}
        <Box sx={{ p: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};