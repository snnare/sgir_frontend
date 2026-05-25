import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Divider, IconButton, Checkbox, Tooltip, CircularProgress } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { CompactMetric } from './CompactMetric';
import { type Server, type HealthStatus, type Instance } from '../api/types';
import { getInstancesByServer } from '../api/infrastructureService';
import { useInfrastructureStore } from '../store/useInfrastructureStore';
import { useMonitoringStore } from '../store/useMonitoringStore';

interface ServerCardProps {
  server: Server;
  healthStatus?: HealthStatus;
  onEdit?: (id: number) => void;
  onDelete?: (id: number, name: string) => void;
  selectionModeActive?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
}

export const ServerCard = ({ 
  server, 
  healthStatus,
  onEdit,
  onDelete,
  selectionModeActive = false,
  selected = false,
  onToggleSelect
}: ServerCardProps) => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const { dbmsList, fetchDbmsList } = useInfrastructureStore();
  const { dbLiveMetricsUnified } = useMonitoringStore();

  useEffect(() => {
    if (dbmsList.length === 0) {
      fetchDbmsList();
    }
  }, [dbmsList, fetchDbmsList]);

  useEffect(() => {
    if (server.monitoreo_db) {
      setInstancesLoading(true);
      getInstancesByServer(server.id_servidor)
        .then((data) => {
          setInstances(data);
        })
        .catch((err) => {
          console.error("Error fetching instances for server:", server.id_servidor, err);
        })
        .finally(() => {
          setInstancesLoading(false);
        });
    }
  }, [server.id_servidor, server.monitoreo_db]);

  const getDbmsName = (id_dbms: number) => {
    const dbms = dbmsList.find((d) => d.id_dbms === id_dbms);
    return dbms ? dbms.nombre_dbms : 'RDBMS';
  };

  const getEngineDetails = (engineName: string, metrics?: any) => {
    const nameLower = engineName.toLowerCase();
    let labelShort = 'MET';
    let labelFull = 'Métrica del Motor';
    let value = 0;

    if (nameLower.includes('mysql')) {
      labelShort = 'HIT';
      labelFull = 'InnoDB Cache Buffer Pool Hit Ratio (Eficiencia de Lectura)';
      value = metrics?.hit_ratio ?? 0;
    } else if (nameLower.includes('oracle')) {
      labelShort = 'TBS';
      labelFull = 'Uso Consolidado de Tablespaces (Almacenamiento)';
      value = metrics?.hit_ratio ?? 0;
    } else if (nameLower.includes('mongo')) {
      labelShort = 'OPL';
      labelFull = 'Eficiencia de Operaciones Oplog / WiredTiger Cache';
      value = metrics?.hit_ratio ?? 0;
    }

    return { labelShort, labelFull, value };
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#22c55e';
      case 'critical': return '#ef4444';
      case 'stale': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const metrics = healthStatus?.live_metrics || {
    cpu: 0,
    ram: 0,
    disks: { '/': 0 },
    uptime: 0,
    timestamp: 0
  };

  const status = healthStatus?.status || 'unknown';
  const mainDiskUsage = metrics.disks['/'] ?? Object.values(metrics.disks)[0] ?? 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectionModeActive && onToggleSelect) {
      e.stopPropagation();
      onToggleSelect(server.id_servidor);
    } else if (!selectionModeActive) {
      navigate(`/server/${server.id_servidor}`);
    }
  };

  return (
    <Paper 
      elevation={0} 
      onClick={handleCardClick}
      sx={{ 
        p: 2, 
        borderRadius: 2.5, 
        border: '1px solid', 
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          borderColor: selected ? 'primary.main' : 'primary.light',
          '& .server-actions': { opacity: 1 }
        }
      }}
    >
      {/* HEADER COMPACTO */}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
          {selectionModeActive && (
            <Checkbox 
              checked={selected}
              onChange={() => onToggleSelect?.(server.id_servidor)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{ p: 0, mr: 0.5 }}
            />
          )}
          <Box 
            sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              bgcolor: getStatusColor(status),
              boxShadow: `0 0 8px ${getStatusColor(status)}80`,
              flexShrink: 0
            }} 
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.2 }}>
              {server.direccion_ip}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 600, display: 'block', maxWidth: 140 }}>
              {server.nombre_servidor}
            </Typography>
          </Box>
        </Stack>

        {!selectionModeActive && (
          <Stack direction="row" className="server-actions" sx={{ opacity: 0.4, transition: 'opacity 0.2s' }}>
            {onEdit && (
              <IconButton size="small" onClick={() => onEdit(server.id_servidor)} sx={{ p: 0.5 }}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            {onDelete && (
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => onDelete(server.id_servidor, server.nombre_servidor)}
                sx={{ p: 0.5 }}
              >
                <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Stack>
        )}
      </Stack>

      {/* GRILLA DE SENSORES - FILA 1: HOST */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75, mb: 0.75 }}>
        <CompactMetric 
          label="CPU" 
          value={metrics.cpu} 
          unit="%" 
          icon={<SpeedIcon sx={{ fontSize: 14 }} />}
          disabled={!server.monitoreo_host}
        />
        <CompactMetric 
          label="RAM" 
          value={metrics.ram} 
          unit="%" 
          icon={<MemoryIcon sx={{ fontSize: 14 }} />}
          disabled={!server.monitoreo_host}
        />
        <CompactMetric 
          label="DSK" 
          value={mainDiskUsage} 
          unit="%" 
          icon={<StorageIcon sx={{ fontSize: 14 }} />}
          disabled={!server.monitoreo_host}
          onAction={(e) => {
            e.stopPropagation();
            navigate(`/server/edit/${server.id_servidor}?tab=storage`);
          }}
        />
      </Box>

      {/* GRILLA DE SENSORES - FILA 2: DATABASE */}
      <Box sx={{ mb: 1.5 }}>
        {!server.monitoreo_db ? (
          <CompactMetric 
            label="RDBMS - Monitoreo desactivado" 
            value={0} 
            unit="" 
            icon={<StorageRoundedIcon sx={{ fontSize: 14 }} />}
            disabled={true}
          />
        ) : instancesLoading ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', py: 0.5, px: 1, borderRadius: 1.5, bgcolor: 'action.hover' }}>
            <CircularProgress size={12} color="inherit" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Cargando motores RDBMS...
            </Typography>
          </Stack>
        ) : instances.length === 0 ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', py: 0.5, px: 1, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px dashed', borderColor: 'warning.light' }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 700 }}>
              Sin instancias de BD registradas
            </Typography>
          </Stack>
        ) : (
          instances.map((instance) => {
            const instanceMetrics = dbLiveMetricsUnified[instance.id_instancia];
            const dbmsName = getDbmsName(instance.id_dbms);
            const isOnline = instanceMetrics?.status === 'online';
            const statusColor = isOnline ? '#22c55e' : (instanceMetrics?.status === 'offline' ? '#ef4444' : '#64748b');
            const details = getEngineDetails(dbmsName, instanceMetrics);

            return (
              <Box key={instance.id_instancia} sx={{ mb: 1.5 }}>
                {/* Mini Cabecera de la Instancia */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75, px: 0.5 }}>
                  <Box 
                    sx={{ 
                      width: 7, 
                      height: 7, 
                      borderRadius: '50%', 
                      bgcolor: statusColor,
                      boxShadow: isOnline ? `0 0 5px ${statusColor}80` : 'none',
                      flexShrink: 0,
                      animation: isOnline ? 'ledPulse 2s infinite ease-in-out' : 'none'
                    }} 
                  />
                  <Tooltip title={
                    `${instance.nombre_instancia} (${dbmsName})` + 
                    (instance.parametros_conexion 
                      ? ` — Parámetros: ${JSON.stringify(instance.parametros_conexion)}` 
                      : '')
                  }>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 800, 
                        fontSize: '0.65rem', 
                        color: 'text.secondary', 
                        fontFamily: '"JetBrains Mono", monospace',
                        cursor: 'help'
                      }}
                    >
                      {instance.nombre_instancia} ({dbmsName})
                    </Typography>
                  </Tooltip>
                </Stack>

                {/* Grid de 3 columnas de CompactMetric idéntico a CPU/RAM/Disk */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
                  <CompactMetric 
                    label="CON" 
                    value={instanceMetrics ? Math.round(instanceMetrics.conn_usage_pct) : 0} 
                    unit="%" 
                    icon={<StorageRoundedIcon sx={{ fontSize: 14 }} />}
                    disabled={!isOnline || !instanceMetrics}
                    tooltipTitle={instanceMetrics ? `Conexiones: ${instanceMetrics.threads_connected}/${instanceMetrics.max_connections} activas (${instanceMetrics.conn_usage_pct.toFixed(1)}% de capacidad)` : undefined}
                  />
                  <CompactMetric 
                    label="QPS" 
                    value={instanceMetrics ? Math.round(instanceMetrics.queries_per_second) : 0} 
                    unit="" 
                    icon={<SpeedIcon sx={{ fontSize: 14 }} />}
                    disabled={!isOnline || !instanceMetrics}
                    tooltipTitle={instanceMetrics ? `Consultas Procesadas: ${instanceMetrics.queries_per_second.toFixed(1)} QPS (Hilos ejecutando queries: ${instanceMetrics.threads_running}, Slow: ${instanceMetrics.slow_queries})` : undefined}
                  />
                  <CompactMetric 
                    label={details.labelShort} 
                    value={instanceMetrics ? Math.round(details.value) : 0} 
                    unit="%" 
                    icon={<MemoryIcon sx={{ fontSize: 14 }} />}
                    disabled={!isOnline || !instanceMetrics}
                    tooltipTitle={instanceMetrics ? `${details.labelFull}: ${details.value.toFixed(1)}%` : undefined}
                  />
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Divider sx={{ mb: 1.5, borderStyle: 'dotted', opacity: 0.6 }} />

      {/* FOOTER MINIMALISTA */}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '0.65rem' }}>
          {metrics.uptime > 0 ? `UP: ${metrics.uptime.toFixed(1)}d` : 'SSH/RDB'}
        </Typography>
        
        {healthStatus?.last_check && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {healthStatus.is_stale && <WarningAmberIcon sx={{ fontSize: 12, color: 'warning.main' }} />}
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', fontWeight: 500 }}>
              {new Date(healthStatus.last_check).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
