import { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Box, Typography, Button, Stack, CircularProgress, 
  Tooltip, IconButton, Paper, Slide, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import DnsIcon from '@mui/icons-material/Dns';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { MetricCard } from '../components/MetricCard';
import { ServerCard } from '../components/ServerCard';
import { useInfrastructureStore } from '../store/useInfrastructureStore';
import { useMonitoringStore } from '../store/useMonitoringStore';
import { useAuthStore } from '../store/useAuthStore';
import { useConfirmStore } from '../store/useConfirmStore';
import { deleteServer } from '../api/infrastructureService';
import { useNotificationStore } from '../components/GlobalNotification';
import { FilterBar } from '../components/FilterBar';
import { FloatingActionGroup } from '../components/FloatingActionGroup';

export const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { 
    servers, loading, fetchServers, 
    fetchCriticalities, criticalities
  } = useInfrastructureStore();
  const { 
    schedulerStatus, liveMetrics: healthCache, alerts,
    fetchSchedulerStatus, fetchAlertsToday,
    pauseMonitoring, resumeMonitoring, fetchLiveCache 
  } = useMonitoringStore();
  const { user } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const { confirmAction } = useConfirmStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showScheduler, setShowScheduler] = useState(true);
  const [selectionModeActive, setSelectionModeActive] = useState(false);
  const [selectedServerIds, setSelectedServerIds] = useState<number[]>([]);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchServers();
    fetchCriticalities();
    fetchSchedulerStatus();
    fetchLiveCache();
    fetchAlertsToday();
  }, [fetchServers, fetchCriticalities, fetchSchedulerStatus, fetchLiveCache, fetchAlertsToday]);

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
    confirmAction({
      title: '¿Eliminar Servidor?',
      description: `¿Está seguro de que desea eliminar el servidor "${name}"? Esta acción eliminará permanentemente el nodo y todos sus activos asociados (instancias, bases de datos). No se puede deshacer.`,
      confirmLabel: 'Eliminar ahora',
      severity: 'error',
      onConfirm: async () => {
        try {
          await deleteServer(id);
          showNotification('Servidor eliminado correctamente', 'success');
          fetchServers();
        } catch (error: any) {
          console.error('Error deleting server:', error);
          showNotification(error.response?.data?.detail || 'Error al eliminar el servidor', 'error');
        }
      }
    });
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
            elevation={10}
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
              gap: 2.5, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              borderRadius: 4,
              boxShadow: theme.palette.mode === 'dark' ? '0 16px 40px rgba(0, 0, 0, 0.4)' : '0 16px 40px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
              {/* LED Status Indicator */}
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: schedulerStatus.status === 'running' ? '#10b981' : '#f59e0b',
                  boxShadow: schedulerStatus.status === 'running' 
                    ? '0 0 8px #10b981, 0 0 16px #10b981' 
                    : '0 0 8px #f59e0b',
                  animation: schedulerStatus.status === 'running' 
                    ? 'ledPulse 2s infinite ease-in-out' 
                    : 'none',
                  '@keyframes ledPulse': {
                    '0%': { transform: 'scale(0.9)', opacity: 0.6, boxShadow: '0 0 6px #10b981' },
                    '50%': { transform: 'scale(1.2)', opacity: 1, boxShadow: '0 0 14px #10b981, 0 0 28px #10b981' },
                    '100%': { transform: 'scale(0.9)', opacity: 0.6, boxShadow: '0 0 6px #10b981' }
                  }
                }} 
              />
              
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    fontWeight: 900, 
                    lineHeight: 1, 
                    color: 'text.secondary', 
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em'
                  }}
                >
                  MONITOREO ACTIVO
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 800, 
                    color: schedulerStatus.status === 'running' ? '#10b981' : '#f59e0b',
                    fontSize: '0.8rem',
                    mt: 0.5
                  }}
                >
                  {schedulerStatus.status === 'running' ? 'EN EJECUCIÓN' : 'PAUSADO'}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={schedulerStatus.status === 'running' ? <PauseCircleIcon fontSize="small" /> : <PlayCircleIcon fontSize="small" />}
              onClick={handleToggleScheduler}
              sx={{ 
                borderColor: schedulerStatus.status === 'running' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                color: schedulerStatus.status === 'running' ? '#ef4444' : '#10b981',
                borderRadius: 2,
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'none',
                minWidth: 105,
                px: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  borderColor: schedulerStatus.status === 'running' ? '#ef4444' : '#10b981',
                  bgcolor: schedulerStatus.status === 'running' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)'
                }
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
              sx={{ 
                color: 'text.secondary',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                borderRadius: 1.5,
                p: 0.5,
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Slide>
      )}

      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        sx={{ 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 4, 
          gap: 2 
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            Panel Principal
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
          title="Alertas del Día" 
          value={alerts.length} 
          unit="Incidencias" 
          percent={alerts.length > 0 ? 100 : 0} 
          color={alerts.length > 0 ? "#ef4444" : "#22c55e"}
          icon={<NotificationsActiveIcon fontSize="small" />} 
          onClick={() => navigate('/monitoreo/alertas')}
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
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {isAdmin && (
              <Button
                size="small"
                variant={selectionModeActive ? "contained" : "outlined"}
                color={selectionModeActive ? "warning" : "inherit"}
                onClick={() => {
                  setSelectionModeActive(!selectionModeActive);
                  setSelectedServerIds([]);
                }}
                sx={{ mr: 1, fontWeight: 700, textTransform: 'none', px: 2, borderRadius: 2 }}
              >
                {selectionModeActive ? 'Cancelar Selección' : 'Eliminar en Bloque'}
              </Button>
            )}
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
              selectionModeActive={selectionModeActive}
              selected={selectedServerIds.includes(server.id_servidor)}
              onToggleSelect={(id) => {
                setSelectedServerIds(prev => 
                  prev.includes(id) 
                    ? prev.filter(x => x !== id) 
                    : [...prev, id]
                );
              }}
            />
          ))}
        </Box>
      )}

      <FloatingActionGroup 
        items={[
          {
            label: "Carga Masiva",
            icon: <CloudUploadIcon />,
            color: "secondary",
            onClick: () => navigate('/bulk-upload')
          },
          {
            label: "Agregar Servidor",
            icon: <AddIcon />,
            color: "primary",
            onClick: () => navigate('/add-server')
          }
        ]}
      />

      {/* Floating Action Bar for Bulk Deletion */}
      <Slide in={selectionModeActive} direction="up" mountOnEnter unmountOnExit>
        <Paper
          elevation={10}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 'calc(50% + var(--sidebar-width, 70px) / 2)',
            transform: 'translateX(-50%)',
            zIndex: 1250,
            width: 'calc(100% - var(--sidebar-width, 70px) - 32px)',
            maxWidth: 680,
            p: 2,
            borderRadius: 4,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            boxShadow: theme.palette.mode === 'dark' ? '0 20px 45px rgba(0,0,0,0.5)' : '0 20px 45px rgba(0,0,0,0.1)',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Modo de Eliminación Masiva
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {selectedServerIds.length === 0 
                ? 'Seleccione uno o más servidores de la cuadrícula' 
                : `${selectedServerIds.length} ${selectedServerIds.length === 1 ? 'servidor seleccionado' : 'servidores seleccionados'}`
              }
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button
              size="small"
              variant="text"
              onClick={() => {
                const allFilteredIds = filteredServers.map(s => s.id_servidor);
                const isAllSelected = allFilteredIds.every(id => selectedServerIds.includes(id));
                if (isAllSelected) {
                  setSelectedServerIds([]);
                } else {
                  setSelectedServerIds(allFilteredIds);
                }
              }}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {filteredServers.map(s => s.id_servidor).every(id => selectedServerIds.includes(id)) 
                ? 'Deseleccionar Todos' 
                : 'Seleccionar Todos'
              }
            </Button>
            
            <Button
              size="small"
              variant="contained"
              color="error"
              disabled={selectedServerIds.length === 0}
              onClick={() => {
                confirmAction({
                  title: '¿Eliminar Servidores en Bloque?',
                  description: `Está a punto de eliminar permanentemente ${selectedServerIds.length} servidores y todos sus activos vinculados (instancias, DBMS, credenciales, particiones, etc.). Esta acción NO se puede deshacer.`,
                  confirmLabel: 'Sí, eliminar lote',
                  severity: 'error',
                  onConfirm: async () => {
                    try {
                      await Promise.all(selectedServerIds.map(id => deleteServer(id)));
                      showNotification(`${selectedServerIds.length} servidores eliminados con éxito`, 'success');
                      setSelectedServerIds([]);
                      setSelectionModeActive(false);
                      fetchServers();
                    } catch (error: any) {
                      console.error('Error during bulk deletion:', error);
                      showNotification('Ocurrió un error al eliminar algunos servidores', 'error');
                      fetchServers();
                    }
                  }
                });
              }}
              sx={{ 
                fontWeight: 700, 
                textTransform: 'none', 
                borderRadius: 2,
                px: 3,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' }
              }}
            >
              Eliminar Lote
            </Button>

            <IconButton 
              size="small" 
              onClick={() => {
                setSelectionModeActive(false);
                setSelectedServerIds([]);
              }}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>
      </Slide>
    </Box>
  );
};
