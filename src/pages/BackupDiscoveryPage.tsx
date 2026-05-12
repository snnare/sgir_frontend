import { useState, useEffect } from 'react';
import { 
  Box, Typography, Stack, Paper, Button, Grid, 
  FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, Divider, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Chip, Tooltip, Alert
} from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import DnsIcon from '@mui/icons-material/Dns';
import KeyIcon from '@mui/icons-material/Key';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getServers, getCredentialsByServer } from '../api/infrastructureService';
import { getBackupPathsByServer } from '../api/backupService';
import { discoverBackups } from '../api/monitoringService';
import { type Server, type CredentialEnriched, type BackupPath, type BackupDiscoveryResponse } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';

export const BackupDiscoveryPage = () => {
  const { showNotification } = useNotificationStore();
  
  // Datos maestros
  const [servers, setServers] = useState<Server[]>([]);
  const [credentials, setCredentials] = useState<CredentialEnriched[]>([]);
  const [paths, setPaths] = useState<BackupPath[]>([]);

  // Selecciones
  const [selectedServerId, setSelectedServerId] = useState<number | ''>('');
  const [selectedCredId, setSelectedCredId] = useState<number | ''>('');
  const [selectedPathId, setSelectedPathId] = useState<number | ''>('');

  // Estados de carga
  const [loadingServers, setLoadingServers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [discovering, setDiscovering] = useState(false);

  // Resultado
  const [result, setResult] = useState<BackupDiscoveryResponse | null>(null);

  // 1. Cargar servidores al inicio
  useEffect(() => {
    const fetchServers = async () => {
      setLoadingServers(true);
      try {
        const data = await getServers();
        setServers(data);
      } catch (err) {
        showNotification('Error al cargar servidores', 'error');
      } finally {
        setLoadingServers(false);
      }
    };
    fetchServers();
  }, [showNotification]);

  // 2. Cargar credenciales y rutas cuando cambia el servidor
  useEffect(() => {
    if (!selectedServerId) {
      setCredentials([]);
      setPaths([]);
      setSelectedCredId('');
      setSelectedPathId('');
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const [credsData, pathsData] = await Promise.all([
          getCredentialsByServer(Number(selectedServerId)),
          getBackupPathsByServer(Number(selectedServerId))
        ]);
        // Solo credenciales SSH para descubrimiento de archivos (tipo 1 suele ser SSH)
        setCredentials(credsData.filter(c => c.tipo.id_tipo_acceso === 1));
        setPaths(pathsData);
      } catch (err) {
        showNotification('Error al cargar detalles del servidor', 'error');
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
    setSelectedCredId('');
    setSelectedPathId('');
  }, [selectedServerId, showNotification]);

  const handleStartDiscovery = async () => {
    if (!selectedServerId || !selectedCredId || !selectedPathId) return;

    setDiscovering(true);
    setResult(null);
    try {
      const res = await discoverBackups(
        Number(selectedServerId), 
        Number(selectedCredId), 
        Number(selectedPathId)
      );
      setResult(res);
      showNotification('Escaneo de archivos completado', 'success');
    } catch (err: any) {
      console.error(err);
      // El interceptor ya muestra el error, pero podemos limpiar aquí si es necesario
    } finally {
      setDiscovering(false);
    }
  };

  const isExecuteDisabled = !selectedServerId || !selectedCredId || !selectedPathId || discovering;

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Explorador General de Respaldos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Escaneo profundo de archivos físicos en servidores de almacenamiento.
        </Typography>
      </Box>

      {/* Panel de Selección */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: 'background.paper' }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Servidor</InputLabel>
              <Select
                value={selectedServerId}
                label="Servidor"
                onChange={(e) => setSelectedServerId(e.target.value as number)}
                disabled={loadingServers || discovering}
              >
                {servers.map((s) => (
                  <MenuItem key={s.id_servidor} value={s.id_servidor}>
                    <DnsIcon sx={{ fontSize: 16, mr: 1 }} /> {s.nombre_servidor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" disabled={!selectedServerId || loadingDetails || discovering}>
              <InputLabel>Credencial SSH</InputLabel>
              <Select
                value={selectedCredId}
                label="Credencial SSH"
                onChange={(e) => setSelectedCredId(e.target.value as number)}
              >
                {credentials.length === 0 ? (
                  <MenuItem disabled>Sin credenciales SSH</MenuItem>
                ) : (
                  credentials.map((c) => (
                    <MenuItem key={c.id_credencial} value={c.id_credencial}>
                      <KeyIcon sx={{ fontSize: 16, mr: 1 }} /> {c.usuario}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" disabled={!selectedServerId || loadingDetails || discovering}>
              <InputLabel>Ruta de Respaldo</InputLabel>
              <Select
                value={selectedPathId}
                label="Ruta de Respaldo"
                onChange={(e) => setSelectedPathId(e.target.value as number)}
              >
                {paths.length === 0 ? (
                  <MenuItem disabled>Sin rutas configuradas</MenuItem>
                ) : (
                  paths.map((p) => (
                    <MenuItem key={p.id_ruta} value={p.id_ruta}>
                      <FolderOpenIcon sx={{ fontSize: 16, mr: 1 }} /> {p.descripcion_ruta}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={discovering ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={handleStartDiscovery}
              disabled={isExecuteDisabled}
              sx={{ height: 40, borderRadius: 2, fontWeight: 700 }}
            >
              {discovering ? 'Escaneando...' : 'Iniciar Escaneo'}
            </Button>
          </Grid>
        </Grid>

        {selectedServerId && credentials.length === 0 && !loadingDetails && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            Este servidor no tiene credenciales de tipo SSH registradas para explorar archivos.
          </Alert>
        )}
      </Paper>

      {/* Resultados */}
      {result && (
        <Box sx={{ animation: 'slideUp 0.4s ease-out' }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ARCHIVOS FÍSICOS</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{result.archivos_fisicos_conteo}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>PESO TOTAL</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{result.total_peso_mb.toFixed(2)} MB</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>REGISTROS CREADOS</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{result.registros_respaldo_creados}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Nombre del Archivo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Tamaño</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Última Modificación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.archivos.length > 0 ? (
                  result.archivos.map((file, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StorageIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{file.nombre}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={`${file.tamano_mb.toFixed(2)} MB`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {file.fecha_modificacion}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      No se encontraron archivos en la ruta especificada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {!result && !discovering && (
        <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
          <TravelExploreIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6">Seleccione los parámetros para explorar la infraestructura</Typography>
        </Box>
      )}
    </Box>
  );
};
