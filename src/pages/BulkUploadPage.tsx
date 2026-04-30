import { Container, Box, Typography, Paper, Button, Stack, Alert, CircularProgress, Divider, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { BackButton } from '../components/BackButton';
import { useState, useRef } from 'react';
import { importBulkServers } from '../api/infrastructureService';
import { useNotificationStore } from '../components/GlobalNotification';
import type { ImportSummary } from '../api/types';

export const BulkUploadPage = () => {
  const navigate = useNavigate();
  const showNotification = useNotificationStore((state) => state.showNotification);
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        showNotification('Por favor, selecciona un archivo CSV válido.', 'error');
        return;
      }
      setFile(selectedFile);
      setSummary(null); // Limpiar resumen previo si se cambia el archivo
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setSummary(null);
    try {
      console.log('Iniciando carga de archivo:', file.name);
      const result = await importBulkServers(file);
      console.log('Resultado de la importación:', result);
      setSummary(result);
      if (result.errores.length === 0) {
        showNotification('¡Importación completada con éxito!', 'success');
      } else {
        showNotification(`Importación finalizada con ${result.errores.length} errores.`, 'warning');
      }
    } catch (error: any) {
      console.error('Error detallado en BulkUpload:', error);
      const message = error.response?.data?.detail || 'Error al procesar el archivo.';
      showNotification(typeof message === 'string' ? message : JSON.stringify(message), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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

      {/* ÁREA DE CARGA O RESUMEN */}
      {!summary ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, sm: 6 }, 
            border: '2px dashed', 
            borderColor: file ? 'primary.main' : 'divider', 
            borderRadius: 4,
            bgcolor: file ? 'action.selected' : 'background.paper',
            textAlign: 'center',
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
          onClick={triggerFileInput}
        >
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <Box sx={{ mb: 3 }}>
            {file ? (
              <FilePresentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            ) : (
              <CloudUploadIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            )}
            
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {file ? file.name : 'Selecciona tu archivo CSV'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {file ? `${(file.size / 1024).toFixed(2)} KB` : 'Haz clic para explorar o arrastra el archivo directamente aquí.'}
            </Typography>
          </Box>

          {!file && (
            <Alert 
              severity="info" 
              icon={<InfoOutlinedIcon />}
              sx={{ mb: 4, textAlign: 'left', borderRadius: 2 }}
            >
              El archivo debe estar en formato <strong>.csv</strong>. Ahora puedes definir múltiples <strong>particiones</strong> y asociar instancias de bases de datos a los servidores en un solo paso. Descarga la plantilla para ver la estructura exacta.
            </Alert>
          )}

          <Stack spacing={2}>
            <Button
              variant="contained"
              fullWidth
              disabled={!file || isUploading}
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <FilePresentIcon />}
              sx={{ 
                py: 1.5, 
                fontWeight: 700,
                bgcolor: file ? 'primary.main' : 'text.primary',
                color: 'background.paper',
                borderRadius: 2
              }}
            >
              {isUploading ? 'Procesando...' : 'Subir e Importar'}
            </Button>

            {!file && (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FileDownloadOutlinedIcon />}
                sx={{ 
                  py: 1.5, 
                  fontWeight: 700, 
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('/plantilla_importacion_sgir.zip', '_blank');
                }}
              >
                Descargar Kit de Importación (.zip)
              </Button>
            )}
            
            {file && !isUploading && (
              <Button
                variant="text"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                sx={{ fontWeight: 600, color: 'error.main' }}
              >
                Quitar archivo
              </Button>
            )}
          </Stack>
        </Paper>
      ) : (
        /* VISTA DE RESUMEN DE IMPORTACIÓN */
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Importación Finalizada</Typography>
              <Typography variant="body2" color="text.secondary">
                Se procesaron {summary.total_filas} filas del archivo.
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, textAlign: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>{summary.servidores_procesados}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Servidores</Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>{summary.instancias_procesadas}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Instancias</Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>{summary.credenciales_procesadas}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Credenciales</Typography>
              </Box>
            </Box>

            {summary.errores.length > 0 && (
              <Box>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="error"
                  onClick={() => setShowErrors(!showErrors)}
                  endIcon={showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ borderRadius: 2, justifyContent: 'space-between', px: 2 }}
                >
                  Ver {summary.errores.length} errores encontrados
                </Button>
                <Collapse in={showErrors}>
                  <List sx={{ mt: 1, bgcolor: 'error.lighter', borderRadius: 2, maxHeight: 200, overflow: 'auto' }}>
                    {summary.errores.map((err, index) => (
                      <ListItem key={index} divider={index < summary.errores.length - 1}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <ErrorOutlinedIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`Fila ${err.fila}`} 
                          secondary={err.error}
                          slotProps={{
                            primary: { variant: 'caption', fontWeight: 700 },
                            secondary: { variant: 'caption' }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            )}

            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/')}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              Ir al Inventario
            </Button>
            
            <Button 
              variant="text" 
              fullWidth 
              onClick={() => {
                setSummary(null);
                setFile(null);
              }}
              sx={{ fontWeight: 600 }}
            >
              Subir otro archivo
            </Button>
          </Stack>
        </Paper>
      )}

      {!summary && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ mt: 4, display: 'block', textAlign: 'center', px: 4 }}
        >
          Nota: La carga masiva validará cada registro individualmente. Los errores se mostrarán en un reporte detallado al finalizar el proceso.
        </Typography>
      )}
    </Container>
  );
};
