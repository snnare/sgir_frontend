import { Container, Box, Typography, Paper, Button, Stack, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { BackButton } from '../components/BackButton';

export const BulkUploadPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {/* SECCIÓN DE ENCABEZADO */}
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
          Carga Masiva
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Importa múltiples activos al inventario de forma simultánea.
        </Typography>
      </Box>

      {/* ÁREA DE CARGA */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 6 }, 
          border: '2px dashed', 
          borderColor: 'divider', 
          borderRadius: 4,
          bgcolor: 'background.paper',
          textAlign: 'center',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <Box sx={{ mb: 3 }}>
          <CloudUploadIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Selecciona tu archivo CSV
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Haz clic para explorar o arrastra el archivo directamente aquí.
          </Typography>
        </Box>

        <Alert 
          severity="info" 
          icon={<InfoOutlinedIcon />}
          sx={{ mb: 4, textAlign: 'left', borderRadius: 2 }}
        >
          El archivo debe estar en formato <strong>.csv</strong> y seguir la estructura de columnas definida en la plantilla técnica del sistema.
        </Alert>

        <Stack spacing={2}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<FilePresentIcon />}
            sx={{ 
              py: 1.5, 
              fontWeight: 700,
              bgcolor: 'text.primary',
              color: 'background.paper',
              borderRadius: 2
            }}
          >
            Subir Archivo
          </Button>

          <Button
            variant="text"
            fullWidth
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            Descargar Plantilla CSV
          </Button>
        </Stack>
      </Paper>

      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ mt: 4, display: 'block', textAlign: 'center', px: 4 }}
      >
        Nota: La carga masiva validará cada registro individualmente. Los errores se mostrarán en un reporte detallado al finalizar el proceso.
      </Typography>
    </Container>
  );
};
