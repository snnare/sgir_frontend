import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CredentialForm } from '../components/CredentialForm';

export const AddCredentialPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} // Regresa a la página anterior
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          Volver
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
          Configurar Credenciales
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Las credenciales se cifran de forma reversible (AES) para permitir el acceso remoto automatizado.
        </Typography>
      </Box>

      <Box sx={{ 
        p: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        bgcolor: 'background.paper' 
      }}>
        <CredentialForm />
      </Box>
    </Container>
  );
};