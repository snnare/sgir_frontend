import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Stack, Paper, Button, Grid, 
  FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Chip, Alert, ToggleButton, ToggleButtonGroup,
  Card, CardContent, List, ListItem, ListItemText, Divider,
  TextField, InputAdornment, IconButton, Skeleton, Tooltip
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
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TerminalIcon from '@mui/icons-material/Terminal';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckIcon from '@mui/icons-material/Check';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CodeIcon from '@mui/icons-material/Code';

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
  const navigate = useNavigate();
  
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

  // Estados de interacción cliente-side (Búsqueda y Ordenamiento)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'nombre' | 'tamano_mb' | 'fecha_modificacion'>('fecha_modificacion');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedFileIdx, setCopiedFileIdx] = useState<number | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

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
    setSearchQuery('');
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

  // 3. Simulación de Logs SRE de terminal interactiva durante el escaneo
  useEffect(() => {
    let timerId: any;
    if (discovering) {
      setConsoleLogs([]);
      
      const logs = [
        "Iniciando comunicación con el orquestador...",
        "Estableciendo sesión SSH segura con el servidor físico...",
        "Autenticando credenciales de acceso administrativo...",
        "Cargando directorios y buscando puntos de montaje...",
        "Escaneando archivos físicos (.sql, .dmp, .gz, .tar)...",
        "Validando sumas de verificación e integridad de metadatos...",
        "Procesando de forma atómica coincidencias encontradas...",
        "Sincronizando información con la base de datos central...",
        "Generando estructura final y reportes ejecutivos..."
      ];
      
      let currentIdx = 0;
      const addNextLog = () => {
        if (currentIdx < logs.length) {
          const time = new Date().toLocaleTimeString();
          setConsoleLogs(prev => [...prev, `[${time}] [SSH-AGENT] ${logs[currentIdx]}`]);
          currentIdx++;
          timerId = setTimeout(addNextLog, 250 + Math.random() * 200);
        }
      };
      addNextLog();
    } else {
      setConsoleLogs([]);
    }
    return () => clearTimeout(timerId);
  }, [discovering]);

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

  // Copiar nombre de archivo
  const handleCopyFileName = (fileName: string, idx: number) => {
    navigator.clipboard.writeText(fileName);
    setCopiedFileIdx(idx);
    showNotification('Copiado al portapapeles', 'info');
    setTimeout(() => setCopiedFileIdx(null), 2000);
  };

  // Solicitar ordenamiento por cabecera
  const handleRequestSort = (property: 'nombre' | 'tamano_mb' | 'fecha_modificacion') => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // Filtrado y ordenamiento en cliente de archivos encontrados
  const filteredAndSortedFiles = useMemo(() => {
    if (!result || !result.archivos) return [];

    let items = result.archivos.filter(file => 
      file.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    items.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (sortBy === 'tamano_mb') {
        return sortOrder === 'asc' 
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      } else {
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      }
    });

    return items;
  }, [result, searchQuery, sortBy, sortOrder]);

  // Helper para pintar un Chip dinámico de tipo de extensión
  const getFileExtensionChip = (fileName: string) => {
    const parts = fileName.split('.');
    if (parts.length <= 1) return null;
    const ext = parts.pop()?.toLowerCase();
    
    let color: "warning" | "secondary" | "success" | "info" | "default" = "default";
    let label = ext?.toUpperCase() || '';

    if (ext === 'sql') {
      color = 'warning';
      label = 'SQL Script';
    } else if (ext === 'dmp' || ext === 'dump') {
      color = 'secondary';
      label = 'Oracle Dump';
    } else if (ext === 'gz' || ext === 'tar' || ext === 'zip' || ext === 'tgz') {
      color = 'success';
      label = ext === 'gz' ? 'GZIP Archive' : label;
    } else if (ext === 'log' || ext === 'txt') {
      color = 'info';
    }

    return (
      <Chip 
        label={label} 
        size="small" 
        color={color} 
        variant="outlined" 
        sx={{ 
          fontSize: '0.65rem', 
          fontWeight: 700, 
          height: 18,
          borderRadius: 1
        }} 
      />
    );
  };

  const isExecuteDisabled = 
    mode === 'global' ? discovering :
    mode === 'server' ? (!selectedServerId || !selectedCredId || !selectedPathId || discovering) :
    (!selectedInstanceId || !selectedCredId || !selectedPathId || discovering);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 3 }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 3, 
          bgcolor: 'primary.light', 
          color: 'primary.main', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.15)'
        }}>
          <TravelExploreIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            Explorador General de Respaldos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Escaneo reactivo y profundo de dumps físicos en la infraestructura de servidores.
          </Typography>
        </Box>
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
            bgcolor: 'action.hover',
            p: 0.5,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiToggleButton-root': {
              py: 1.2,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 3,
              border: 'none',
              transition: 'all 0.2s ease-in-out',
              '&.Mui-selected': {
                bgcolor: 'background.paper',
                color: 'primary.main',
                boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  bgcolor: 'background.paper'
                }
              },
              '&:hover': {
                bgcolor: 'action.selected',
                transform: 'translateY(-1px)'
              }
            }
          }}
        >
          <ToggleButton value="server">
            <LanIcon sx={{ mr: 1, fontSize: 20 }} /> Escaneo por Servidor
          </ToggleButton>
          <ToggleButton value="instance">
            <StorageIcon sx={{ mr: 1, fontSize: 20 }} /> Escaneo por Instancia DBMS
          </ToggleButton>
          <ToggleButton value="global">
            <PlaylistAddCheckIcon sx={{ mr: 1, fontSize: 20 }} /> Sincronización Global
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Panel de Selección */}
      {mode === 'global' ? (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 5, 
            borderRadius: 4, 
            mb: 4, 
            bgcolor: 'background.paper', 
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.02)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {discovering && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #1976d2, #4caf50, #1976d2)',
              backgroundSize: '200% 100%',
              animation: 'movingGradient 2s linear infinite',
              '@keyframes movingGradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '100%': { backgroundPosition: '100% 50%' }
              }
            }} />
          )}

          <PlaylistAddCheckIcon color="primary" sx={{ fontSize: 64, mb: 2, filter: discovering ? 'drop-shadow(0 0 8px rgba(25,118,210,0.5))' : 'none' }} />
          <Typography variant="h5" sx={{ fontWeight: 850, mb: 1.5, letterSpacing: '-0.02em' }}>
            Sincronización y Descubrimiento Global
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 550, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
            Escanea simultáneamente todas las rutas de almacenamiento físico declaradas en la base de datos, resolviendo de forma segura las credenciales SSH activas para registrar y auditar respaldos de forma automatizada.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            disabled={discovering}
            startIcon={discovering ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={handleStartDiscovery}
            sx={{ 
              px: 6, 
              py: 1.8, 
              borderRadius: 3, 
              fontWeight: 800,
              boxShadow: discovering ? 'none' : '0 8px 24px rgba(25, 118, 210, 0.25)',
              transition: 'all 0.3s ease-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 30px rgba(25, 118, 210, 0.35)'
              }
            }}
          >
            {discovering ? 'Ejecutando Barrido de Red...' : 'Iniciar Sincronización Global'}
          </Button>
        </Paper>
      ) : (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            mb: 4, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.02)'
          }}
        >
          <Grid container spacing={3} sx={{ alignItems: 'flex-end' }}>
            
            {/* Servidor */}
            <Grid size={{ xs: 12, md: mode === 'instance' ? 2.5 : 3 }}>
              {loadingServers ? (
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Cargando servidores...</Typography>
                  <Skeleton variant="rounded" height={40} />
                </Stack>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Servidor</InputLabel>
                  <Select
                    value={selectedServerId}
                    label="Servidor"
                    onChange={(e) => setSelectedServerId(e.target.value as number)}
                    disabled={discovering}
                  >
                    {servers.map((s) => (
                      <MenuItem key={s.id_servidor} value={s.id_servidor}>
                        <DnsIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} /> 
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.direccion_ip}</span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>

            {/* Instancia (Solo Modo Instancia) */}
            {mode === 'instance' && (
              <Grid size={{ xs: 12, md: 2.5 }}>
                {loadingDetails ? (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">Cargando instancias...</Typography>
                    <Skeleton variant="rounded" height={40} />
                  </Stack>
                ) : (
                  <FormControl fullWidth size="small" disabled={!selectedServerId || discovering}>
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
                            <StorageIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /> 
                            <span>{inst.nombre_instancia}</span>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            )}

            {/* Credencial SSH */}
            <Grid size={{ xs: 12, md: mode === 'instance' ? 2.5 : 3 }}>
              {loadingDetails ? (
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Cargando llaves...</Typography>
                  <Skeleton variant="rounded" height={40} />
                </Stack>
              ) : (
                <FormControl fullWidth size="small" disabled={!selectedServerId || discovering}>
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
                          <KeyIcon sx={{ fontSize: 16, mr: 1, color: 'amber.main' }} /> {c.usuario}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
            </Grid>

            {/* Ruta de Respaldo */}
            <Grid size={{ xs: 12, md: mode === 'instance' ? 2.5 : 3 }}>
              {loadingDetails ? (
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Cargando rutas...</Typography>
                  <Skeleton variant="rounded" height={40} />
                </Stack>
              ) : (
                <FormControl fullWidth size="small" disabled={!selectedServerId || discovering}>
                  <InputLabel>Ruta de Respaldo</InputLabel>
                  <Select
                    value={selectedPathId}
                    label="Ruta de Respaldo"
                    onChange={(e) => {
                      const val = e.target.value as any;
                      if (val === 'add-new') {
                        navigate('/add-path', { state: { serverId: selectedServerId } });
                      } else {
                        setSelectedPathId(val as number);
                      }
                    }}
                  >
                    {paths.length === 0 ? (
                      <MenuItem disabled>Sin rutas configuradas</MenuItem>
                    ) : (
                      paths.map((p) => (
                        <MenuItem key={p.id_ruta} value={p.id_ruta}>
                          <FolderOpenIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /> {p.descripcion_ruta}
                        </MenuItem>
                      ))
                    )}
                    <Divider />
                    <MenuItem value="add-new" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      + Agregar ruta respaldo
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            </Grid>

            {/* Botón Escaneo */}
            <Grid size={{ xs: 12, md: mode === 'instance' ? 2 : 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={discovering ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleStartDiscovery}
                disabled={isExecuteDisabled}
                sx={{ 
                  height: 40, 
                  borderRadius: 2.5, 
                  fontWeight: 800,
                  transition: 'all 0.2s',
                  '&:not(:disabled):hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)'
                  }
                }}
              >
                {discovering ? 'Escaneando...' : 'Iniciar Escaneo'}
              </Button>
            </Grid>
          </Grid>

          {selectedServerId && credentials.length === 0 && !loadingDetails && (
            <Alert severity="warning" sx={{ mt: 3, borderRadius: 2.5, fontWeight: 600 }}>
              Este servidor no posee credenciales de acceso SSH (Puerto 22) habilitadas para la exploración física de archivos.
            </Alert>
          )}
        </Paper>
      )}

      {/* Terminal Interactivo de Consola SRE */}
      {discovering && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2.5, 
            mb: 4, 
            bgcolor: '#0a0d16', 
            borderColor: '#1e293b', 
            borderRadius: 3.5,
            boxShadow: 'inset 0 4px 18px rgba(0,0,0,0.85), 0 8px 30px rgba(0,0,0,0.2)'
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <TerminalIcon sx={{ color: '#10b981', fontSize: 20 }} />
            <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em' }}>
              SSH AGENT CONSOLE - LOGS DE ACTIVIDAD
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.8 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#eab308' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e' }} />
            </Box>
          </Stack>
          
          <Box sx={{ 
            fontFamily: '"JetBrains Mono", monospace', 
            fontSize: '0.8rem', 
            color: '#34d399', 
            minHeight: 140, 
            maxHeight: 220, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#1e293b', borderRadius: 3 }
          }}>
            {consoleLogs.map((log, index) => (
              <Box key={index} sx={{ py: 0.1, animation: 'fadeIn 0.2s ease-out' }}>
                {log}
              </Box>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#60a5fa', marginRight: 8 }}>$</span>
              <span>Ejecutando proceso de barrido reactivo...</span>
              <Box sx={{ 
                display: 'inline-block', 
                width: 8, 
                height: 15, 
                bgcolor: '#34d399', 
                ml: 1, 
                animation: 'blink 0.8s step-end infinite',
                '@keyframes blink': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0 }
                }
              }} />
            </Box>
          </Box>
          
          {/* Barra de progreso interactiva simulada */}
          <Box sx={{ width: '100%', mt: 2, bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden', height: 6 }}>
            <Box 
              sx={{ 
                width: `${Math.min(((consoleLogs.length + 1) / 10) * 100, 100)}%`, 
                height: '100%', 
                bgcolor: '#10b981', 
                boxShadow: '0 0 10px #10b981',
                transition: 'width 0.3s ease-out'
              }} 
            />
          </Box>
        </Paper>
      )}

      {/* Resultados de Escaneo Individual / Por Instancia */}
      {result && !discovering && (
        <Box sx={{ animation: 'slideUp 0.4s ease-out' }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.06)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: 'primary.light', color: 'primary.main', display: 'inline-flex' }}>
                    <CodeIcon fontSize="medium" />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ARCHIVOS FÍSICOS
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mt: 1 }}>{result.archivos_fisicos_conteo}</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.06)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: 'info.light', color: 'info.main', display: 'inline-flex' }}>
                    <StorageIcon fontSize="medium" />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PESO TOTAL
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mt: 1 }}>{result.total_peso_mb.toFixed(2)} MB</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'success.light',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.06)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: 'success.light', color: 'success.main', display: 'inline-flex' }}>
                    <AutoAwesomeIcon fontSize="medium" />
                  </Box>
                </Box>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  REGISTROS CREADOS
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, color: 'success.main' }}>{result.registros_respaldo_creados}</Typography>
              </Paper>
            </Grid>

          </Grid>

          {/* Barra de Filtro de Archivos Cliente-side */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 3, 
              borderRadius: 3.5, 
              bgcolor: 'background.paper', 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center', 
              flexWrap: 'wrap',
              boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.02)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <TextField
              placeholder="Filtrar archivos por nombre..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ flexGrow: 1, minWidth: 250 }}
            />
            
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                Ordenar por:
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={sortBy}
                exclusive
                onChange={(_, val) => val && setSortBy(val)}
                sx={{
                  bgcolor: 'action.hover',
                  p: 0.2,
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.4,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    border: 'none',
                    borderRadius: 1.5,
                    '&.Mui-selected': {
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }
                  }
                }}
              >
                <ToggleButton value="nombre">Nombre</ToggleButton>
                <ToggleButton value="tamano_mb">Tamaño</ToggleButton>
                <ToggleButton value="fecha_modificacion">Fecha</ToggleButton>
              </ToggleButtonGroup>

              <IconButton 
                size="small" 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                color="primary"
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 0.8 }}
              >
                {sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Paper>

          {/* Tabla de Archivos */}
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell 
                    onClick={() => handleRequestSort('nombre')} 
                    sx={{ fontWeight: 800, cursor: 'pointer', '&:hover': { color: 'primary.main' }, py: 1.8 }}
                  >
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <span>Nombre del Archivo</span>
                      {sortBy === 'nombre' && (sortOrder === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />)}
                    </Stack>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Extensión / Tipo</TableCell>
                  <TableCell 
                    align="center" 
                    onClick={() => handleRequestSort('tamano_mb')} 
                    sx={{ fontWeight: 800, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                  >
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                      <span>Tamaño</span>
                      {sortBy === 'tamano_mb' && (sortOrder === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />)}
                    </Stack>
                  </TableCell>
                  <TableCell 
                    align="right" 
                    onClick={() => handleRequestSort('fecha_modificacion')} 
                    sx={{ fontWeight: 800, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                  >
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                      <span>Última Modificación</span>
                      {sortBy === 'fecha_modificacion' && (sortOrder === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />)}
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, pr: 3 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedFiles.length > 0 ? (
                  filteredAndSortedFiles.map((file, idx) => (
                    <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <StorageIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ fontWeight: 650, fontFamily: '"JetBrains Mono", monospace' }}>
                            {file.nombre}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        {getFileExtensionChip(file.nombre) || (
                          <Chip label="UNKNOWN" size="small" variant="outlined" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={`${file.tamano_mb.toFixed(2)} MB`} size="small" variant="outlined" sx={{ fontWeight: 750, border: '1px solid', borderColor: 'divider' }} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: 'text.secondary' }}>
                          {file.fecha_modificacion}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <Tooltip title={copiedFileIdx === idx ? "¡Copiado!" : "Copiar Nombre"}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopyFileName(file.nombre, idx)}
                            color={copiedFileIdx === idx ? "success" : "default"}
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                          >
                            {copiedFileIdx === idx ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ opacity: 0.6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <HourglassBottomIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                        <Typography variant="h6" sx={{ fontWeight: 750 }}>
                          Sin archivos coincidentes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 350 }}>
                          No se encontraron archivos que coincidan con la búsqueda "{searchQuery}". Pruebe con otro término.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Resultados de Sincronización Global */}
      {globalResult && !discovering && (
        <Box sx={{ animation: 'slideUp 0.4s ease-out' }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 4, 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.06)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: 'primary.light', color: 'primary.main', display: 'inline-flex' }}>
                    <FolderOpenIcon fontSize="medium" />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rutas Procesadas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', mt: 1 }}>{globalResult.total_rutas_procesadas}</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 4, 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'success.light',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.06)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: 'success.light', color: 'success.main', display: 'inline-flex' }}>
                    <PlaylistAddCheckIcon fontSize="medium" />
                  </Box>
                </Box>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Respaldos Registrados
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'success.main', mt: 1 }}>{globalResult.total_respaldos_registrados}</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 4, 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.06)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: 'info.light', color: 'info.main', display: 'inline-flex' }}>
                    <DnsIcon fontSize="medium" />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Servidores Escaneados
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mt: 1 }}>{globalResult.servidores_escaneados.length}</Typography>
              </Paper>
            </Grid>

          </Grid>

          {/* Listado de Servidores Escaneados */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, mb: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DnsOutlinedIcon color="primary" /> Servidores Procesados en el Ciclo
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
              {globalResult.servidores_escaneados.length > 0 ? (
                globalResult.servidores_escaneados.map((ip, idx) => (
                  <Chip key={idx} label={ip} variant="outlined" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, border: '1px solid', borderColor: 'divider' }} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">Ningún servidor fue escaneado.</Typography>
              )}
            </Box>
          </Paper>

          {/* Reporte de Errores e Incidencias */}
          {globalResult.errores.length > 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 4, borderColor: 'error.main', bgcolor: 'error.lighter', boxShadow: '0 4px 12px rgba(211, 47, 47, 0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <ErrorOutlinedIcon color="error" />
                  <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 850, letterSpacing: '-0.01em' }}>
                    Reporte de Incidencias / Errores de Conexión ({globalResult.errores.length})
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  {globalResult.errores.map((err, idx) => (
                    <ListItem key={idx} disableGutters sx={{ py: 1.8, borderBottom: idx < globalResult.errores.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            Servidor: <span style={{ fontFamily: 'monospace' }}>{err.servidor}</span> {err.instancia ? `| Instancia: ${err.instancia}` : ''}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" component="div" sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'text.secondary', bgcolor: 'action.hover', p: 1, borderRadius: 1.5, mb: 1, border: '1px solid', borderColor: 'divider' }}>
                              Ruta física: {err.ruta}
                            </Typography>
                            <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                              Detalle técnico: {err.error}
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
            <Alert severity="success" icon={<PlaylistAddCheckIcon />} sx={{ borderRadius: 3.5, fontWeight: 700, py: 1.5 }}>
              Sincronización global completada con éxito. Todos los servidores y rutas fueron procesados sin incidencias de red.
            </Alert>
          )}
        </Box>
      )}

      {/* Vista de Bienvenida o Estado Inicial Vacío */}
      {!result && !globalResult && !discovering && (
        <Paper 
          variant="outlined" 
          sx={{ 
            py: 12, 
            textAlign: 'center', 
            borderRadius: 4, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
          }}
        >
          <TravelExploreIcon sx={{ fontSize: 72, color: 'primary.main', opacity: 0.25, mb: 2, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { transform: 'scale(1)', opacity: 0.25 }, '50%': { transform: 'scale(1.08)', opacity: 0.4 } } }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Listo para Explorar la Infraestructura
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', px: 2 }}>
            {mode === 'global' 
              ? 'Haga clic en el botón superior para realizar un barrido masivo de todas las rutas de almacenamiento físico registradas.' 
              : 'Seleccione un servidor, sus credenciales SSH y una ruta de destino para buscar dumps físicos e indexarlos en el sistema.'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
