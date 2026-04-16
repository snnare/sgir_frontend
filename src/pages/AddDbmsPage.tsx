import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DbmsForm } from '../components/DbmsForm';

export const AddDbmsPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          Volver a Instancia
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
          Registrar Motor DBMS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Añade un nuevo motor al catálogo global para que esté disponible al crear instancias.
        </Typography>
      </Box>

      <Box sx={{ 
        p: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        bgcolor: 'background.paper' 
      }}>
        <DbmsForm />
      </Box>
    </Container>
  );
};