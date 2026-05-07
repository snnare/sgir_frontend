import { Box, Typography, Paper, Stack, Divider, Tooltip, IconButton } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { MetricCard } from './MetricCard';
import { type Server, type HealthStatus } from '../api/types';

interface ServerCardProps {
  server: Server;
  healthStatus?: HealthStatus;
  onEdit?: (id: number) => void;
  onDelete?: (id: number, name: string) => void;
}

export const ServerCard = ({ 
  server, 
  healthStatus,
  onEdit,
  onDelete
}: ServerCardProps) => {
  // Mapeo de estados técnicos del backend
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#22c55e'; // Verde
      case 'critical': return '#ef4444'; // Rojo
      case 'stale': return '#f59e0b'; // Ámbar
      default: return '#64748b'; // Unknown - Gris
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy': return 'Sano';
      case 'critical': return 'Crítico';
      case 'stale': return 'Desactualizado';
      default: return 'Desconocido';
    }
  };

  // Extraer datos vivos o usar valores por defecto (0)
  const metrics = healthStatus?.live_metrics || {
    cpu: 0,
    ram: 0,
    disks: { '/': 0 },
    uptime: 0,
    timestamp: 0
  };

  const status = healthStatus?.status || 'unknown';

  // Calcular uso de disco principal (raíz /) o el primer disco disponible
  const mainDiskUsage = metrics.disks['/'] ?? Object.values(metrics.disks)[0] ?? 0;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        border: '1px solid', 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.05)'
        }
      }}
    >
      {/* HEADER: IP + STATUS + ACTIONS */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2 }}>
            <TerminalIcon fontSize="small" color="action" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
              {server.direccion_ip}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {server.nombre_servidor} {metrics.uptime > 0 && `(UP: ${metrics.uptime.toFixed(1)}d)`}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Status Indicator */}
          <Tooltip title={getStatusLabel(status)}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: getStatusColor(status),
                boxShadow: `0 0 10px ${getStatusColor(status)}80`,
                animation: status === 'healthy' ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(0.95)', boxShadow: `0 0 0 0 ${getStatusColor(status)}b3` },
                  '70%': { transform: 'scale(1)', boxShadow: `0 0 0 6px ${getStatusColor(status)}00` },
                  '100%': { transform: 'scale(0.95)', boxShadow: `0 0 0 0 ${getStatusColor(status)}00` },
                }
              }} 
            />
          </Tooltip>

          {/* Action Buttons */}
          <Stack direction="row" spacing={0.5}>
            {onEdit && (
              <Tooltip title="Editar Servidor">
                <IconButton size="small" onClick={() => onEdit(server.id_servidor)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Eliminar Servidor">
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => onDelete(server.id_servidor, server.nombre_servidor)}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

      {/* SECCIÓN INFERIOR: MONITOREO SSH vs RDB */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        
        {/* BLOQUE A: SSH MONITORING */}
        <Box sx={{ flex: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <TerminalIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Monitoreo por SSH {status === 'critical' && <Typography component="span" variant="caption" color="error.main" sx={{ ml: 1, fontWeight: 900 }}>• ALERTA</Typography>}
            </Typography>
          </Stack>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 1.5 
          }}>
            <MetricCard 
              title="CPU" 
              value={metrics.cpu} 
              unit="%" 
              percent={metrics.cpu} 
              icon={<SpeedIcon sx={{ fontSize: 14 }} />} 
            />
            <MetricCard 
              title="RAM" 
              value={metrics.ram} 
              unit="%" 
              percent={metrics.ram} 
              icon={<MemoryIcon sx={{ fontSize: 14 }} />} 
            />
            <MetricCard 
              title="DISCO" 
              value={mainDiskUsage} 
              unit="%" 
              percent={mainDiskUsage} 
              icon={<StorageIcon sx={{ fontSize: 14 }} />} 
            />
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderStyle: 'dashed' }} />

        {/* BLOQUE B: RDB MONITORING */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <StorageRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Monitoreo por RDB
            </Typography>
          </Stack>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'action.hover', 
            borderRadius: 2, 
            height: 'calc(100% - 36px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed',
            borderColor: 'divider'
          }}>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ fontWeight: 500 }}>
              Módulos de base de datos<br/>pendientes de vinculación
            </Typography>
          </Box>
        </Box>

      </Stack>
      
      {healthStatus?.last_check && (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ mt: 2 }}>
          {healthStatus.is_stale && (
            <Tooltip title="Datos desactualizados (el servidor no responde)">
              <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            </Tooltip>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            Visto: {new Date(healthStatus.last_check).toLocaleString()}
          </Typography>
        </Stack>
      )}
    </Paper>
  );
};
