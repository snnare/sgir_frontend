import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Stack, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, CircularProgress, Skeleton,
  Button, Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import DnsIcon from '@mui/icons-material/Dns';
import InfoIcon from '@mui/icons-material/Info';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '../api/client';
import { getAssets } from '../api/infrastructureService';
import { discoverAllBackups } from '../api/monitoringService';
import { type Asset, type GlobalBackupDiscoveryResponse, type BackupDiscoveryResponse, type ServerBackupDiscoveryResponse } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
import { useAlertStore } from '../store/useAlertStore';
import { BackupDiscoveryWizard } from '../components/BackupDiscoveryWizard';
import { FilterBar } from '../components/FilterBar';

export const BackupDiscoveryPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbmsFilter, setDbmsFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  
  // Menú Sincronizar
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  // Resultados global
  const [globalResult, setGlobalResult] = useState<GlobalBackupDiscoveryResponse | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  // Estados para soportar vista detallada vs comprimida y fecha de actualización
  const [viewMode, setViewMode] = useState<'detailed' | 'compressed'>('detailed');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Unidad de visualización de tamaño
  const [sizeUnit, setSizeUnit] = useState<'auto' | 'mb' | 'gb'>('auto');

  // Formateador de tamaño reactivo
  const formatSize = useCallback((sizeInMb: number | null | undefined) => {
    if (sizeInMb === null || sizeInMb === undefined) return '-';
    if (sizeUnit === 'mb') {
      return `${sizeInMb.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MB`;
    }
    if (sizeUnit === 'gb') {
      return `${(sizeInMb / 1024).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GB`;
    }
    // Mode 'auto'
    if (sizeInMb >= 1024) {
      return `${(sizeInMb / 1024).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GB`;
    }
    return `${sizeInMb.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MB`;
  }, [sizeUnit]);

  // Estados para el menú de descargas de Reporte
  const [reportAnchorEl, setReportAnchorEl] = useState<null | HTMLElement>(null);
  const reportMenuOpen = Boolean(reportAnchorEl);

  const handleReportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setReportAnchorEl(event.currentTarget);
  };

  const handleReportClose = () => {
    setReportAnchorEl(null);
  };

  const { showNotification } = useNotificationStore();
  const { showAlert } = useAlertStore();

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSyncAll = async () => {
    handleMenuClose();
    setSyncingAll(true);
    showNotification('Iniciando sincronización global de respaldos...', 'info');
    try {
      const res = await discoverAllBackups();
      setGlobalResult(res);
      setResultDialogOpen(true);
      showNotification('Sincronización global de respaldos completada', 'success');
      fetchAllAssets();
    } catch (error) {
      console.error('Error in global sync:', error);
      showAlert({
        title: 'Error de Sincronización',
        description: 'No se pudo completar la sincronización global de respaldos físico. Verifique el estado del servidor e intente de nuevo.',
        severity: 'error'
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncByServer = () => {
    handleMenuClose();
    setWizardOpen(true);
  };

  // Estos endpoints de descargas se adaptarán en la siguiente etapa, se mantienen consistentes visualmente
  const handleDownloadPDF = async () => {
    handleReportClose();
    showNotification('Generando reporte PDF de respaldos...', 'info');
    try {
      const response = await api.get('/assets/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_respaldos_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('Reporte PDF descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showAlert({
        title: 'Error de Descarga',
        description: 'No se pudo descargar el reporte PDF de respaldos. Intente más tarde.',
        severity: 'error'
      });
    }
  };

  const handleDownloadPDFOffline = async () => {
    handleReportClose();
    showNotification('Generando reporte PDF Offline de respaldos...', 'info');
    try {
      const response = await api.get('/assets/pdf-offline', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_respaldos_offline.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('Reporte PDF Offline descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error downloading PDF Offline:', error);
      showAlert({
        title: 'Error de Descarga',
        description: 'No se pudo descargar el reporte PDF Offline de respaldos.',
        severity: 'error'
      });
    }
  };

  const handleDownloadCSV = async () => {
    handleReportClose();
    showNotification('Generando reporte CSV de respaldos...', 'info');
    try {
      const response = await api.get('/assets/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_respaldos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('Reporte CSV descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      showAlert({
        title: 'Error de Descarga',
        description: 'No se pudo descargar el reporte CSV (Excel) de respaldos.',
        severity: 'error'
      });
    }
  };

  const fetchAllAssets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error fetching assets:', error);
      showAlert({
        title: 'Error de Conexión',
        description: 'No se pudieron recuperar los archivos de respaldo desde la infraestructura. Verifique su conexión.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification, showAlert]);

  useEffect(() => {
    fetchAllAssets();
  }, [fetchAllAssets]);

  const handleRefresh = () => {
    fetchAllAssets();
  };

  // Callback del Wizard al completar con éxito un escaneo individual
  const handleWizardSuccess = (
    _resultData: BackupDiscoveryResponse | ServerBackupDiscoveryResponse | null, 
    _mode: 'server' | 'instance'
  ) => {
    showNotification('Escaneo individual de respaldos completado', 'success');
    fetchAllAssets();
  };

  const filteredData = useMemo(() => {
    if (viewMode === 'detailed') {
      const flattened = assets.flatMap(item => 
        item.bases_de_datos.map(db => ({
          ...item,
          base_datos: db.nombre,
          estado_bd: db.estado,
          tamano_mb: db.tamano_mb,
          id_composite: `${item.ip}-${item.instancia}-${db.nombre}`
        }))
      );

      return flattened.filter(item => {
        const searchStr = searchTerm.toLowerCase();
        const matchesSearch = 
          (item.base_datos?.toLowerCase() || '').includes(searchStr) ||
          item.ip.includes(searchStr) ||
          item.motor.toLowerCase().includes(searchStr) ||
          item.servidor.toLowerCase().includes(searchStr) ||
          item.instancia.toLowerCase().includes(searchStr);
        
        const matchesDbms = (() => {
          if (dbmsFilter === 'all') return true;
          const motorLower = item.motor.toLowerCase();
          if (dbmsFilter === 'mysql5') return motorLower.includes('mysql 5') || motorLower.includes('mysql5');
          if (dbmsFilter === 'mysql8') return motorLower.includes('mysql 8') || motorLower.includes('mysql8');
          if (dbmsFilter === 'mongo') return motorLower.includes('mongo');
          if (dbmsFilter === 'oracle') return motorLower.includes('oracle');
          return motorLower.includes(dbmsFilter.toLowerCase());
        })();
        
        return matchesSearch && matchesDbms;
      });
    } else {
      return assets
        .map(item => {
          const totalSize = item.bases_de_datos.reduce((sum, db) => sum + (db.tamano_mb || 0), 0);
          return {
            ...item,
            total_db: item.bases_de_datos.length,
            peso_total_mb: totalSize,
            id_composite: `${item.ip}-${item.instancia}`
          };
        })
        .filter(item => {
          const searchStr = searchTerm.toLowerCase();
          const matchesSearch = 
            item.ip.includes(searchStr) ||
            item.motor.toLowerCase().includes(searchStr) ||
            item.servidor.toLowerCase().includes(searchStr) ||
            item.instancia.toLowerCase().includes(searchStr) ||
            item.bases_de_datos.some(db => db.nombre.toLowerCase().includes(searchStr));
          
          const matchesDbms = (() => {
            if (dbmsFilter === 'all') return true;
            const motorLower = item.motor.toLowerCase();
            if (dbmsFilter === 'mysql5') return motorLower.includes('mysql 5') || motorLower.includes('mysql5');
            if (dbmsFilter === 'mysql8') return motorLower.includes('mysql 8') || motorLower.includes('mysql8');
            if (dbmsFilter === 'mongo') return motorLower.includes('mongo');
            if (dbmsFilter === 'oracle') return motorLower.includes('oracle');
            return motorLower.includes(dbmsFilter.toLowerCase());
          })();
          
          return matchesSearch && matchesDbms;
        });
    }
  }, [assets, searchTerm, dbmsFilter, viewMode]);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO --- */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
              Explorador de Respaldos
              </Typography>
              <Typography variant="body1" color="text.secondary">
              Búsqueda global y control centralizado de archivos de respaldo físico en la infraestructura.
              </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} sx={{ bgcolor: 'background.paper', p: 0.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Tooltip title="Vista Detallada (Archivos)">
              <IconButton 
                onClick={() => setViewMode('detailed')}
                color={viewMode === 'detailed' ? 'primary' : 'default'}
                sx={{ 
                  borderRadius: 2, 
                  bgcolor: viewMode === 'detailed' ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista Comprimida (Servidores)">
              <IconButton 
                onClick={() => setViewMode('compressed')}
                color={viewMode === 'compressed' ? 'primary' : 'default'}
                sx={{ 
                  borderRadius: 2, 
                  bgcolor: viewMode === 'compressed' ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ViewCompactIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
      </Box>

      {/* Wizard de Escaneo Individual */}
      <BackupDiscoveryWizard 
        open={wizardOpen} 
        onClose={() => setWizardOpen(false)} 
        onSuccess={handleWizardSuccess} 
      />

      {/* --- DIALOGO DE RESULTADOS GLOBAL --- */}
      <Dialog 
        open={resultDialogOpen} 
        onClose={() => setResultDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoAwesomeIcon color="primary" /> Resultado de Sincronización Global de Respaldos
        </DialogTitle>
        <DialogContent dividers>
          {globalResult && (
            <Box>
              {/* Resumen de KPIs */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Rutas Procesadas</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{globalResult.total_rutas_procesadas}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Respaldos Registrados</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{globalResult.total_respaldos_registrados}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'info.main' }}>
                    <Typography variant="caption" color="info.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Servidores Escaneados</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{globalResult.servidores_escaneados.length}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Servidores Procesados */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DnsIcon fontSize="small" color="action" /> Servidores Procesados
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {globalResult.servidores_escaneados.map((ip, idx) => (
                  <Chip key={idx} label={ip} variant="outlined" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }} />
                ))}
              </Box>

              {/* Errores */}
              {globalResult.errores.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon fontSize="small" color="error" /> Incidencias Detectadas ({globalResult.errores.length})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Servidor</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Ruta</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Error Técnico</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {globalResult.errores.map((err, idx) => (
                          <TableRow key={idx}>
                            <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{err.servidor} {err.instancia ? `(${err.instancia})` : ''}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{err.ruta}</TableCell>
                            <TableCell sx={{ color: 'error.main', fontSize: '0.75rem' }}>{err.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="contained" fullWidth onClick={() => setResultDialogOpen(false)} sx={{ fontWeight: 700, borderRadius: 2 }}>
            Cerrar Resumen
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- 2. GENERAL (Buscador y Filtros) --- */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por archivo, IP, motor o servidor..."
        rightActions={
          <>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleReportClick}
              sx={{
                borderRadius: 2,
                px: 3,
                height: 40,
                whiteSpace: 'nowrap',
                fontWeight: 700
              }}
            >
              Reporte
            </Button>
            <Menu
              anchorEl={reportAnchorEl}
              open={reportMenuOpen}
              onClose={handleReportClose}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 2,
                    mt: 1,
                    minWidth: 180,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }
              }}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleDownloadPDF}>
                <ListItemIcon>
                  <PictureAsPdfIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="PDF Online" secondary="Sincronización en vivo" />
              </MenuItem>
              <MenuItem onClick={handleDownloadPDFOffline}>
                <ListItemIcon>
                  <PictureAsPdfIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText primary="PDF (Offline)" secondary="Sin conexiones remotas" />
              </MenuItem>
              <MenuItem onClick={handleDownloadCSV}>
                <ListItemIcon>
                  <StorageIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Crudo (CSV)" secondary="Excel" />
              </MenuItem>
            </Menu>
            <Button 
              variant="contained" 
              startIcon={syncingAll ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleMenuClick}
              disabled={syncingAll}
              sx={{ 
                  borderRadius: 2, 
                  px: 3, 
                  height: 40,
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {syncingAll ? 'Escaneando...' : 'Escaneo / Sinc'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 2,
                    mt: 1,
                    minWidth: 180,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleSyncAll}>
                <ListItemIcon>
                  <AllInclusiveIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Todos" secondary="Sincronización global" />
              </MenuItem>
              <MenuItem onClick={handleSyncByServer}>
                <ListItemIcon>
                  <DnsIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Por servidor" secondary="Wizard de escaneo" />
              </MenuItem>
            </Menu>
          </>
        }
        filters={[
          { label: 'Todos', value: 'all' },
          { label: 'MySQL 5', value: 'mysql5' },
          { label: 'MySQL 8', value: 'mysql8' },
          { label: 'Mongo', value: 'mongo' },
          { label: 'Oracle', value: 'oracle' }
        ]}
        activeFilter={dbmsFilter}
        onFilterChange={setDbmsFilter}
        bottomActions={
          <Stack direction="row" spacing={0.5} sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Tooltip title="Unidad Automática (MB/GB)">
              <Button 
                size="small"
                onClick={() => setSizeUnit('auto')}
                variant={sizeUnit === 'auto' ? 'contained' : 'text'}
                color={sizeUnit === 'auto' ? 'primary' : 'inherit'}
                sx={{ minWidth: 40, height: 24, borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: '0.65rem', px: 1 }}
              >
                Auto
              </Button>
            </Tooltip>
            <Tooltip title="Forzar Megabytes (MB)">
              <Button 
                size="small"
                onClick={() => setSizeUnit('mb')}
                variant={sizeUnit === 'mb' ? 'contained' : 'text'}
                color={sizeUnit === 'mb' ? 'primary' : 'inherit'}
                sx={{ minWidth: 40, height: 24, borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: '0.65rem', px: 1 }}
              >
                MB
              </Button>
            </Tooltip>
            <Tooltip title="Forzar Gigabytes (GB)">
              <Button 
                size="small"
                onClick={() => setSizeUnit('gb')}
                variant={sizeUnit === 'gb' ? 'contained' : 'text'}
                color={sizeUnit === 'gb' ? 'primary' : 'inherit'}
                sx={{ minWidth: 40, height: 24, borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: '0.65rem', px: 1 }}
              >
                GB
              </Button>
            </Tooltip>
          </Stack>
        }
        statsLabel={`${filteredData.length} archivos de respaldo encontrados`}
      />

      {/* --- 4. LISTAS (Tabla) --- */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 400 }}>
        {loading ? (
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                {viewMode === 'detailed' ? (
                  <>
                    <TableCell sx={{ fontWeight: 800 }}>Servidor / IP</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Archivo de Respaldo</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Instancia / Motor</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>Frecuencia</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>Estado</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={{ fontWeight: 800 }}>Servidor / IP</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Tipo de RDBMS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>Total Respaldos</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>Peso Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>Fecha Actualización</TableCell>
                  </>
                )}
                <TableCell align="right" sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {viewMode === 'detailed' ? (
                    <>
                      <TableCell><Skeleton width="50%" height={24} /></TableCell>
                      <TableCell><Skeleton width="60%" height={24} /></TableCell>
                      <TableCell><Skeleton width="70%" height={24} /></TableCell>
                      <TableCell align="center"><Skeleton width={60} height={24} sx={{ mx: 'auto' }} /></TableCell>
                      <TableCell align="center"><Skeleton width={50} height={24} sx={{ mx: 'auto' }} /></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell><Skeleton width="60%" height={24} /></TableCell>
                      <TableCell><Skeleton width="40%" height={24} /></TableCell>
                      <TableCell align="center"><Skeleton width={40} height={24} sx={{ mx: 'auto' }} /></TableCell>
                      <TableCell align="right"><Skeleton width={80} height={24} sx={{ ml: 'auto' }} /></TableCell>
                      <TableCell align="center"><Skeleton width={120} height={24} sx={{ mx: 'auto' }} /></TableCell>
                    </>
                  )}
                  <TableCell align="right"><Skeleton width={28} height={28} variant="circular" sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              {viewMode === 'detailed' ? (
                <>
                  <TableCell sx={{ fontWeight: 800 }}>Servidor / IP</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Archivo de Respaldo</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Instancia / Motor</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Frecuencia</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Estado</TableCell>
                </>
              ) : (
                <>
                  <TableCell sx={{ fontWeight: 800 }}>Servidor / IP</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Tipo de RDBMS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Total Respaldos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Peso Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Fecha Actualización</TableCell>
                </>
              )}
              <TableCell align="right" sx={{ width: 50 }}>
                <Tooltip title="Actualizar Tabla">
                  <IconButton onClick={handleRefresh} size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow key={row.id_composite} hover>
                  {viewMode === 'detailed' ? (
                    <>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                          {row.ip}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {row.servidor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <StorageIcon fontSize="small" color="primary" />
                          <Box>
                            {/* Generamos un nombre representativo para el dump de la DB */}
                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                              backup_db_{(row as any).base_datos}_{row.instancia}.sql.gz
                            </Typography>
                            {(row as any).tamano_mb !== null && (
                              <Typography variant="caption" color="text.secondary">
                                {formatSize((row as any).tamano_mb)}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.instancia}</Typography>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                          {row.motor}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                            label={row.criticidad === 'Alta' ? 'Diario' : row.criticidad === 'Media' ? 'Semanal' : 'Mensual'}
                            size="small"
                            sx={{ 
                                fontWeight: 700, 
                                borderRadius: 1.5, 
                                fontSize: '0.6rem',
                                bgcolor: row.criticidad === 'Alta' ? 'error.lighter' : row.criticidad === 'Media' ? 'warning.lighter' : 'success.lighter',
                                color: row.criticidad === 'Alta' ? 'error.dark' : row.criticidad === 'Media' ? 'warning.dark' : 'success.dark',
                                border: '1px solid',
                                borderColor: 'currentColor'
                            }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label="Disponible" 
                          size="small" 
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                        />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <DnsIcon fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.servidor}</Typography>
                            <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'text.secondary' }}>
                              {row.ip}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.instancia}</Typography>
                        <Chip 
                          label={row.motor}
                          size="small"
                          sx={{ 
                            fontWeight: 800, 
                            borderRadius: 1.5, 
                            fontSize: '0.6rem',
                            bgcolor: row.motor.toLowerCase().includes('oracle') ? 'error.lighter' : row.motor.toLowerCase().includes('mongo') ? 'success.lighter' : 'primary.lighter',
                            color: row.motor.toLowerCase().includes('oracle') ? 'error.dark' : row.motor.toLowerCase().includes('mongo') ? 'success.dark' : 'primary.dark',
                            border: '1px solid',
                            borderColor: 'currentColor',
                            textTransform: 'uppercase',
                            mt: 0.5,
                            display: 'inline-flex'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${(row as any).total_db} archivos`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          {formatSize((row as any).peso_total_mb)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                          <CalendarTodayIcon sx={{ fontSize: '0.75rem', color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {lastSyncTime.toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Stack>
                      </TableCell>
                    </>
                  )}
                  <TableCell />
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron archivos de respaldo que coincidan con la búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </TableContainer>
    </Box>
  );
};
