import { useState } from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import { MetricCard } from '../components/MetricCard';

export const HomePage = () => {
  const navigate = useNavigate();
  // Simulación: Cambia a false para ver el estado vacío
  const [hasServers] = useState(true);

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

        {/* Botones de acción principales */}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              borderStyle: 'dashed', 
              color: 'text.secondary', 
              borderColor: 'divider',
              px: 3,
              borderRadius: 2,
              '&:hover': {
                borderStyle: 'dashed',
                bgcolor: 'action.hover'
              }
            }}
          >
            Carga Masiva
          </Button>
          <Button
            variant="contained"
            size="medium"
            startIcon={<MonitorHeartIcon />}
            onClick={() => navigate('/add-server')}
            sx={{ 
              bgcolor: 'text.primary', 
              color: 'background.paper',
              px: 3,
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: '0 4px 14px 0 rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: 'text.secondary',
                boxShadow: '0 6px 20px 0 rgba(0,0,0,0.2)',
              }
            }}
          >
            Registrar Activo
          </Button>
        </Stack>
      </Stack>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {hasServers ? (
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
            title="Uso de CPU" 
            value="42.5" 
            unit="%" 
            percent={42.5} 
            icon={<SpeedIcon fontSize="small" />} 
          />
          <MetricCard 
            title="Memoria RAM" 
            value="12.8" 
            unit="GB" 
            percent={88} 
            icon={<MemoryIcon fontSize="small" />} 
          />
          <MetricCard 
            title="Almacenamiento" 
            value="1.2" 
            unit="TB" 
            percent={15} 
            icon={<StorageIcon fontSize="small" />} 
          />
        </Box>
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
            No hay activos registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            Utiliza los botones superiores para registrar tu primer servidor y comenzar a recolectar métricas en tiempo real.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
