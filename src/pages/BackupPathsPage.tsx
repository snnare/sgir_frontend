import { useSearchParams } from 'react-router-dom';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import { BackButton } from '../components/BackButton';

export const BackupPathsPage = () => {
  const [searchParams] = useSearchParams();
  const serverId = searchParams.get('serverId');

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <BackButton to="/" label="Volver al Panel de Control" />
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em', mt: 0.5 }}>
          Rutas de Respaldo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administración de destinos de almacenamiento para el servidor ID: {serverId || 'General'}
        </Typography>
      </Box>

      <Paper 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 3, 
          border: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ 
          display: 'inline-flex', 
          p: 2, 
          bgcolor: 'action.hover', 
          borderRadius: '50%', 
          mb: 3 
        }}>
          <StorageIcon sx={{ fontSize: 48, color: 'primary.main' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Configuración de Almacenamiento
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          Este módulo permitirá definir y validar las rutas de red (SMB/NFS) o locales donde se depositarán los respaldos de este activo.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.history.back()}
          sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
        >
          Regresar
        </Button>
      </Paper>
    </Container>
  );
};
