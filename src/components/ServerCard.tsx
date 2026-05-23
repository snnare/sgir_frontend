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
    let label = 'Métrica';
    let value = 0;
    let unit = '%';

    if (nameLower.includes('mysql')) {
      label = 'Hit Ratio';
      value = metrics?.hit_ratio ?? 0;
    } else if (nameLower.includes('oracle')) {
      label = 'Tablespace';
      value = metrics?.hit_ratio ?? 0;
    } else if (nameLower.includes('mongo')) {
      label = 'Hit/OpLog';
      value = metrics?.hit_ratio ?? 0;
    }

    return { label, value, unit };
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
        cursor: selectionModeActive ? 'pointer' : 'default',
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
              <Stack 
                key={instance.id_instancia} 
                direction="row" 
                spacing={1} 
                sx={{ 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 0.75, 
                  mb: 0.5,
                  borderRadius: 1.5,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'action.selected'
                  }
                }}
              >
                {/* Nombre e Icono */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: statusColor,
                      boxShadow: isOnline ? `0 0 6px ${statusColor}80` : 'none',
                      flexShrink: 0,
                      animation: isOnline ? 'ledPulse 2s infinite ease-in-out' : 'none'
                    }} 
                  />
                  <Typography variant="caption" noWrap sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}>
                    [{dbmsName}] {instance.nombre_instancia}
                  </Typography>
                </Stack>

                {/* Métricas compactas */}
                {instanceMetrics ? (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
                    <Tooltip title={`Hilos: ${instanceMetrics.threads_connected}/${instanceMetrics.max_connections}`}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: 'text.secondary' }}>
                        Conn: {instanceMetrics.conn_usage_pct.toFixed(0)}%
                      </Typography>
                    </Tooltip>
                    
                    <Tooltip title={`Consultas por segundo (QPS) / Slow: ${instanceMetrics.slow_queries}`}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: 'text.secondary' }}>
                        QPS: {instanceMetrics.queries_per_second.toFixed(0)}
                      </Typography>
                    </Tooltip>

                    <Tooltip title={`${details.label}: ${details.value.toFixed(1)}%`}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 800, 
                          fontSize: '0.62rem', 
                          color: isOnline ? 'primary.main' : 'text.disabled', 
                          bgcolor: isOnline ? 'primary.light' : 'action.disabledBackground', 
                          px: 0.5, 
                          py: 0.1, 
                          borderRadius: 0.5,
                          opacity: isOnline ? 0.9 : 0.5
                        }}
                      >
                        {details.value.toFixed(0)}%
                      </Typography>
                    </Tooltip>
                  </Stack>
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.62rem', fontWeight: 500 }}>
                    Sin lectura
                  </Typography>
                )}
              </Stack>
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
