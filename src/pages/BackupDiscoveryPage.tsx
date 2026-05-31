import { useState, useEffect } from 'react';
import { 
  Box, Typography, Stack, Paper, Button, Grid, 
  FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Chip, Alert, ToggleButton, ToggleButtonGroup,
  Card, CardContent, List, ListItem, ListItemText, Divider
} from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import DnsIcon from '@mui/icons-material/Dns';
import KeyIcon from '@mui/icons-material/Key';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StorageIcon from '@mui/icons-material/Storage';
import LanIcon from '@mui/icons-material/Lan';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import { getServers, getCredentialsByServer, getInstancesByServer } from '../api/infrastructureService';
import { getBackupPathsByServer } from '../api/backupService';
import { discoverBackups, discoverInstanceBackups, discoverAllBackups } from '../api/monitoringService';
import { 
  type Server, type CredentialEnriched, type BackupPath, 
  type BackupDiscoveryResponse, type Instance, type GlobalBackupDiscoveryResponse 
} from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';

export const BackupDiscoveryPage = () => {
  const { showNotification } = useNotificationStore();
  
  // Modos de escaneo: 'server' (General), 'instance' (Específica), 'global' (Masiva)
  const [mode, setMode] = useState<'server' | 'instance' | 'global'>('server');

  // Datos maestros
  const [servers, setServers] = useState<Server[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [credentials, setCredentials] = useState<CredentialEnriched[]>([]);
  const [paths, setPaths] = useState<BackupPath[]>([]);

  // Selecciones
  const [selectedServerId, setSelectedServerId] = useState<number | ''>('');
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | ''>('');
  const [selectedCredId, setSelectedCredId] = useState<number | ''>('');
  const [selectedPathId, setSelectedPathId] = useState<number | ''>('');

  // Estados de carga
  const [loadingServers, setLoadingServers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [discovering, setDiscovering] = useState(false);

  // Resultados
  const [result, setResult] = useState<BackupDiscoveryResponse | null>(null);
  const [globalResult, setGlobalResult] = useState<GlobalBackupDiscoveryResponse | null>(null);

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

  // Limpiar resultados al cambiar de modo
  useEffect(() => {
    setResult(null);
    setGlobalResult(null);
  }, [mode]);

  // 2. Cargar credenciales, rutas e instancias cuando cambia el servidor
  useEffect(() => {
    if (!selectedServerId) {
      setCredentials([]);
      setPaths([]);
      setInstances([]);
      setSelectedCredId('');
      setSelectedPathId('');
      setSelectedInstanceId('');
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const [credsData, pathsData, instancesData] = await Promise.all([
          getCredentialsByServer(Number(selectedServerId)),
          getBackupPathsByServer(Number(selectedServerId)),
          getInstancesByServer(Number(selectedServerId))
        ]);
        // Solo credenciales SSH para descubrimiento de archivos (tipo 1 suele ser SSH)
        setCredentials(credsData.filter(c => c.tipo.id_tipo_acceso === 1));
        setPaths(pathsData);
        setInstances(instancesData);
      } catch (err) {
        showNotification('Error al cargar detalles del servidor', 'error');
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
    setSelectedCredId('');
    setSelectedPathId('');
    setSelectedInstanceId('');
  }, [selectedServerId, showNotification]);

  const handleStartDiscovery = async () => {
    if (mode === 'global') {
      setDiscovering(true);
      setGlobalResult(null);
      try {
        const res = await discoverAllBackups();
        setGlobalResult(res);
        showNotification('Escaneo global de respaldos completado', 'success');
      } catch (err: any) {
        console.error(err);
      } finally {
        setDiscovering(false);
      }
      return;
    }

    if (mode === 'server') {
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
      } finally {
        setDiscovering(false);
      }
    } else if (mode === 'instance') {
      if (!selectedInstanceId || !selectedCredId || !selectedPathId) return;

      setDiscovering(true);
      setResult(null);
      try {
        const res = await discoverInstanceBackups(
          Number(selectedInstanceId), 
          Number(selectedCredId), 
          Number(selectedPathId)
        );
        setResult(res);
        showNotification('Escaneo de archivos por instancia completado', 'success');
      } catch (err: any) {
        console.error(err);
      } finally {
        setDiscovering(false);
      }
    }
  };

  const isExecuteDisabled = 
    mode === 'global' ? discovering :
    mode === 'server' ? (!selectedServerId || !selectedCredId || !selectedPathId || discovering) :
    (!selectedInstanceId || !selectedCredId || !selectedPathId || discovering);

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

      {/* Selector de Modo de Escaneo */}
      <Box sx={{ mb: 4 }}>
        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={(_, newMode) => newMode && setMode(newMode)}
          disabled={discovering}
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              py: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 3,
              borderColor: 'divider',
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'action.selected'
                }
              }
            }
          }}
        >
          <ToggleButton value="server">
            <LanIcon sx={{ mr: 1, fontSize: 20 }} /> Escaneo por Servidor (General)
          </ToggleButton>
          <ToggleButton value="instance">
            <StorageIcon sx={{ mr: 1, fontSize: 20 }} /> Escaneo por Instancia DBMS (Específico)
          </ToggleButton>
          <ToggleButton value="global">
            <PlaylistAddCheckIcon sx={{ mr: 1, fontSize: 20 }} /> Sincronización Global (Masiva)
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Panel de Selección */}
      {mode === 'global' ? (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, mb: 4, bgcolor: 'background.paper', textAlign: 'center' }}>
          <PlaylistAddCheckIcon color="primary" sx={{ fontSize: 56, mb: 1.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Sincronización y Descubrimiento Global de Respaldos</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            Escanea simultáneamente todas las rutas de almacenamiento físico declaradas en la base de datos, resolviendo automáticamente las credenciales SSH activas para registrar respaldos de forma masiva.
          </Typography>
          <Button
            variant="contained"
            size="large"
            disabled={discovering}
            startIcon={discovering ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={handleStartDiscovery}
            sx={{ px: 5, py: 1.5, borderRadius: 2.5, fontWeight: 700 }}
          >
            {discovering ? 'Escaneando Infraestructura...' : 'Iniciar Sincronización Global'}
          </Button>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: 'background.paper' }}>
          <Grid container spacing={3} sx={{ alignItems: 'flex-end' }}>
            <Grid size={{ xs: 12, md: mode === 'instance' ? 2.5 : 3 }}>
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
                      <DnsIcon sx={{ fontSize: 16, mr: 1 }} /> 
                      <span style={{ fontFamily: 'monospace' }}>{s.direccion_ip}</span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {mode === 'instance' && (
              <Grid size={{ xs: 12, md: 2.5 }}>
                <FormControl fullWidth size="small" disabled={!selectedServerId || loadingDetails || discovering}>
                  <InputLabel>Instancia DBMS</InputLabel>
                  <Select
                    value={selectedInstanceId}
                    label="Instancia DBMS"
                    onChange={(e) => setSelectedInstanceId(e.target.value as number)}
                  >
                    {instances.length === 0 ? (
                      <MenuItem disabled>Sin instancias registradas</MenuItem>
                    ) : (
                      instances.map((inst) => (
                        <MenuItem key={inst.id_instancia} value={inst.id_instancia}>
                          <StorageIcon sx={{ fontSize: 16, mr: 1 }} /> {inst.nombre_instancia} (Puerto: {inst.puerto})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: mode === 'instance' ? 2.5 : 3 }}>
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

            <Grid size={{ xs: 12, md: mode === 'instance' ? 2.5 : 3 }}>
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

            <Grid size={{ xs: 12, md: mode === 'instance' ? 2 : 3 }}>
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
      )}

      {/* Resultados de Escaneo Individual / Por Instancia */}
      {result && (
        <Box sx={{ animation: 'slideUp 0.4s ease-out' }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ARCHIVOS FÍSICOS</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{result.archivos_fisicos_conteo}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>PESO TOTAL</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{result.total_peso_mb.toFixed(2)} MB</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
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
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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

      {/* Resultados de Sincronización Global */}
      {globalResult && (
        <Box sx={{ animation: 'slideUp 0.4s ease-out' }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Rutas Procesadas</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}>{globalResult.total_rutas_procesadas}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Respaldos Registrados</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main', mt: 1 }}>{globalResult.total_respaldos_registrados}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Servidores Escaneados</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>{globalResult.servidores_escaneados.length}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Listado de Servidores Escaneados */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DnsOutlinedIcon color="primary" /> Servidores Escaneados en el Ciclo
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {globalResult.servidores_escaneados.length > 0 ? (
                globalResult.servidores_escaneados.map((ip, idx) => (
                  <Chip key={idx} label={ip} variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">Ningún servidor fue escaneado.</Typography>
              )}
            </Box>
          </Paper>

          {/* Reporte de Errores e Incidencias */}
          {globalResult.errores.length > 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 3, borderColor: 'error.main', bgcolor: 'error.lighter' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <ErrorOutlinedIcon color="error" />
                  <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 800 }}>
                    Reporte de Incidencias ({globalResult.errores.length})
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  {globalResult.errores.map((err, idx) => (
                    <ListItem key={idx} disableGutters sx={{ py: 1.5, borderBottom: idx < globalResult.errores.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            Servidor: {err.servidor} {err.instancia ? `| Instancia: ${err.instancia}` : ''}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                              Ruta: {err.ruta}
                            </Typography>
                            <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                              Detalle: {err.error}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="success" icon={<PlaylistAddCheckIcon />} sx={{ borderRadius: 3, fontWeight: 700 }}>
              Sincronización global completada con éxito. Todos los servidores y rutas fueron procesados sin incidencias.
            </Alert>
          )}
        </Box>
      )}

      {!result && !globalResult && !discovering && (
        <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
          <TravelExploreIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6">
            {mode === 'global' 
              ? 'Presione el botón para sincronizar todos los respaldos físicos' 
              : 'Seleccione los parámetros para explorar la infraestructura'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
