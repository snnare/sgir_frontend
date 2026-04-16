import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ServerForm } from '../components/ServerForm';

export const AddServerPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')}
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          Volver al Dashboard
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
          Nuevo Servidor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registra un nuevo activo en el inventario del SGIR para comenzar el monitoreo.
        </Typography>
      </Box>

      <Box sx={{ 
        p: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        bgcolor: 'background.paper' 
      }}>
        <ServerForm />
      </Box>
    </Container>
  );
};