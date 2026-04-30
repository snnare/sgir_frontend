import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Typography, Button, Stack, Paper, CircularProgress, 
  TextField, InputAdornment, Chip, Divider, IconButton, Tooltip 
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
import { MetricCard } from '../components/MetricCard';
import { ServerCard } from '../components/ServerCard';
import { useInfrastructureStore } from '../store/useInfrastructureStore';

export const HomePage = () => {
  const navigate = useNavigate();
  const { servers, loading, fetchServers } = useInfrastructureStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'critical'>('all');

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const onlineServersCount = servers.filter(s => s.id_estado_servidor === 1).length;
  const criticalServersCount = servers.filter(s => s.id_estado_servidor !== 1).length;

  const filteredServers = useMemo(() => {
    return servers.filter(server => {
      const matchesSearch = 
        server.nombre_servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.direccion_ip.includes(searchTerm);
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'online' && server.id_estado_servidor === 1) ||
        (statusFilter === 'critical' && server.id_estado_servidor !== 1);
      
      return matchesSearch && matchesStatus;
    });
  }, [servers, searchTerm, statusFilter]);

  // Datos mock de métricas para visualización dinámica
  const getMockMetrics = (id: number) => ({
    cpu: Math.floor(((id * 7) % 50) + 15),
    ram: Math.floor(((id * 13) % 40) + 30),
    disk: Math.floor(((id * 3) % 20) + 10),
  });

  if (loading && servers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- SECCIÓN 1: ENCABEZADO (TÍTULO) --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Panel de Control
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Estado global de activos y salud de servidores en tiempo real.
        </Typography>
      </Box>

      {/* --- SECCIÓN 2: MÉTRICAS DE RESUMEN --- */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }, 
          gap: 3,
          mb: 6
        }}
      >
        <MetricCard 
          title="Total Servidores" 
          value={servers.length} 
          unit="Nodos" 
          percent={100} 
          icon={<DnsIcon fontSize="small" />} 
        />
        <MetricCard 
          title="Estado de Salud" 
          value={onlineServersCount} 
          unit="Online" 
          percent={servers.length > 0 ? (onlineServersCount / servers.length) * 100 : 0} 
          icon={<CheckCircleIcon fontSize="small" sx={{ color: '#22c55e' }} />} 
        />
        <MetricCard 
          title="Alertas Activas" 
          value={criticalServersCount} 
          unit="Incidencias" 
          percent={criticalServersCount > 0 ? (criticalServersCount / servers.length) * 100 : 0} 
          icon={<ReportProblemIcon fontSize="small" sx={{ color: criticalServersCount > 0 ? '#ef4444' : 'text.secondary' }} />} 
        />
      </Box>

      {/* --- SECCIÓN 3: ÁREA DEDICADA PARA BOTONES Y FILTROS --- */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 5, 
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        {/* Fila Superior: Búsqueda y Acciones */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Buscar por nombre o IP..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: 'action.hover', border: 'none', '& fieldset': { border: 'none' } }
              }
            }}
          />
          
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Actualizar">
              <IconButton onClick={() => fetchServers()} disabled={loading} size="medium">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => navigate('/bulk-upload')}
              sx={{ borderRadius: 2, fontWeight: 600, px: 2 }}
            >
              Carga Masiva
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-server')}
              sx={{ 
                bgcolor: 'text.primary', 
                color: 'background.paper',
                borderRadius: 2,
                px: 3,
                fontWeight: 700,
                '&:hover': { bgcolor: 'grey.800' }
              }}
            >
              Nuevo Activo
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Fila Inferior: Filtros de Estado */}
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterListIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Chip 
            label={`Todos (${servers.length})`} 
            onClick={() => setStatusFilter('all')}
            color={statusFilter === 'all' ? 'primary' : 'default'}
            variant={statusFilter === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Chip 
            label="En Línea" 
            onClick={() => setStatusFilter('online')}
            color={statusFilter === 'online' ? 'success' : 'default'}
            variant={statusFilter === 'online' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Chip 
            label="Críticos" 
            onClick={() => setStatusFilter('critical')}
            color={statusFilter === 'critical' ? 'error' : 'default'}
            variant={statusFilter === 'critical' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Mostrando {filteredServers.length} de {servers.length} activos
          </Typography>
        </Stack>
      </Paper>

      {/* --- SECCIÓN 4: LISTADO DE SERVIDORES --- */}
      {filteredServers.length > 0 ? (
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: -1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalIcon fontSize="small" color="primary" />
            Inventario de Servidores
          </Typography>
          {filteredServers.map((server) => (
            <ServerCard 
              key={server.id_servidor} 
              server={server} 
              metrics={getMockMetrics(server.id_servidor)}
            />
          ))}
        </Stack>
      ) : (
        /* Vista de estado vacío / No resultados */
        <Paper 
          elevation={0} 
          sx={{ 
            p: 8, 
            textAlign: 'center', 
            border: '2px dashed', 
            borderColor: 'divider',
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4
          }}
        >
          {searchTerm || statusFilter !== 'all' ? (
            <>
              <SearchIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                No se encontraron resultados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ajusta los filtros o el término de búsqueda para encontrar lo que buscas.
              </Typography>
              <Button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                Limpiar filtros
              </Button>
            </>
          ) : (
            <>
              <MonitorHeartIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Sin servidores registrados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 4 }}>
                Comienza registrando tu primer activo para iniciar el monitoreo de infraestructura.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/add-server')}
                sx={{ 
                  bgcolor: 'text.primary', 
                  color: 'background.paper',
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  fontWeight: 700
                }}
              >
                Registrar Primer Activo
              </Button>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};