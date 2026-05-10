import { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Box, Typography, Button, Stack, CircularProgress, 
  Tooltip, IconButton, Paper, Slide
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import DnsIcon from '@mui/icons-material/Dns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { MetricCard } from '../components/MetricCard';
import { ServerCard } from '../components/ServerCard';
import { useInfrastructureStore } from '../store/useInfrastructureStore';
import { useMonitoringStore } from '../store/useMonitoringStore';
import { useAuthStore } from '../store/useAuthStore';
import { deleteServer } from '../api/infrastructureService';
import { useNotificationStore } from '../components/GlobalNotification';
import { FilterBar } from '../components/FilterBar';

export const HomePage = () => {
  const navigate = useNavigate();
  const { 
    servers, loading, fetchServers, 
    fetchCriticalities, criticalities
  } = useInfrastructureStore();
  const { 
    schedulerStatus, liveMetrics: healthCache, alerts,
    fetchSchedulerStatus, fetchAlerts,
    pauseMonitoring, resumeMonitoring, fetchLiveCache 
  } = useMonitoringStore();
  const { user } = useAuthStore();
  const { showNotification } = useNotificationStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showScheduler, setShowScheduler] = useState(true);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchServers();
    fetchCriticalities();
    fetchSchedulerStatus();
    fetchLiveCache();
    fetchAlerts();
  }, [fetchServers, fetchCriticalities, fetchSchedulerStatus, fetchLiveCache, fetchAlerts]);

  const startHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (schedulerStatus?.status === 'running') {
      hideTimerRef.current = setTimeout(() => setShowScheduler(false), 5000);
    }
  };

  useEffect(() => {
    if (schedulerStatus?.status === 'running') {
      startHideTimer();
    } else {
      setShowScheduler(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [schedulerStatus?.status]);

  useEffect(() => {
    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(() => {
        if (servers.length > 0 && schedulerStatus?.status === 'running') {
          fetchLiveCache();
        }
      }, 15000); 
    };

    if (servers.length > 0) {
      fetchLiveCache();
      startPolling();
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [servers, schedulerStatus?.status, fetchLiveCache]);

  const handleEdit = (id: number) => {
    navigate(`/server/edit/${id}`);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el servidor "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      await deleteServer(id);
      showNotification('Servidor eliminado correctamente', 'success');
      fetchServers();
    } catch (error: any) {
      console.error('Error deleting server:', error);
      showNotification(error.response?.data?.detail || 'Error al eliminar el servidor', 'error');
    }
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
      showNotification('Error al cambiar el estado del scheduler', 'error');
    }
  };

  const isAdmin = user?.id_rol === 1;

  const filteredServers = useMemo(() => {
    return servers.filter(server => {
      const matchesSearch = 
        server.nombre_servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.direccion_ip.includes(searchTerm);
      
      const matchesCriticality = 
        criticalityFilter === 'all' || 
        server.id_nivel_criticidad === criticalityFilter;

      return matchesSearch && matchesCriticality;
    });
  }, [servers, searchTerm, criticalityFilter]);

  if (loading && servers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', position: 'relative' }}>
      
      {/* --- ACTIVADOR POR HOVER (ESQUINA SUPERIOR DERECHA) --- */}
      {isAdmin && !showScheduler && (
        <Box 
          onMouseEnter={() => {
            setShowScheduler(true);
            startHideTimer();
          }}
          sx={{ 
            position: 'fixed', 
            top: 0, 
            right: 0, 
            width: 150, 
            height: 40, 
            zIndex: 1400,
            cursor: 'pointer'
          }} 
        />
      )}

      {/* --- CONTROL FLOTANTE DEL SCHEDULER (TOP-RIGHT) --- */}
      {isAdmin && schedulerStatus && (
        <Slide in={showScheduler} direction="left">
          <Paper 
            elevation={6}
            onMouseEnter={() => {
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            }}
            onMouseLeave={() => {
              startHideTimer();
            }}
            sx={{ 
              position: 'fixed', 
              top: 24, 
              right: 24, 
              zIndex: 1300,
              p: 1.5, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              bgcolor: schedulerStatus.status === 'running' ? 'rgba(232, 245, 233, 0.98)' : 'rgba(255, 243, 224, 0.98)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: schedulerStatus.status === 'running' ? 'success.light' : 'warning.light',
              borderRadius: 3,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
              {schedulerStatus.status === 'running' ? (
                <MonitorHeartIcon color="success" sx={{ animation: 'pulse 2s infinite' }} />
              ) : (
                <PauseCircleIcon color="warning" />
              )}
              <Box>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, lineHeight: 1, color: 'text.secondary', fontSize: '0.6rem' }}>
                  SCHEDULER
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: schedulerStatus.status === 'running' ? 'success.dark' : 'warning.dark' }}>
                  {schedulerStatus.status.toUpperCase()}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={schedulerStatus.status === 'running' ? <PauseCircleIcon /> : <PlayCircleIcon />}
              onClick={handleToggleScheduler}
              sx={{ 
                bgcolor: schedulerStatus.status === 'running' ? 'success.dark' : 'warning.dark',
                color: 'white',
                borderRadius: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 100,
                '&:hover': { bgcolor: schedulerStatus.status === 'running' ? 'success.main' : 'warning.main' }
              }}
            >
              {schedulerStatus.status === 'running' ? 'Pausar' : 'Reanudar'}
            </Button>

            <IconButton 
              size="small" 
              onClick={() => {
                setShowScheduler(false);
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
              }}
              sx={{ ml: -0.5, color: 'text.secondary' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Slide>
      )}

      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{ mb: 4, gap: 2 }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            Dashboard Principal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Resumen de salud y control global de infraestructura.
          </Typography>
        </Box>
      </Stack>

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)'
          }, 
          gap: 3,
          mb: 4
        }}
      >
        <MetricCard 
          title="Servidores Totales" 
          value={servers.length} 
          unit="Nodos" 
          percent={100} 
          icon={<DnsIcon fontSize="small" />} 
        />
        <MetricCard 
          title="Alertas Activas" 
          value={alerts.length} 
          unit="Incidencias" 
          percent={alerts.length > 0 ? 100 : 0} 
          color={alerts.length > 0 ? "#ef4444" : "#22c55e"}
          icon={<NotificationsActiveIcon fontSize="small" />} 
        />
      </Box>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por IP o nombre..."
        filters={[
          { label: 'Todas las Criticidades', value: 'all' },
          ...criticalities.map(c => ({
            label: c.nombre_nivel,
            value: c.id_nivel_criticidad
          }))
        ]}
        activeFilter={criticalityFilter}
        onFilterChange={setCriticalityFilter}
        bottomActions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Vista de Lista">
              <IconButton 
                size="small" 
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista de Cuadrícula">
              <IconButton 
                size="small" 
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                <ViewModuleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />

      {filteredServers.length === 0 ? (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron servidores con los criterios de búsqueda.
          </Typography>
          <Button 
            variant="text" 
            onClick={() => { 
              setSearchTerm(''); 
              setCriticalityFilter('all');
            }}
            sx={{ mt: 2, fontWeight: 700 }}
          >
            Limpiar Filtros
          </Button>
        </Box>
      ) : (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: viewMode === 'grid' 
              ? { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } 
              : '1fr', 
            gap: 3 
          }}
        >
          {filteredServers.map((server) => (
            <ServerCard 
              key={server.id_servidor} 
              server={server} 
              healthStatus={healthCache[server.id_servidor]}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}

      <Box sx={{ position: 'fixed', bottom: 32, right: 32, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Tooltip title="Carga Masiva" placement="left">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/bulk-upload')}
            sx={{ 
              borderRadius: '50%', 
              width: 56, 
              height: 56, 
              minWidth: 0,
              boxShadow: 3
            }}
          >
            <CloudUploadIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Agregar Servidor" placement="left">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/add-server')}
            sx={{ 
              borderRadius: '50%', 
              width: 56, 
              height: 56, 
              minWidth: 0,
              boxShadow: 3
            }}
          >
            <AddIcon />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};
