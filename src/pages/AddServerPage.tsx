import { Container, Box, Typography } from '@mui/material';
import { ServerForm } from '../components/ServerForm';
import { BackButton } from '../components/BackButton';

export const AddServerPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {/* Contenedor del encabezado alineado a la izquierda */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        
        <BackButton to="/" label="Volver al Dashboard" />
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '-0.04em',
            mt: 0.5, 
            lineHeight: 1.2
          }}
        >
          Nuevo Servidor
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Registra un nuevo activo en el inventario para habilitar el monitoreo.
        </Typography>
      </Box>

      {/* Caja del Formulario */}
      <Box sx={{ 
        p: { xs: 3, sm: 5 }, 
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