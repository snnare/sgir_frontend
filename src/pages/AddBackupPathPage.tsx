import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BackupPathForm } from '../components/BackupPathForm';

export const AddBackupPathPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          Volver
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
          Configurar Destino de Respaldo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define las rutas físicas o lógicas donde el orquestador depositará los dumps de base de datos.
        </Typography>
      </Box>

      <Box sx={{ 
        p: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        bgcolor: 'background.paper' 
      }}>
        <BackupPathForm />
      </Box>
    </Container>
  );
};