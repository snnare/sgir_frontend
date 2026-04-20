import { useEffect } from 'react';
import { Box, Typography, Button, Stack, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import TerminalIcon from '@mui/icons-material/Terminal';
import DnsIcon from '@mui/icons-material/Dns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { MetricCard } from '../components/MetricCard';
import { ServerCard } from '../components/ServerCard';
import { useInfrastructureStore } from '../store/useInfrastructureStore';

export const HomePage = () => {
  const navigate = useNavigate();
  const { servers, loading, fetchServers } = useInfrastructureStore();

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const hasServers = servers.length > 0;
  const onlineServers = servers.filter(s => s.id_estado_servidor === 1).length;
  const criticalServers = servers.filter(s => s.id_estado_servidor !== 1).length;

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
      {/* --- SECCIÓN DE ENCABEZADO --- */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        spacing={2}
        sx={{ mb: 5 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
            Panel de Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resumen del estado actual de la infraestructura monitoreada.
          </Typography>
        </Box>

        {/* Botones de acción principales - Solo visibles si hay activos */}
        {hasServers && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<CloudUploadIcon />}
              sx={{ 
                border: '1.5px dashed', 
                borderColor: 'divider',
                color: 'text.secondary', 
                px: 3,
                py: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  border: '1.5px dashed',
                  borderColor: 'text.primary',
                  color: 'text.primary',
                  bgcolor: 'transparent',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Carga Masiva
            </Button>
            <Button
              variant="contained"
              size="medium"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-server')}
              sx={{ 
                bgcolor: 'text.primary', 
                color: 'background.paper',
                px: 3,
                py: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'grey.800',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Registro Servidor
            </Button>
          </Stack>
        )}
      </Stack>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {hasServers ? (
        <Stack spacing={4}>
          {/* Resumen de Inventario */}
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                lg: 'repeat(3, 1fr)' 
              }, 
              gap: 3 
            }}
          >
            <MetricCard 
              title="Total de Servidores" 
              value={servers.length} 
              unit="Nodos" 
              percent={100} 
              icon={<DnsIcon fontSize="small" />} 
            />
            <MetricCard 
              title="Servidores Online" 
              value={onlineServers} 
              unit="Activos" 
              percent={servers.length > 0 ? (onlineServers / servers.length) * 100 : 0} 
              icon={<CheckCircleIcon fontSize="small" sx={{ color: '#22c55e' }} />} 
            />
            <MetricCard 
              title="Alertas Activas" 
              value={criticalServers} 
              unit="Incidencias" 
              percent={criticalServers > 0 ? 90 : 0} 
              icon={<ReportProblemIcon fontSize="small" sx={{ color: criticalServers > 0 ? '#ef4444' : 'text.secondary' }} />} 
            />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TerminalIcon fontSize="small" color="primary" />
              Servidores en Monitoreo
            </Typography>
            
            <Stack spacing={3}>
              {servers.map((server) => (
                <ServerCard 
                  key={server.id_servidor} 
                  server={server} 
                  metrics={getMockMetrics(server.id_servidor)}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      ) : (
        /* Vista de estado vacío */
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
          <MonitorHeartIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Primero agrega un servidor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 4 }}>
            No se han detectado activos en el sistema. Es necesario registrar al menos un servidor para comenzar con el monitoreo.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-server')}
            sx={{ 
              bgcolor: 'text.primary', 
              color: 'background.paper',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12)',
              '&:hover': {
                bgcolor: 'text.secondary',
              }
            }}
          >
            Registrar Primer Servidor
          </Button>
        </Paper>
      )}
    </Box>
  );
};