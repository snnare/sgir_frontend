import { Box, Typography, Stack, Divider, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import BackupIcon from '@mui/icons-material/Backup';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useLocation } from 'react-router-dom';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ open, onToggle }: SidebarProps) => {
  const location = useLocation();

  return (
    <Box 
      component="nav"
      sx={{ 
        width: open ? 260 : 70, 
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 1200,
        borderRight: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
        overflowX: 'hidden'
      }}
    >
      {/* Header: Logo + Toggle */}
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent={open ? 'space-between' : 'center'} 
        sx={{ p: 2, minHeight: 64 }}
      >
        {open && (
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            SGIR
          </Typography>
        )}
        <IconButton onClick={onToggle} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
          {open ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
      </Stack>

      {/* Navigation Items */}
      <Stack spacing={0.5} sx={{ px: open ? 2 : 1, mt: 2, flexGrow: 1 }}>
        <SidebarItem 
          icon={<HomeIcon fontSize="small" />} 
          label="Home" 
          to="/" 
          active={location.pathname === '/'} 
          open={open} 
        />
        <SidebarItem 
          icon={<SearchIcon fontSize="small" />} 
          label="Activos" 
          to="/activos" 
          active={location.pathname.startsWith('/activos')} 
          open={open} 
        />
        <SidebarItem 
          icon={<BackupIcon fontSize="small" />} 
          label="Backups" 
          to="/backups" 
          active={location.pathname.startsWith('/backups')} 
          open={open} 
        />
        <SidebarItem 
          icon={<VpnKeyIcon fontSize="small" />} 
          label="Credenciales" 
          to="/credenciales" 
          active={location.pathname.startsWith('/credenciales')} 
          open={open} 
        />
        <SidebarItem 
          icon={<MonitorHeartIcon fontSize="small" />} 
          label="Monitoreo" 
          to="/monitoreo" 
          active={location.pathname.startsWith('/monitoreo')} 
          open={open} 
        />
      </Stack>

      {/* Footer / User Profile & Logout */}
      <Box sx={{ p: open ? 2 : 1 }}>
        <SidebarItem 
          icon={<PersonIcon fontSize="small" />} 
          label="Perfil" 
          to="/profile" 
          active={location.pathname === '/profile'} 
          open={open} 
        />
        <Divider sx={{ my: 1.5 }} />
        <SidebarItem 
          icon={<LogoutIcon fontSize="small" />} 
          label="Cerrar Sesión" 
          isLogout 
          open={open} 
        />
      </Box>
    </Box>
  );
};
