import { Container, Box, Typography, Button, Stack, Fade } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState } from 'react';
import { ProfileDetails } from '../components/ProfileDetails';
import { ProfileForm } from '../components/ProfileForm';
import { BackButton } from '../components/BackButton';
import { useNotificationStore } from '../components/GlobalNotification';

export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { showNotification } = useNotificationStore();

  const handleDeleteAccount = () => {
    showNotification('La eliminación de cuenta debe ser solicitada al administrador del sistema.', 'info');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {/* SECCIÓN DE ENCABEZADO */}
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
          {isEditing ? 'Editar Perfil' : 'Mi Perfil'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {isEditing 
            ? 'Actualiza tu información personal para mantener tu cuenta al día.' 
            : 'Gestiona tu información personal y preferencias de cuenta.'}
        </Typography>
      </Box>

      {/* Caja del Perfil */}
      <Box sx={{ 
        p: { xs: 3, sm: 5 }, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        bgcolor: 'background.paper',
        position: 'relative',
        minHeight: 400
      }}>
        {isEditing ? (
          <Fade in={isEditing}>
            <Box>
              <ProfileForm 
                onCancel={() => setIsEditing(false)} 
                onSuccess={() => setIsEditing(false)} 
              />
            </Box>
          </Fade>
        ) : (
          <Fade in={!isEditing}>
            <Box>
              <ProfileDetails />

              {/* Acciones de Cuenta */}
              <Stack spacing={2} sx={{ mt: 6 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setIsEditing(true)}
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
                  onClick={handleDeleteAccount}
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
          </Fade>
        )}
      </Box>
      
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ mt: 4, display: 'block', textAlign: 'center', px: 4 }}
      >
        Toda acción de modificación se registra en los logs de auditoría del sistema para garantizar la trazabilidad de los datos.
      </Typography>
    </Container>
  );
};
