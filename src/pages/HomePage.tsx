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
  // Simulación: Cambia a false para ver el Empty State
  const [hasServers] = useState(true);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- HEADER SECCIÓN --- */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        spacing={2}
        sx={{ mb: 5 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
            Dashboard General
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estado actual de la infraestructura monitoreada.
          </Typography>
        </Box>

        {/* Botones de acción siempre visibles */}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              borderStyle: 'dashed', 
              color: 'text.secondary', 
              borderColor: 'divider',
              px: 2
            }}
          >
            Carga Masiva
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<MonitorHeartIcon />}
            onClick={() => navigate('/add-server')}
            sx={{ 
              bgcolor: 'text.primary', 
              color: 'background.paper',
              px: 2,
              fontWeight: 600
            }}
          >
            Add Monitoreo
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
        /* Vista de Empty State (ahora más compacta dentro del layout) */
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
            alignItems: 'center'
          }}
        >
          <MonitorHeartIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No hay activos registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            Utiliza los botones superiores para registrar tu primer servidor y comenzar a recolectar métricas.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};