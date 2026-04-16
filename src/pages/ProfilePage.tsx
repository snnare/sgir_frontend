import { Container, Box, Typography, Button, Stack, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ProfileDetails } from '../components/ProfileDetails';

export const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ color: 'text.secondary', mb: 2 }}
      >
        Volver
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, letterSpacing: '-0.04em' }}>
          Mi Perfil
        </Typography>

        <ProfileDetails />

        {/* Acciones de Cuenta */}
        <Stack spacing={2} sx={{ mt: 6 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<EditIcon />}
            sx={{ 
              py: 1.5, 
              fontWeight: 700, 
              bgcolor: 'text.primary',
              color: 'background.paper' 
            }}
          >
            Editar Información
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<DeleteForeverIcon />}
            sx={{ 
              py: 1.5, 
              fontWeight: 600, 
              color: '#ef4444', 
              borderColor: '#fee2e2',
              borderStyle: 'dashed',
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: '#fef2f2'
              }
            }}
          >
            Eliminar Cuenta
          </Button>
        </Stack>
      </Paper>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block', textAlign: 'center' }}>
        Toda acción de eliminación es permanente y se registra en los logs de auditoría del SGIR.
      </Typography>
    </Container>
  );
};