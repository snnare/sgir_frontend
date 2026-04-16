import { Box, Typography, Stack, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import BackupIcon from '@mui/icons-material/Backup';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import { SidebarItem } from './SidebarItem';
import { useAuthStore } from '../store/useAuthStore';

const SIDEBAR_WIDTH = 260;

export const Sidebar = () => {
  const logoutAction = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <Box 
      component="nav"
      sx={{ 
        width: SIDEBAR_WIDTH, 
        flexShrink: 0,
        borderRight: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        zIndex: 1200,
        bgcolor: 'background.paper'
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, mb: 2 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '-0.05em',
            color: 'text.primary' 
          }}
        >
          SGIR
        </Typography>
      </Box>

      {/* Navigation Items */}
      <Stack spacing={0.5} sx={{ px: 2, flexGrow: 1 }}>
        <SidebarItem 
          icon={<DashboardIcon fontSize="small" />} 
          label="Dashboard" 
          active 
          to="/"
        />
        <SidebarItem 
          icon={<MonitorHeartIcon fontSize="small" />} 
          label="Monitoreo" 
          to="/monitoreo"
        />
        <SidebarItem 
          icon={<BackupIcon fontSize="small" />} 
          label="Backups" 
          to="/backups"
        />
        <SidebarItem 
          icon={<SearchIcon fontSize="small" />} 
          label="Activos" 
          to="/activos"
        />
      </Stack>

      {/* Footer / Logout */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <SidebarItem 
          icon={<LogoutIcon fontSize="small" />} 
          label="Cerrar Sesión" 
          to="/login"
          isLogout
          onClick={handleLogout}
        />
      </Box>
    </Box>
  );
};