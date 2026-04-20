import { Box, Typography, Paper, Stack, Divider, Tooltip } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { MetricCard } from './MetricCard';
import { type Server } from '../api/types';

interface ServerCardProps {
  server: Server;
  metrics?: {
    cpu: number;
    ram: number;
    disk: number;
  };
}

export const ServerCard = ({ server, metrics = { cpu: 0, ram: 0, disk: 0 } }: ServerCardProps) => {
  // Mapeo de estados técnicos
  const getStatusColor = (id: number) => {
    switch (id) {
      case 1: return '#22c55e'; // Online - Verde
      case 2: return '#f59e0b'; // Warning - Ámbar
      default: return '#ef4444'; // Offline - Rojo
    }
  };

  const getStatusLabel = (id: number) => {
    switch (id) {
      case 1: return 'En línea';
      case 2: return 'Advertencia';
      default: return 'Desconectado';
    }
  };

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
      {/* HEADER: IP + STATUS */}
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
              {server.nombre_servidor}
            </Typography>
          </Box>
        </Stack>

        <Tooltip title={getStatusLabel(server.id_estado_servidor)}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: getStatusColor(server.id_estado_servidor),
              boxShadow: `0 0 10px ${getStatusColor(server.id_estado_servidor)}80`,
              animation: server.id_estado_servidor === 1 ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
                '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(34, 197, 94, 0)' },
                '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
              }
            }} 
          />
        </Tooltip>
      </Stack>

      <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

      {/* SECCIÓN INFERIOR: MONITOREO SSH vs RDB */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        
        {/* BLOQUE A: SSH MONITORING */}
        <Box sx={{ flex: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <TerminalIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Monitoreo por SSH
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
              value={metrics.disk} 
              unit="%" 
              percent={metrics.disk} 
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
    </Paper>
  );
};