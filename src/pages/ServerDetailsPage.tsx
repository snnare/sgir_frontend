import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Stack, Paper, CircularProgress, 
  Button, Grid, Chip, Table, TableBody, 
  TableCell, TableHead, TableRow, LinearProgress, Divider, Tooltip, IconButton,
  TableContainer, Skeleton
} from '@mui/material';
import { useAlertStore } from '../store/useAlertStore';
import EditIcon from '@mui/icons-material/Edit';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BugReportIcon from '@mui/icons-material/BugReport';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyIcon from '@mui/icons-material/Key';

import { 
  getServerById, 
  getPartitionsByServer, 
  getInstancesByServer,
  getCredentialsByServer
} from '../api/infrastructureService';
import { 
  getHealthStatus, 
  getAlertsByServer 
} from '../api/monitoringService';
import { 
  type Server, type PartitionResponse, type Instance, 
  type Alert as SystemAlert, type HealthStatus, type ParsedDBLiveMetrics,
  type CredentialEnriched
} from '../api/types';
import { useInfrastructureStore } from '../store/useInfrastructureStore';
import { useMonitoringStore } from '../store/useMonitoringStore';
import { useNotificationStore } from '../components/GlobalNotification';
import { BackButton } from '../components/BackButton';
import { useShallow } from 'zustand/react/shallow';

