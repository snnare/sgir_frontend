import { Container, Box, Typography, Paper, Button, Stack, Alert, CircularProgress, Divider, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { importBulkBackupPaths } from '../api/backupService';
import { useNotificationStore } from '../components/GlobalNotification';
import { useAlertStore } from '../store/useAlertStore';
import type { ImportSummary } from '../api/types';

// Configuración de cargas dinámicas por tipo de activo
interface UploadConfig {
  title: string;
  subtitle: string;
  description: string;
  helperText: string;
  zipPath: string;
  apiCall?: (file: File) => Promise<ImportSummary>;
  mockResult: (file: File) => ImportSummary;
}

const UPLOAD_CONFIGS: Record<string, UploadConfig> = {
  servidores: {
    title: 'Carga Masiva de Servidores',
    subtitle: 'Importa múltiples activos al inventario de forma simultánea.',
    description: 'Registra servidores físicos o virtuales en la CMDB junto con sus credenciales, almacenamiento y bases de datos en un solo paso.',
    helperText: 'El archivo debe estar en formato .csv. Ahora puedes definir múltiples particiones y asociar instancias de bases de datos de forma transaccional. Descarga el kit para ver la estructura exacta.',
    zipPath: '/templates/importacion_servidores.zip',
    apiCall: importBulkServers,
    mockResult: () => ({ total_filas: 3, servidores_procesados: 2, instancias_procesadas: 2, credenciales_procesadas: 2, errores: [] })
  },
  rutas: {
    title: 'Carga Masiva de Rutas',
    subtitle: 'Importa puntos de montaje físicos, NAS/NFS y Cloud Storage.',
    description: 'Registra directorios locales y almacenamiento de red en bloque para habilitar de inmediato las políticas de respaldo y monitoreo.',
    helperText: 'El archivo debe estar en formato .csv. Asegúrate de configurar correctamente los puntos de montaje absolutos de Linux y sus alias descriptivos.',
    zipPath: '/templates/importacion_rutas.zip',
    apiCall: importBulkBackupPaths,
    mockResult: () => ({ total_filas: 4, servidores_procesados: 0, instancias_procesadas: 0, credenciales_procesadas: 0, errores: [] })
  },
  'bases-datos': {
    title: 'Carga Masiva de Bases de Datos',
    subtitle: 'Registra motores DBMS de forma masiva sobre tus servidores.',
    description: 'Asocia instancias de MySQL, Oracle and MongoDB a tus servidores físicos o virtuales previamente existentes.',
    helperText: 'El archivo debe estar en formato .csv. Cada motor debe enlazarse a una IP de servidor válida y pre-registrada en tu inventario.',
    zipPath: '/templates/importacion_bases_datos.zip',
    mockResult: () => ({ total_filas: 3, servidores_procesados: 0, instancias_procesadas: 3, credenciales_procesadas: 0, errores: [] })
  },
  politicas: {
    title: 'Carga Masiva de Políticas',
    subtitle: 'Registra reglas de respaldo y automatización en bloque.',
    description: 'Carga múltiples directivas de respaldo configuradas mediante expresiones Cron y frecuencias de retención de datos.',
    helperText: 'El archivo debe estar en formato .csv. Se validará que las expresiones Cron introducidas sean sintácticamente válidas para los schedulers.',
    zipPath: '/templates/importacion_politicas.zip',
    mockResult: () => ({ total_filas: 2, servidores_procesados: 0, instancias_procesadas: 0, credenciales_procesadas: 0, errores: [] })
  },
  asignaciones: {
    title: 'Carga Masiva de Asignaciones',
    subtitle: 'Vincula políticas de respaldo a bases de datos y rutas en bloque.',
    description: 'Asocia de forma masiva directivas de respaldo preestablecidas a tus activos, instancias y directorios.',
    helperText: 'El archivo debe estar en formato .csv. Asegúrate de relacionar IDs de políticas y rutas de respaldo válidos en la plataforma.',
    zipPath: '/templates/importacion_asignaciones.zip',
    mockResult: () => ({ total_filas: 5, servidores_procesados: 0, instancias_procesadas: 0, credenciales_procesadas: 0, errores: [] })
  },
  credenciales: {
    title: 'Carga Masiva de Credenciales',
    subtitle: 'Carga accesos SSH y DBMS al llavero de seguridad.',
    description: 'Sube contraseñas y claves de manera segura y encriptada (AES-256) para habilitar diagnósticos automáticos.',
    helperText: 'El archivo debe estar en formato .csv. El backend encriptará las contraseñas al vuelo de forma totalmente transparente.',
    zipPath: '/templates/importacion_servidores.zip',
    mockResult: () => ({ total_filas: 3, servidores_procesados: 0, instancias_procesadas: 0, credenciales_procesadas: 3, errores: [] })
  },
  completo: {
    title: 'Carga Masiva Global (Kit Completo)',
    subtitle: 'Administra y descarga todas las plantillas e instructivos del sistema.',
    description: 'Inicializa y carga todos tus activos en lote descargando el kit unificado con todas las plantillas de datos y sus respectivas guías en un solo paso.',
    helperText: 'El archivo descargado contiene los 5 CSV de plantilla listos para usar y las 5 guías explicativas detalladas en formato plano sin carpetas.',
    zipPath: '/templates/kit_completo.zip',
    mockResult: () => ({ total_filas: 15, servidores_procesados: 5, instancias_procesadas: 5, credenciales_procesadas: 5, errores: [] })
  }
};

export const BulkUploadPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const { showAlert } = useAlertStore();

  // Determinar el tipo de carga actual basándose en la URL (?type=...)
  const rawType = searchParams.get('type') || searchParams.get('target') || 'completo';
  const type = UPLOAD_CONFIGS[rawType] ? rawType : 'completo';
  const config = UPLOAD_CONFIGS[type];
  
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
      console.log(`[Carga Masiva - ${type}] Iniciando carga de archivo:`, file.name);
      
      let result: ImportSummary;
      if (config.apiCall) {
        // Ejecución real con el endpoint del backend
        result = await config.apiCall(file);
      } else {
        // Simulación en frontend si el backend aún no expone el endpoint específico
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Emular latencia de red
        result = config.mockResult(file);
      }

      console.log('Resultado de la importación:', result);
      setSummary(result);
      
      if (result.errores.length === 0) {
        if (!config.apiCall) {
          showNotification('¡Importación simulada con éxito! (Backend en desarrollo)', 'success');
        } else {
          showNotification('¡Importación completada con éxito!', 'success');
        }
      } else {
        showNotification(`Importación finalizada con ${result.errores.length} errores.`, 'warning');
      }
    } catch (error: any) {
      console.error('Error detallado en BulkUpload:', error);
      const message = error.response?.data?.detail || 'Error al procesar el archivo.';
      showAlert({
        title: 'Error de Carga',
        description: typeof message === 'string' ? message : 'El archivo CSV contiene registros duplicados, un formato de red inválido, o campos vacíos.',
        severity: 'error'
      });
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
        <BackButton to="/" label="Volver al Panel Principal" />
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '-0.04em',
            mt: 0.5, 
            lineHeight: 1.2
          }}
        >
          {config.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {config.subtitle}
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
              {file ? file.name : `Selecciona el archivo de ${config.title.toLowerCase().replace('carga masiva de ', '')}`}
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
              {config.helperText}
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
                component="a"
                href={config.zipPath}
                download={config.zipPath.split('/').pop() || 'plantilla.zip'}
                onClick={(e) => {
                  e.stopPropagation(); // Previene que el click propague al Paper contenedor y abra el explorador
                }}
                sx={{ 
                  py: 1.5, 
                  fontWeight: 700, 
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Descargar Plantilla y Guía (.zip)
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
              {!config.apiCall && (
                <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2, textAlign: 'left' }}>
                  <strong>Modo Simulación:</strong> El backend no implementa este tipo de carga aún. Se muestran resultados simulados de alta fidelidad.
                </Alert>
              )}
            </Box>

            <Divider />

            {(() => {
              const getMetrics = () => {
                switch (type) {
                  case 'rutas':
                    return [{ label: 'Rutas Importadas', value: summary.rutas_procesadas ?? 0 }];
                  case 'bases-datos':
                    return [{ label: 'Bases de Datos', value: summary.bases_procesadas ?? 0 }];
                  case 'politicas':
                    return [{ label: 'Políticas creadas', value: summary.politicas_procesadas ?? 0 }];
                  case 'asignaciones':
                    return [{ label: 'Asignaciones', value: summary.asignaciones_procesadas ?? 0 }];
                  case 'credenciales':
                    return [{ label: 'Credenciales', value: summary.credenciales_procesadas ?? 0 }];
                  case 'servidores':
                  case 'completo':
                  default:
                    return [
                      { label: 'Servidores', value: summary.servidores_procesados ?? 0 },
                      { label: 'Instancias', value: summary.instancias_procesadas ?? 0 },
                      { label: 'Credenciales', value: summary.credenciales_procesadas ?? 0 }
                    ];
                }
              };
              const metrics = getMetrics();
              return (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${metrics.length}, 1fr)`, 
                  gap: 2, 
                  textAlign: 'center' 
                }}>
                  {metrics.map((m, idx) => (
                    <Box key={idx}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {m.value}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                        {m.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              );
            })()}

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
                            primary: { variant: 'caption', sx: { fontWeight: 700 } },
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
