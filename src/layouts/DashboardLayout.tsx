import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const DashboardLayout = () => {
  const [sidebarPinned, setSidebarPinned] = useState(false);

  const toggleSidebar = () => setSidebarPinned(!sidebarPinned);

  // El margen solo se desplaza si la barra está PINNED (anclada).
  // Si solo se expande por hover (auto-hide), la barra flota sobre el contenido.
  const currentMargin = sidebarPinned ? 260 : 70;

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar open={sidebarPinned} onToggle={toggleSidebar} />

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          ml: `${currentMargin}px`, 
          minHeight: '100vh',
          width: '100%',
          transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          bgcolor: 'background.default'
        }}
      >
        <Box sx={{ p: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};