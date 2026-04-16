import { Typography, Box } from '@mui/material';
import { MetricCard } from '../components/MetricCard';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';

export const HomePage = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>
        Dashboard General
      </Typography>
      
      {/* Usamos Box con display grid para evitar el error "item={true}" */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr',           // 1 columna en móvil
            md: 'repeat(3, 1fr)' // 3 columnas en desktop
          }, 
          gap: 3 
        }}
      >
        <MetricCard 
          title="Uso de CPU" 
          value="42.5" 
          unit="%" 
          percent={42.5} 
          icon={<SpeedIcon />} 
        />
        <MetricCard 
          title="Memoria RAM" 
          value="12.8" 
          unit="GB" 
          percent={88} 
          icon={<MemoryIcon />} 
        />
        <MetricCard 
          title="Almacenamiento" 
          value="1.2" 
          unit="TB" 
          percent={15} 
          icon={<StorageIcon />} 
        />
      </Box>
    </Box>
  );
};