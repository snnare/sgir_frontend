import { Box, Typography, Stack, Divider, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import BackupIcon from '@mui/icons-material/Backup';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { useLocation } from 'react-router-dom';
import { SidebarItem } from './SidebarItem';
import { useThemeStore } from '../store/useThemeStore';
import { useState } from 'react';

interface SidebarProps {
  open: boolean; // Acts as "Pinned" state
  onToggle: () => void;
}

export const Sidebar = ({ open: pinned, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { mode, toggleTheme } = useThemeStore();
  const [isHovered, setIsHovered] = useState(false);

  // The sidebar is visually "open" if it's either pinned or hovered
  const isExpanded = pinned || isHovered;

  return (
    <Box 
      component="nav"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ 
        width: isExpanded ? 260 : 70, 
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
        overflowX: 'hidden',
        boxShadow: !pinned && isHovered ? '4px 0 24px rgba(0,0,0,0.12)' : 'none'
      }}
    >
      {/* Header: Logo + Pin Toggle */}
      <Stack 
        direction="row" 
        sx={{ 
          p: 2, 
          minHeight: 64,
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center'
        }}
      >
        {isExpanded && (
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            SGIR
          </Typography>
        )}
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }} 
          size="small" 
          sx={{ 
            border: '1px solid', 
            borderColor: pinned ? 'primary.main' : 'divider',
            bgcolor: pinned ? 'action.selected' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          {pinned ? <PushPinIcon fontSize="inherit" /> : <PushPinOutlinedIcon fontSize="inherit" />}
        </IconButton>
      </Stack>

      {/* Navigation Items */}
      <Stack spacing={0.5} sx={{ px: isExpanded ? 2 : 1, mt: 2, flexGrow: 1 }}>
        <SidebarItem 
          icon={<HomeIcon fontSize="small" />} 
          label="Home" 
          to="/" 
          active={location.pathname === '/'} 
          open={isExpanded} 
        />
        <SidebarItem 
          icon={<SearchIcon fontSize="small" />} 
          label="Activos" 
          to="/activos" 
          active={location.pathname.startsWith('/activos')} 
          open={isExpanded} 
        />
        <SidebarItem 
          icon={<BackupIcon fontSize="small" />} 
          label="Backups" 
          to="/backups" 
          active={location.pathname.startsWith('/backups')} 
          open={isExpanded} 
        />
        <SidebarItem 
          icon={<VpnKeyIcon fontSize="small" />} 
          label="Credenciales" 
          to="/credenciales" 
          active={location.pathname.startsWith('/credenciales')} 
          open={isExpanded} 
        />
        <SidebarItem 
          icon={<MonitorHeartIcon fontSize="small" />} 
          label="Monitoreo" 
          to="/monitoreo" 
          active={location.pathname.startsWith('/monitoreo')} 
          open={isExpanded} 
        />
      </Stack>

      {/* Footer / User Profile & Logout */}
      <Box sx={{ p: isExpanded ? 2 : 1 }}>
        <SidebarItem 
          icon={mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />} 
          label={mode === 'light' ? 'Modo Oscuro' : 'Modo Claro'} 
          onClick={toggleTheme} 
          open={isExpanded} 
        />
        <SidebarItem 
          icon={<PersonIcon fontSize="small" />} 
          label="Perfil" 
          to="/profile" 
          active={location.pathname === '/profile'} 
          open={isExpanded} 
        />
        <Divider sx={{ my: 1.5 }} />
        <SidebarItem 
          icon={<LogoutIcon fontSize="small" />} 
          label="Cerrar Sesión" 
          isLogout 
          open={isExpanded} 
        />
      </Box>
    </Box>
  );
};