export const ServerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const { showAlert } = useAlertStore();
  
  // Stores globales con selectors y useShallow
  const { 
    criticalities, 
    statuses, 
    dbmsList, 
    fetchCriticalities, 
    fetchStatuses, 
    fetchDbmsList 
  } = useInfrastructureStore(
    useShallow((state) => ({
      criticalities: state.criticalities,
      statuses: state.statuses,
      dbmsList: state.dbmsList,
      fetchCriticalities: state.fetchCriticalities,
      fetchStatuses: state.fetchStatuses,
      fetchDbmsList: state.fetchDbmsList
    }))
  );

  const { 
    dbLiveMetricsUnified, 
    fetchDBLiveMetricsUnified 
  } = useMonitoringStore(
    useShallow((state) => ({
      dbLiveMetricsUnified: state.dbLiveMetricsUnified,
      fetchDBLiveMetricsUnified: state.fetchDBLiveMetricsUnified
    }))
  );

  // Estados locales reales
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [server, setServer] = useState<Server | null>(null);
  const [partitions, setPartitions] = useState<PartitionResponse[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [credentials, setCredentials] = useState<CredentialEnriched[]>([]);

  // Historiales para las sparklines en vivo
  const [cpuHistory, setCpuHistory] = useState<number[]>([15, 22, 28, 35, 42, 38, 45, 48, 41, 45]);
  const [ramHistory, setRamHistory] = useState<number[]>([65, 66, 68, 70, 70, 71, 72, 72, 73, 72]);

  // Auxiliar para parsear la métrica en vivo del host
  const getParsedMetrics = useCallback((healthStatus: HealthStatus | null) => {
    let parsed = {
      cpu: 0,
      ram: 0,
      disks: {} as Record<string, number>,
      uptime: 0,
      timestamp: 0
    };

    if (healthStatus?.live_metrics) {
      const lm = healthStatus.live_metrics as any;
      if (typeof lm === 'string') {
        const parts = (lm as string).split('|');
        if (parts.length >= 5) {
          const [cpu, ram, disksRaw, uptime, timestamp] = parts;
          const disks: Record<string, number> = {};
          if (disksRaw) {
            disksRaw.split(',').forEach((d: string) => {
              const [mount, usage] = d.split(':');
              if (mount && usage) disks[mount] = parseFloat(usage);
            });
          }
          parsed = {
            cpu: parseFloat(cpu) || 0,
            ram: parseFloat(ram) || 0,
            disks,
            uptime: parseFloat(uptime) || 0,
            timestamp: parseInt(timestamp) || 0
          };
        }
      } else if (typeof lm === 'object') {
        const obj = lm as any;
        parsed = {
          cpu: obj.cpu_usage ?? obj.cpu ?? 0,
          ram: obj.ram_usage ?? obj.ram ?? 0,
          disks: obj.disks ?? { '/': obj.disk_usage ?? 0 },
          uptime: parseFloat(obj.uptime) || 0,
          timestamp: obj.timestamp || 0
        };
      }
    }
    return parsed;
  }, []);

  // Función unificada para cargar toda la información en tiempo real
  const loadServerData = useCallback(async (isRefresh = false) => {
    if (!id) return;
    const sId = Number(id);

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Cargar catálogos estáticos globales (solo si no están en memoria)
      const catalogPromises = [];
      if (criticalities.length === 0) catalogPromises.push(fetchCriticalities());
      if (statuses.length === 0) catalogPromises.push(fetchStatuses());
      if (dbmsList.length === 0) catalogPromises.push(fetchDbmsList());
      
      const dbLiveMetricsInStore = useMonitoringStore.getState().dbLiveMetricsUnified;
      if (Object.keys(dbLiveMetricsInStore).length === 0) catalogPromises.push(fetchDBLiveMetricsUnified());

      if (catalogPromises.length > 0) {
        await Promise.all(catalogPromises);
      }

      // 2. Intentar recuperar datos ya presentes en los stores globales (flujo directo de HomePage)
      const serversInStore = useInfrastructureStore.getState().servers;
      const cachedServer = serversInStore.find(s => s.id_servidor === sId);

      const liveMetricsInStore = useMonitoringStore.getState().liveMetrics;
      const cachedHealth = liveMetricsInStore[sId];

      // 3. Crear promesas únicamente para lo que no esté en caché o si es refresco explícito

      // Servidor y sus metadatos
      let serverPromise: Promise<Server | null> = Promise.resolve(cachedServer || null);
      if (!cachedServer || isRefresh) {
        serverPromise = getServerById(sId).catch(err => {
          console.error('[ServerDetails] Error fetching server:', err);
          return null;
        });
      }

      // Salud del Host
      let healthPromise: Promise<HealthStatus | null> = Promise.resolve(cachedHealth || null);
      if (!cachedHealth || isRefresh) {
        healthPromise = getHealthStatus(sId).catch(err => {
          console.warn('[ServerDetails] No se pudieron obtener métricas en vivo:', err);
          return null;
        });
      }

      // Particiones (Siempre se consulta por su naturaleza dinámica)
      const partitionsPromise = getPartitionsByServer(sId).catch(err => {
        console.warn('[ServerDetails] No se pudieron obtener particiones:', err);
        return [] as PartitionResponse[];
      });

      // Bitácora de incidencias (Siempre se consulta)
      const alertsPromise = getAlertsByServer(sId).catch(err => {
        console.warn('[ServerDetails] No se pudieron obtener alertas:', err);
        return [] as SystemAlert[];
      });

      // Credenciales registradas
      const credentialsPromise = getCredentialsByServer(sId).catch(err => {
        console.warn('[ServerDetails] No se pudieron obtener credenciales:', err);
        return [] as CredentialEnriched[];
      });

      // 4. Ejecutar todas las llamadas de datos requeridas en paralelo
      const [serverData, healthData, partitionsData, alertsData, credentialsData] = await Promise.all([
        serverPromise,
        healthPromise,
        partitionsPromise,
        alertsPromise,
        credentialsPromise
      ]);

      // 5. Asignar los estados locales o globales
      if (serverData) {
        setServer(serverData);
      } else {
        // Error de diagnóstico crítico: No pudimos resolver la información del servidor
        const errorMsg = 'Error crítico: No se pudieron obtener los datos generales del servidor.';
        showNotification(errorMsg, 'error');
        showAlert({
          title: 'Error de Diagnóstico',
          description: 'No se pudieron recuperar los detalles técnicos del servidor. Por favor, intente de nuevo o contacte a soporte.',
          severity: 'error'
        });
        navigate('/');
        return;
      }

      setPartitions(partitionsData);
      setHealth(healthData);
      setAlerts(alertsData);
      setCredentials(credentialsData);

      // Si obtuvimos métricas en vivo reales, las guardamos en el store local para actualizar el caché
      if (healthData) {
        useMonitoringStore.setState((state) => ({
          liveMetrics: {
            ...state.liveMetrics,
            [sId]: healthData
          }
        }));

        const parsed = getParsedMetrics(healthData);
        setCpuHistory(prev => [...prev.slice(1), parsed.cpu]);
        setRamHistory(prev => [...prev.slice(1), parsed.ram]);
      }

      // Si obtuvimos instancias del servidor, las asignamos (getServerById retorna instancias embebidas en el Server Schema)
      if (serverData.instancias) {
        setInstances(serverData.instancias);
      } else {
        // Fallback: Consultar instancias por si el esquema base del listado no las trae embebidas
        const instancesData = await getInstancesByServer(sId).catch(() => [] as Instance[]);
        setInstances(instancesData);
      }

      if (isRefresh) {
        showNotification('Métricas actualizadas en tiempo real', 'success');
      }
    } catch (err: any) {
      console.error('[ServerDetails] Error loading data:', err);
      showNotification('Error al consultar información técnica del servidor', 'error');
      showAlert({
        title: 'Error de Inicialización',
        description: 'Falló la inicialización paralela de observabilidad en el servidor.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, fetchCriticalities, fetchStatuses, fetchDBLiveMetricsUnified, dbmsList.length, fetchDbmsList, getParsedMetrics, showNotification, criticalities.length, statuses.length, navigate, showAlert]);

  useEffect(() => {
    loadServerData();
  }, [loadServerData]);

  if (loading) {
    return (
      <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
        {/* Skeleton Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ width: '60%' }}>
            <Skeleton width={120} height={24} sx={{ mb: 1 }} />
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Skeleton width={250} height={48} />
              <Skeleton width={120} height={32} />
            </Stack>
            <Skeleton width="100%" height={20} sx={{ mt: 1 }} />
          </Box>
          <Skeleton width={100} height={40} variant="rounded" />
        </Box>

        {/* Skeleton Metadata Box */}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 4 }}>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Skeleton width={150} height={24} />
            <Skeleton width={150} height={24} />
            <Skeleton width={150} height={24} />
          </Stack>
        </Paper>

        {/* Skeleton Main Grid */}
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: 280 }}>
              <Skeleton width="50%" height={28} sx={{ mb: 2 }} />
              <Skeleton width="100%" height={40} sx={{ mb: 1 }} />
              <Skeleton width="100%" height={40} sx={{ mb: 1 }} />
              <Skeleton width="100%" height={40} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: 280 }}>
              <Skeleton width="30%" height={28} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={160} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!server) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Servidor no encontrado</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }} variant="contained">
          Volver al Panel de Control
        </Button>
      </Box>
    );
  }

  // Parsear métricas en tiempo real actuales
  const metrics = getParsedMetrics(health);

  // Mapear IDs de catálogos
  const getCriticalityName = (id: number) => {
    const crit = criticalities.find(c => c.id_nivel_criticidad === id);
    return crit ? crit.nombre_nivel : 'Desconocida';
  };

  const getStatusName = (id: number) => {
    const statusObj = statuses.find(s => s.id_estado === id);
    return statusObj ? statusObj.nombre_estado : 'Desconocido';
  };

  const getDbmsName = (id_dbms: number) => {
    const dbms = dbmsList.find(d => d.id_dbms === id_dbms);
    return dbms ? dbms.nombre_dbms : 'RDBMS';
  };

  const getEngineDetails = (engineName: string, metricsData?: any) => {
    const nameLower = engineName.toLowerCase();
    let labelShort = 'MET';
    let labelFull = 'Métrica del Motor';
    let value = 0;

    if (nameLower.includes('mysql')) {
      labelShort = 'HIT';
      labelFull = 'InnoDB Cache Buffer Pool Hit Ratio (Eficiencia)';
      value = metricsData?.hit_ratio ?? 0;
    } else if (nameLower.includes('oracle')) {
      labelShort = 'TBS';
      labelFull = 'Uso Consolidado de Tablespaces';
      value = metricsData?.hit_ratio ?? 0;
    } else if (nameLower.includes('mongo')) {
      labelShort = 'OPL';
      labelFull = 'Eficiencia de Operaciones Oplog';
      value = metricsData?.hit_ratio ?? 0;
    }

    return { labelShort, labelFull, value };
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* HEADER PRINCIPAL */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <BackButton to="/" label="Volver a Servidores" />
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.05em', fontFamily: 'Outfit, sans-serif' }}>
              {server.nombre_servidor}
            </Typography>
            <Chip 
              label={server.direccion_ip} 
              sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.9rem', bgcolor: 'action.hover' }} 
            />
            <Tooltip title="Actualizar Métricas">
              <IconButton onClick={() => loadServerData(true)} disabled={refreshing} size="small" sx={{ bgcolor: 'action.hover' }}>
                {refreshing ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>
          {server.descripcion && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
              {server.descripcion}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={() => navigate(`/server/edit/${server.id_servidor}`)}
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            Editar
          </Button>
        </Stack>
      </Box>

      {/* METADATOS / CHIPS DE ESTADO */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 4, bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>Criticidad:</Typography>
            <Chip 
              label={getCriticalityName(server.id_nivel_criticidad)}
              size="small"
              sx={{ 
                fontWeight: 800, 
                bgcolor: server.id_nivel_criticidad === 1 ? 'error.lighter' : server.id_nivel_criticidad === 2 ? 'warning.lighter' : 'success.lighter',
                color: server.id_nivel_criticidad === 1 ? 'error.dark' : server.id_nivel_criticidad === 2 ? 'warning.dark' : 'success.dark',
                border: '1px solid',
                borderColor: 'currentColor'
              }}
            />
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>Estado:</Typography>
            <Chip 
              label={getStatusName(server.id_estado_servidor)} 
              color={server.id_estado_servidor === 1 ? 'success' : 'default'} 
              size="small" 
              sx={{ fontWeight: 800 }} 
            />
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>Tipo de Servidor:</Typography>
            <Chip 
              label={server.es_legacy ? 'Legacy' : 'Estándar'} 
              variant="outlined" 
              color={server.es_legacy ? 'warning' : 'primary'} 
              size="small" 
              sx={{ fontWeight: 800 }} 
            />
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary' }}>Uptime:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {metrics.uptime > 0 ? `${metrics.uptime.toFixed(1)} días` : 'No disponible'}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* MÉTRICAS DE HARDWARE EN TIEMPO REAL */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon color="primary" /> Uso de CPU
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                {server.monitoreo_host ? `${Math.round(metrics.cpu)}%` : 'OFF'}
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={server.monitoreo_host ? metrics.cpu : 0} 
              color={metrics.cpu > 85 ? 'error' : metrics.cpu > 70 ? 'warning' : 'primary'}
              sx={{ height: 8, borderRadius: 1, mb: 3 }}
            />
            {/* Sparkline de CPU */}
            <Box sx={{ height: 50, mt: 2, display: 'flex', alignItems: 'flex-end', opacity: server.monitoreo_host ? 1 : 0.2 }}>
              <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d={`M 0 ${30 - cpuHistory[0] * 0.3} ` + cpuHistory.map((val, idx) => `L ${(idx / (cpuHistory.length - 1)) * 100} ${30 - val * 0.3}`).join(' ')}
                  fill="none"
                  stroke="#1976d2"
                  strokeWidth="2"
                />
              </svg>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <MemoryIcon color="primary" /> Memoria RAM
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                {server.monitoreo_host ? `${Math.round(metrics.ram)}%` : 'OFF'}
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={server.monitoreo_host ? metrics.ram : 0} 
              color={metrics.ram > 85 ? 'error' : metrics.ram > 70 ? 'warning' : 'primary'}
              sx={{ height: 8, borderRadius: 1, mb: 3 }}
            />
            {/* Sparkline de RAM */}
            <Box sx={{ height: 50, mt: 2, display: 'flex', alignItems: 'flex-end', opacity: server.monitoreo_host ? 1 : 0.2 }}>
              <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d={`M 0 ${30 - ramHistory[0] * 0.3} ` + ramHistory.map((val, idx) => `L ${(idx / (ramHistory.length - 1)) * 100} ${30 - val * 0.3}`).join(' ')}
                  fill="none"
                  stroke="#9c27b0"
                  strokeWidth="2"
                />
              </svg>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon color="primary" /> {"Disco Raíz (/)"}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                {server.monitoreo_host ? `${Math.round(metrics.disks['/'] || Object.values(metrics.disks)[0] || 0)}%` : 'OFF'}
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={server.monitoreo_host ? (metrics.disks['/'] || Object.values(metrics.disks)[0] || 0) : 0} 
              color={(metrics.disks['/'] || Object.values(metrics.disks)[0] || 0) > 85 ? 'error' : 'primary'}
              sx={{ height: 8, borderRadius: 1, mb: 3 }}
            />
            <Stack direction="row" sx={{ justifyContent: 'space-between', color: 'text.secondary' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Estado: {server.monitoreo_host ? 'Activo' : 'Monitoreo Desactivado'}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{"Punto: /"}</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* PARTE DE LA IZQUIERDA: PARTICIONES Y LUEGO INSTANCIAS DBMS */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* DESGLOSE COMPLETO DE DISCOS/PARTICIONES MONITOREADAS */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <StorageIcon color="primary" /> Particiones Físicas Monitoreadas
            </Typography>

            {partitions.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
                  {"No se han registrado particiones adicionales para monitoreo en este host. Solo se monitorea la partición raíz (/)."}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Punto de Montaje</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Etiqueta</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Uso en Vivo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Partición Raíz por Defecto */}
                    <TableRow hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{"/"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Raíz del Sistema</Typography>
                      </TableCell>
                      <TableCell sx={{ width: '40%' }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Box sx={{ flexGrow: 1, height: 6, bgcolor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ width: `${metrics.disks['/'] || 0}%`, height: '100%', bgcolor: (metrics.disks['/'] || 0) > 85 ? 'error.main' : 'primary.main' }} />
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                            {Math.round(metrics.disks['/'] || Object.values(metrics.disks)[0] || 0)}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {/* Particiones de Base de Datos */}
                    {partitions.map((part) => {
                      const diskUsage = metrics.disks[part.path] ?? 0;
                      const isCritical = diskUsage > 85;

                      return (
                        <TableRow key={part.id_particion} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{part.path}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{part.etiqueta}</Typography>
                          </TableCell>
                          <TableCell sx={{ width: '40%' }}>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                              <Box sx={{ flexGrow: 1, height: 6, bgcolor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                                <Box sx={{ width: `${diskUsage}%`, height: '100%', bgcolor: isCritical ? 'error.main' : 'primary.main' }} />
                              </Box>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: isCritical ? 'error.main' : 'text.primary', fontFamily: 'monospace' }}>
                                {diskUsage > 0 ? `${Math.round(diskUsage)}%` : 'OFF/Cero'}
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* INSTANCIAS DE BASE DE DATOS REALES */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <StorageRoundedIcon color="primary" /> Instancias de Bases de Datos DBMS
            </Typography>

            {!server.monitoreo_db ? (
              <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
                  Monitoreo de bases de datos desactivado para este servidor.
                </Typography>
              </Box>
            ) : instances.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                <WarningAmberIcon sx={{ color: 'warning.main', mb: 1 }} />
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
                  No se han registrado instancias de bases de datos para este servidor en la CMDB.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {instances.map((instance) => {
                  const instanceMetrics = dbLiveMetricsUnified[instance.id_instancia] as ParsedDBLiveMetrics | undefined;
                  const dbmsName = getDbmsName(instance.id_dbms);
                  const isOnline = instanceMetrics?.status === 'online';
                  const details = getEngineDetails(dbmsName, instanceMetrics);
                  const instStatusColor = isOnline ? '#22c55e' : (instanceMetrics?.status === 'offline' ? '#ef4444' : '#64748b');

                  // Formatear uptime del DBMS si existe
                  let dbUptimeStr = 'No disponible';
                  if (isOnline && instanceMetrics?.uptime) {
                    const upt = instanceMetrics.uptime;
                    const d = Math.floor(upt / (24 * 3600));
                    const h = Math.floor((upt % (24 * 3600)) / 3600);
                    const m = Math.floor((upt % 3600) / 60);
                    dbUptimeStr = d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`;
                  }

                  return (
                    <Grid size={{ xs: 12 }} key={instance.id_instancia}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          borderRadius: 3,
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                            borderColor: 'primary.light'
                          }
                        }}
                      >
                        {/* Cabecera de la Instancia */}
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: instStatusColor,
                                boxShadow: isOnline ? `0 0 8px ${instStatusColor}80` : 'none',
                                animation: isOnline ? 'ledPulse 2s infinite ease-in-out' : 'none',
                                flexShrink: 0
                              }} 
                            />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                                {instance.nombre_instancia}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Motor: {dbmsName} | Puerto: {instance.puerto} {instance.parametros_conexion ? `| Params: ${JSON.stringify(instance.parametros_conexion)}` : ''}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Chip 
                              label={instanceMetrics?.status ? instanceMetrics.status.toUpperCase() : 'UNKNOWN'} 
                              size="small" 
                              color={isOnline ? 'success' : (instanceMetrics?.status === 'offline' ? 'error' : 'default')} 
                              sx={{ fontWeight: 800, fontSize: '0.65rem' }} 
                            />
                            {isOnline && (
                              <Chip 
                                icon={<AccessTimeIcon sx={{ fontSize: '12px !important' }} />}
                                label={`Uptime: ${dbUptimeStr}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.65rem' }} 
                              />
                            )}
                          </Stack>
                        </Stack>

                        {/* Panel de Telemetría Completa */}
                        {isOnline && instanceMetrics ? (
                          <Grid container spacing={2}>
                            {/* Bloque 1: Conexiones (CON) */}
                            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', height: '100%' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                  Capacidad & Conexiones
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: 'monospace' }}>
                                  {instanceMetrics.threads_connected} <Typography component="span" variant="caption" color="text.secondary">{"/ "}{instanceMetrics.max_connections} hilos</Typography>
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={instanceMetrics.conn_usage_pct} 
                                  color={instanceMetrics.conn_usage_pct > 80 ? 'error' : 'primary'}
                                  sx={{ height: 6, borderRadius: 1, mb: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  Uso de conexiones: {instanceMetrics.conn_usage_pct.toFixed(1)}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                                  Hilos activos corriendo: {instanceMetrics.threads_running}
                                </Typography>
                              </Paper>
                            </Grid>

                            {/* Bloque 2: Consultas & Tráfico (QPS) */}
                            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', height: '100%' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                  Rendimiento de Queries
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: 'monospace' }}>
                                  {instanceMetrics.queries_per_second.toFixed(1)} <Typography component="span" variant="caption" color="text.secondary">QPS</Typography>
                                </Typography>
                                <Divider sx={{ my: 1, borderStyle: 'dotted' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                                  Total consultas: {instanceMetrics.questions.toLocaleString()}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block', 
                                    mt: 0.5, 
                                    fontWeight: 800,
                                    color: instanceMetrics.slow_queries > 0 ? 'warning.main' : 'text.secondary' 
                                  }}
                                >
                                  Consultas lentas: {instanceMetrics.slow_queries} (Slow Queries)
                                </Typography>
                              </Paper>
                            </Grid>

                            {/* Bloque 3: Salud de Eficiencia & Cache (HIT) */}
                            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', height: '100%' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                  {details.labelFull}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: 'monospace' }}>
                                  {Math.round(details.value)}% <Typography component="span" variant="caption" color="text.secondary">{details.labelShort}</Typography>
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={details.value} 
                                  color={details.value > 90 ? 'success' : details.value > 75 ? 'primary' : 'warning'}
                                  sx={{ height: 6, borderRadius: 1, mb: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  Hit Ratio de lectura óptimo.
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                                  Páginas sucias en buffer: {instanceMetrics.innodb_buffer_pool_pages_dirty}
                                </Typography>
                              </Paper>
                            </Grid>

                            {/* Bloque 4: Bloqueos e Inodos (LOCKS) */}
                            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', height: '100%' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                  Locks & Esperas (Bloqueos)
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: 'monospace', color: instanceMetrics.table_locks_waited > 0 || instanceMetrics.innodb_row_lock_waits > 0 ? 'warning.main' : 'text.primary' }}>
                                  {instanceMetrics.table_locks_waited} <Typography component="span" variant="caption" color="text.secondary">locks de tabla</Typography>
                                </Typography>
                                <Divider sx={{ my: 1, borderStyle: 'dotted' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                                  Row lock waits: {instanceMetrics.innodb_row_lock_waits} esperas
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                                  Tiempo prom. espera lock: {instanceMetrics.innodb_row_lock_time_avg} ms
                                </Typography>
                              </Paper>
                            </Grid>
                          </Grid>
                        ) : (
                          <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
                              La instancia se reporta desconectada u offline. Verifique la salud del motor DBMS.
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* PARTE DE LA DERECHA: CREDENCIALES Y ALERTAS */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* LLAVERO DE CREDENCIALES COMPACTO */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: 'Outfit, sans-serif' }}>
                <KeyIcon color="primary" /> Credenciales Registradas
              </Typography>

              {credentials.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>
                    No hay credenciales registradas.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {credentials.map((cred) => (
                    <Paper 
                      variant="outlined" 
                      key={cred.id_credencial}
                      onClick={() => navigate(`/credenciales/editar/${cred.id_credencial}`)}
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2.5, 
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'action.selected',
                          borderColor: 'primary.light',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <KeyIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                            {cred.usuario}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Tipo: {cred.tipo.nombre_tipo}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip 
                        label={cred.estado.nombre_estado.toUpperCase()} 
                        size="small" 
                        color={cred.estado.id_estado === 1 ? 'success' : 'default'} 
                        sx={{ fontWeight: 900, fontSize: '0.55rem', height: 18 }} 
                      />
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* ALERTAS */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: 'Outfit, sans-serif' }}>
                <BugReportIcon color="primary" /> Alertas del Servidor (Últimas 24h)
              </Typography>

              {alerts.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>
                    No se han registrado incidencias de severidad en las últimas 24 horas.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {alerts.map((alert) => (
                    <Paper 
                      variant="outlined" 
                      key={alert.id_alerta}
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        borderLeft: '4px solid', 
                        borderLeftColor: alert.id_nivel_alerta === 1 ? 'error.main' : 'warning.main',
                        bgcolor: 'action.hover'
                      }}
                    >
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={alert.id_nivel_alerta === 1 ? 'CRÍTICO' : 'ADVERTENCIA'} 
                          size="small" 
                          color={alert.id_nivel_alerta === 1 ? 'error' : 'warning'} 
                          sx={{ fontWeight: 900, height: 18, fontSize: '0.55rem' }} 
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {alert.fecha_alerta ? new Date(alert.fecha_alerta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.4 }}>
                        {alert.descripcion}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
