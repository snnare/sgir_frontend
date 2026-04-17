import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const currentWidth = sidebarOpen ? 260 : 70;

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          ml: `${currentWidth}px`, // Margen dinámico
          minHeight: '100vh',
          width: '100%',
          transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Match con la animación del sidebar
          bgcolor: 'background.default'
        }}
      >
        {/* Topbar y Contenido permanecen igual */}
        <Box sx={{ p: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};