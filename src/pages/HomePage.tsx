import { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Box, Typography, Button, Stack, Paper, CircularProgress, 
  TextField, InputAdornment, Chip, Divider, IconButton, Tooltip,
  Alert, AlertTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import TerminalIcon from '@mui/icons-material/Terminal';
import DnsIcon from '@mui/icons-material/Dns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import { MetricCard } from '../components/MetricCard';
import { ServerCard } from '../components/ServerCard';
import { useInfrastructureStore } from '../store/useInfrastructureStore';
import { useMonitoringStore } from '../store/useMonitoringStore';
import { useAuthStore } from '../store/useAuthStore';
import { deleteServer, pingServer } from '../api/infrastructureService';
import { useNotificationStore } from '../components/GlobalNotification';

export const HomePage = () => {
  const navigate = useNavigate();
  const { servers, criticalities, loading, fetchServers, fetchCriticalities } = useInfrastructureStore();
  const { 
    schedulerStatus, liveMetrics: healthCache,
    fetchSchedulerStatus,
    pauseMonitoring, resumeMonitoring, fetchLiveCache 
  } = useMonitoringStore();
  const { user } = useAuthStore();
  const { showNotification } = useNotificationStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'critical'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pinging, setPinging] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // console.log('[HomePage] Initializing dashboard data...');
    fetchServers();
    fetchCriticalities();
    fetchSchedulerStatus();
    fetchLiveCache();
  }, [fetchServers, fetchCriticalities, fetchSchedulerStatus, fetchLiveCache]);

  // Polling para métricas en vivo (Live Cache)
  useEffect(() => {
    // console.log(`[HomePage] Polling setup: ${servers.length} servers, Scheduler: ${schedulerStatus?.status}`);
    
    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(() => {
        if (servers.length > 0 && schedulerStatus?.status === 'running') {
          // console.log('[HomePage] Polling cycle: fetching live cache...');
          fetchLiveCache();
        } else {
          // console.log('[HomePage] Polling cycle skipped:', { servers: servers.length, status: schedulerStatus?.status });
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

  const handlePing = async () => {
    if (!searchTerm) {
      showNotification('Ingrese una IP o Host para realizar el ping', 'warning');
      return;
    }

    setPinging(true);
    try {
      const isReachable = await pingServer(searchTerm);
      if (isReachable) {
        showNotification(`El servidor ${searchTerm} respondió correctamente (UP)`, 'success');
      } else {
        showNotification(`El servidor ${searchTerm} no responde o es inalcanzable (DOWN)`, 'error');
      }
    } catch (error: any) {
      showNotification('Error al realizar el ping. Verifique el formato de la IP/Host.', 'error');
    } finally {
      setPinging(false);
    }
  };

  const isAdmin = user?.id_rol === 1;

  // Calculamos el resumen global desde healthCache, filtrando por los servidores actualmente cargados
  const stats = useMemo(() => {
    let sanos = 0;
    let criticos = 0;
    let desactualizados = 0;

    servers.forEach(server => {
      const health = healthCache[server.id_servidor];
      if (!health) return;
      
      if (health.status === 'healthy') sanos++;
      else if (health.status === 'critical') criticos++;
      else if (health.status === 'stale') desactualizados++;
    });

    return { sanos, criticos, desactualizados };
  }, [servers, healthCache]);

  const filteredServers = useMemo(() => {
    return servers.filter(server => {
      const matchesSearch = 
        server.nombre_servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.direccion_ip.includes(searchTerm);
      
      const health = healthCache[server.id_servidor];
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'online' && health?.status === 'healthy') ||
        (statusFilter === 'critical' && health?.status === 'critical');

      return matchesSearch && matchesStatus;
    });
  }, [servers, searchTerm, statusFilter, healthCache]);

  if (loading && servers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO Y SCHEDULER CONTROL --- */}
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

        {isAdmin && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 1.5, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              bgcolor: schedulerStatus?.status === 'running' ? 'success.lighter' : 'warning.lighter',
              border: '1px solid',
              borderColor: schedulerStatus?.status === 'running' ? 'success.light' : 'warning.light',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {schedulerStatus?.status === 'running' ? (
                <MonitorHeartIcon color="success" sx={{ animation: 'pulse 2s infinite' }} />
              ) : (
                <PauseCircleIcon color="warning" />
              )}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: schedulerStatus?.status === 'running' ? 'success.dark' : 'warning.dark' }}>
                MONITOREO: {schedulerStatus?.status.toUpperCase() || '...'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={schedulerStatus?.status === 'running' ? <PauseCircleIcon /> : <PlayCircleIcon />}
              onClick={handleToggleScheduler}
              sx={{ 
                bgcolor: schedulerStatus?.status === 'running' ? 'success.dark' : 'warning.dark',
                color: 'white',
                '&:hover': { bgcolor: schedulerStatus?.status === 'running' ? 'success.main' : 'warning.main' }
              }}
            >
              {schedulerStatus?.status === 'running' ? 'Pausar' : 'Reanudar'}
            </Button>
          </Paper>
        )}
      </Stack>

      {/* --- 2. KPI CARDS --- */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
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
          title="Sanos" 
          value={stats.sanos} 
          unit="UP" 
          percent={servers.length > 0 ? (stats.sanos / servers.length) * 100 : 0} 
          color="#22c55e"
          icon={<CheckCircleIcon fontSize="small" />} 
        />
        <MetricCard 
          title="Críticos" 
          value={stats.criticos} 
          unit="ERR" 
          percent={servers.length > 0 ? (stats.criticos / servers.length) * 100 : 0} 
          color="#ef4444"
          icon={<ReportProblemIcon fontSize="small" />} 
        />
        <MetricCard 
          title="Desactualizados" 
          value={stats.desactualizados} 
          unit="STALE" 
          percent={servers.length > 0 ? (stats.desactualizados / servers.length) * 100 : 0} 
          color="#f59e0b"
          icon={<SignalCellularAltIcon fontSize="small" />} 
        />
      </Box>

      {/* --- 3. BARRA DE BUSQUEDA Y FILTROS --- */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 4, 
          border: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: 'center'
        }}
      >
        <TextField
          placeholder="Buscar por IP o nombre..."
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { md: 400 } }}
        />

        <Stack direction="row" spacing={1} sx={{ flexGrow: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <Chip 
            label="Todos" 
            variant={statusFilter === 'all' ? 'filled' : 'outlined'} 
            onClick={() => setStatusFilter('all')}
            sx={{ fontWeight: 700 }}
          />
          <Chip 
            label="Sanos" 
            color="success"
            variant={statusFilter === 'online' ? 'filled' : 'outlined'} 
            onClick={() => setStatusFilter('online')}
            sx={{ fontWeight: 700 }}
          />
          <Chip 
            label="Críticos" 
            color="error"
            variant={statusFilter === 'critical' ? 'filled' : 'outlined'} 
            onClick={() => setStatusFilter('critical')}
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        <Stack direction="row" spacing={1}>
          <Tooltip title="Vista de Lista">
            <IconButton 
              size="small" 
              color={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Vista de Cuadrícula">
            <IconButton 
              size="small" 
              color={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
            >
              <ViewModuleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Realizar Ping">
            <Box component="span">
              <Button
                variant="outlined"
                size="small"
                startIcon={pinging ? <CircularProgress size={16} /> : <TerminalIcon />}
                onClick={handlePing}
                disabled={pinging || !searchTerm}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Ping
              </Button>
            </Box>
          </Tooltip>
        </Stack>
      </Paper>

      {/* --- 4. LISTADO DE SERVIDORES --- */}
      {filteredServers.length === 0 ? (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron servidores con los criterios de búsqueda.
          </Typography>
          <Button 
            variant="text" 
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
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

      {/* --- 5. ACCIONES FLOTANTES (Opcional) --- */}
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
