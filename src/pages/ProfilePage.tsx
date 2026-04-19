import { Container, Box, Typography, Button, Stack, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ProfileDetails } from '../components/ProfileDetails';
import { BackButton } from '../components/BackButton';

export const ProfilePage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {/* SECCIÓN DE ENCABEZADO - Siguiendo el diseño de AddServerPage */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <BackButton label="Volver al Dashboard" />
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '-0.04em',
            mt: 0.5, 
            lineHeight: 1.2
          }}
        >
          Mi Perfil
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Gestiona tu información personal y preferencias de cuenta.
        </Typography>
      </Box>

      {/* Caja del Perfil */}
      <Box sx={{ 
        p: { xs: 3, sm: 5 }, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}>
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
              color: 'background.paper',
              borderRadius: 2,
              boxShadow: '0 4px 14px 0 rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: 'text.secondary',
                boxShadow: '0 6px 20px 0 rgba(0,0,0,0.2)',
              }
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
              borderRadius: 2,
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: '#fef2f2'
              }
            }}
          >
            Eliminar Cuenta
          </Button>
        </Stack>
      </Box>
      
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ mt: 4, display: 'block', textAlign: 'center', px: 4 }}
      >
        Toda acción de eliminación es permanente y se registra en los logs de auditoría del sistema.
      </Typography>
    </Container>
  );
};
