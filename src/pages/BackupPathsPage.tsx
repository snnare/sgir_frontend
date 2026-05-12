import { Box, Typography, Paper, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

export const BackupPathsPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            Rutas de Respaldo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de destinos y almacenamiento para los respaldos.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-path')}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Nueva Ruta
        </Button>
      </Box>

      <Paper 
        variant="outlined" 
        sx={{ 
          p: 8, 
          textAlign: 'center', 
          borderRadius: 3, 
          bgcolor: 'background.paper',
          borderStyle: 'dashed',
          borderWidth: 2
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Módulo de Rutas en construcción
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aquí podrás administrar los puntos de montaje y servidores de destino.
        </Typography>
      </Paper>
    </Box>
  );
};
