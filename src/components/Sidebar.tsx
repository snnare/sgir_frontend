import { Box, Typography, Stack, Divider, IconButton, Collapse, Switch, Tooltip, CircularProgress } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import BackupIcon from '@mui/icons-material/Backup';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { useLocation } from 'react-router-dom';
import { SidebarItem } from './SidebarItem';
import { useThemeStore } from '../store/useThemeStore';
import { useMonitoringStore } from '../store/useMonitoringStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from './GlobalNotification';
import { useState, useEffect } from 'react';

interface SidebarProps {
  open: boolean; // Acts as "Pinned" state
  onToggle: () => void;
}

export const Sidebar = ({ open: pinned, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { mode, toggleTheme } = useThemeStore();
  const { schedulerStatus, fetchSchedulerStatus, pauseMonitoring, resumeMonitoring, loading: monitoringLoading } = useMonitoringStore();
  const { user } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const [isHovered, setIsHovered] = useState(false);
  const [backupsExpanded, setBackupsExpanded] = useState(false);
  const [monitoringExpanded, setMonitoringExpanded] = useState(false);

  // The sidebar is visually "open" if it's either pinned or hovered
  const isExpanded = pinned || isHovered;

  const isAdmin = user?.id_rol === 1;

  useEffect(() => {
    fetchSchedulerStatus();
  }, [fetchSchedulerStatus]);

  const handleBackupsToggle = () => {
    if (!isExpanded) {
      onToggle();
    }
    setBackupsExpanded(!backupsExpanded);
  };

  const handleMonitoringToggle = () => {
    if (!isExpanded) {
      onToggle();
    }
    setMonitoringExpanded(!monitoringExpanded);
  };

  const handleToggleScheduler = async () => {
    try {
      if (schedulerStatus?.status === 'running') {
        await pauseMonitoring();
        showNotification('Monitoreo pausado exitosamente', 'info');
      } else {
        await resumeMonitoring();
        showNotification('Monitoreo reanudado exitosamente', 'success');
      }
    } catch (error: any) {
      console.error('Error toggling scheduler:', error);
    }
  };

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

      {/* Control Global de Monitoreo (Admin Only) */}
      {isAdmin && (
        <Box sx={{ px: isExpanded ? 2 : 1.5, py: 1.5 }}>
          <Box 
            sx={{ 
              p: isExpanded ? 2 : 1, 
              borderRadius: 2, 
              bgcolor: schedulerStatus?.status === 'running' ? 'success.lighter' : 'warning.lighter',
              border: '1px solid',
              borderColor: schedulerStatus?.status === 'running' ? 'success.light' : 'warning.light',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isExpanded ? 'flex-start' : 'center',
              gap: 1
            }}
          >
            <Stack 
              direction="row" 
              sx={{ 
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {isExpanded && (
                <Typography variant="caption" sx={{ fontWeight: 800, color: schedulerStatus?.status === 'running' ? 'success.dark' : 'warning.dark' }}>
                  MONITOREO
                </Typography>
              )}
              {monitoringLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Tooltip title={schedulerStatus?.status === 'running' ? 'Pausar Monitoreo' : 'Activar Monitoreo'}>
                  <Box component="span" sx={{ display: 'inline-flex' }}>
                    <Switch 
                      size="small" 
                      checked={schedulerStatus?.status === 'running'} 
                      onChange={handleToggleScheduler}
                      color="success"
                    />
                  </Box>
                </Tooltip>
              )}
            </Stack>
            {isExpanded && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                Status: {schedulerStatus?.status.toUpperCase() || '...'}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <Stack spacing={0.5} sx={{ px: isExpanded ? 2 : 1, mt: 1, flexGrow: 1 }}>
        <SidebarItem 
          icon={<HomeIcon fontSize="small" />} 
          label="Home" 
          to="/" 
          active={location.pathname === '/'} 
          open={isExpanded} 
        />
        <SidebarItem 
          icon={<SearchIcon fontSize="small" />} 
          label="Buscar Activos" 
          to="/activos" 
          active={location.pathname.startsWith('/activos')} 
          open={isExpanded} 
        />
        
        {/* Grupo de Backups */}
        <SidebarItem 
          icon={<BackupIcon fontSize="small" />} 
          label="Backups" 
          onClick={handleBackupsToggle}
          active={location.pathname.startsWith('/backups')} 
          open={isExpanded} 
          hasChildren
          expanded={backupsExpanded}
        />
        <Collapse in={isExpanded && backupsExpanded} timeout="auto" unmountOnExit>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            <SidebarItem 
              icon={<AssignmentIcon fontSize="small" sx={{ fontSize: '1rem' }} />} 
              label="Políticas" 
              to="/backups/politicas" 
              active={location.pathname === '/backups/politicas'} 
              open={isExpanded} 
              isSubItem
            />
            <SidebarItem 
              icon={<FolderSpecialIcon fontSize="small" sx={{ fontSize: '1rem' }} />} 
              label="Rutas" 
              to="/backups/rutas" 
              active={location.pathname === '/backups/rutas'} 
              open={isExpanded} 
              isSubItem
            />
            <SidebarItem 
              icon={<TravelExploreIcon fontSize="small" sx={{ fontSize: '1rem' }} />} 
              label="Explorador RAW" 
              to="/backups/explorador" 
              active={location.pathname === '/backups/explorador'} 
              open={isExpanded} 
              isSubItem
            />
          </Stack>
        </Collapse>

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
          onClick={handleMonitoringToggle}
          active={location.pathname.startsWith('/monitoreo')} 
          open={isExpanded} 
          hasChildren
          expanded={monitoringExpanded}
        />
        <Collapse in={isExpanded && monitoringExpanded} timeout="auto" unmountOnExit>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            <SidebarItem 
              icon={<ListAltIcon fontSize="small" sx={{ fontSize: '1rem' }} />} 
              label="Logs" 
              to="/monitoreo/logs" 
              active={location.pathname === '/monitoreo/logs'} 
              open={isExpanded} 
              isSubItem
            />
            <SidebarItem 
              icon={<NotificationsActiveIcon fontSize="small" sx={{ fontSize: '1rem' }} />} 
              label="Alertas" 
              to="/monitoreo/alertas" 
              active={location.pathname === '/monitoreo/alertas'} 
              open={isExpanded} 
              isSubItem
            />
          </Stack>
        </Collapse>
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
