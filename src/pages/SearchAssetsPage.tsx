import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Stack, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, CircularProgress, Skeleton,
  Button, Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  Alert
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
import { getAssets, discoverAllInventory } from '../api/infrastructureService';
import { type Asset, type GlobalDiscoveryResponse } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
import { useAlertStore } from '../store/useAlertStore';
import { DiscoveryWizard } from '../components/DiscoveryWizard';
import { FilterBar } from '../components/FilterBar';

export const SearchAssetsPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbmsFilter, setDbmsFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [globalResult, setGlobalResult] = useState<GlobalDiscoveryResponse | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  // Estados para soportar vista detallada vs comprimida y fecha de actualización
  const [viewMode, setViewMode] = useState<'detailed' | 'compressed'>('detailed');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

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
    showNotification('Iniciando sincronización global de activos...', 'info');
    try {
      const res = await discoverAllInventory();
      setGlobalResult(res);
      setResultDialogOpen(true);
      showNotification('Sincronización global completada', 'success');
      fetchAllAssets();
    } catch (error) {
      console.error('Error in global sync:', error);
      showAlert({
        title: 'Error de Sincronización',
        description: 'No se pudo completar la sincronización global de activos. Por favor verifique el estado del servidor e intente de nuevo.',
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

  const handleDownloadPDF = async () => {
    handleReportClose();
    showNotification('Generando reporte PDF (A4 UAEMex)...', 'info');
    try {
      const response = await api.get('/assets/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_activos_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('Reporte PDF descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showAlert({
        title: 'Error de Descarga',
        description: 'No se pudo descargar el reporte PDF. Por favor, intente más tarde.',
        severity: 'error'
      });
    }
  };

  const handleDownloadPDFOffline = async () => {
    handleReportClose();
    showNotification('Generando reporte PDF Offline...', 'info');
    try {
      const response = await api.get('/assets/pdf-offline', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_inventario_dbs_offline.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('Reporte PDF Offline descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error downloading PDF Offline:', error);
      showAlert({
        title: 'Error de Descarga',
        description: 'No se pudo descargar el reporte PDF Offline. Por favor, intente más tarde.',
        severity: 'error'
      });
    }
  };

  const handleDownloadCSV = async () => {
    handleReportClose();
    showNotification('Generando reporte CSV (Crudo Excel)...', 'info');
    try {
      const response = await api.get('/assets/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_activos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('Reporte CSV descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      showAlert({
        title: 'Error de Descarga',
        description: 'No se pudo descargar el reporte CSV (Excel). Por favor, intente más tarde.',
        severity: 'error'
      });
    }
  };

  const fetchAllAssets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
      setLastSyncTime(new Date()); // Captura de fecha y hora tras sincronización exitosa
    } catch (error) {
      console.error('Error fetching assets:', error);
      showAlert({
        title: 'Error de Conexión',
        description: 'No se pudieron recuperar los activos protegidos desde el inventario. Verifique su conexión de red.',
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


  const filteredData = useMemo(() => {
    if (viewMode === 'detailed') {
      // Vista detallada: cada base de datos es una fila
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
      // Vista comprimida: cada instancia es una fila
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
              Inventario de Activos
              </Typography>
              <Typography variant="body1" color="text.secondary">
              Búsqueda global y control centralizado de bases de datos y servidores.
              </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} sx={{ bgcolor: 'background.paper', p: 0.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Tooltip title="Vista Detallada (BDs)">
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
            <Tooltip title="Vista Comprimida (Instancias)">
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

      <DiscoveryWizard 
        open={wizardOpen} 
        onClose={() => setWizardOpen(false)} 
        onSuccess={fetchAllAssets} 
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
          <AutoAwesomeIcon color="primary" /> Resultado de Sincronización Global
        </DialogTitle>
        <DialogContent dividers>
          {globalResult && (
            <Box>
              {/* Resumen de KPIs */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Instancias</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{globalResult.total_instancias_encontradas}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Exitosas</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{globalResult.instancias_procesadas_exitosamente}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
                    <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Fallidas</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{globalResult.instancias_fallidas}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'info.main' }}>
                    <Typography variant="caption" color="info.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Tamaño Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{globalResult.total_db_size_mb.toFixed(1)} <Typography component="span" variant="caption">MB</Typography></Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon fontSize="small" color="action" /> Detalle por Instancia
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Instancia</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Estado</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Cambios (+ / ~ / -)</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Observaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {globalResult.detalles.map((det, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 600 }}>{det.instancia}</TableCell>
                        <TableCell align="center">
                          {det.status === 'success' ? (
                            <Chip label="OK" size="small" color="success" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
                          ) : (
                            <Chip label="ERROR" size="small" color="error" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {det.status === 'success' ? (
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                              <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>+{det.nuevas}</Typography>
                              <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>~{det.actualizadas}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>-{det.desactivadas}</Typography>
                            </Stack>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color={det.status === 'failed' ? 'error' : 'text.secondary'} sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={det.error || (det.status === 'success' ? 'Sincronizado correctamente' : '')}>
                              <span>{det.error || (det.status === 'success' ? 'Sincronizado' : 'Fallo desconocido')}</span>
                            </Tooltip>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {globalResult.omitidas_sin_credenciales > 0 && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  Se omitieron <strong>{globalResult.omitidas_sin_credenciales}</strong> instancias por falta de credenciales de acceso válidas.
                </Alert>
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
        searchPlaceholder="Buscar por base, IP, motor o servidor..."
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
              {syncingAll ? 'Sincronizando...' : 'Sincronizar'}
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
                <ListItemText primary="Por servidor" secondary="Wizard guiado" />
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
        statsLabel={`${filteredData.length} activos encontrados`}
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
                    <TableCell sx={{ fontWeight: 800 }}>Base de Datos</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Instancia / Motor</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>Criticidad</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>Estado</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={{ fontWeight: 800 }}>Servidor / IP</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Tipo de RDBMS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>Total de DB</TableCell>
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
                  <TableCell sx={{ fontWeight: 800 }}>Base de Datos</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Instancia / Motor</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Criticidad</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Estado</TableCell>
                </>
              ) : (
                <>
                  <TableCell sx={{ fontWeight: 800 }}>Servidor / IP</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Tipo de RDBMS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Total de DB</TableCell>
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
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{(row as any).base_datos}</Typography>
                            {(row as any).tamano_mb !== null && (
                              <Typography variant="caption" color="text.secondary">
                                {(row as any).tamano_mb?.toFixed(2)} MB
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
                            label={row.criticidad}
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
                          label={(row as any).estado_bd} 
                          size="small" 
                          color={(row as any).estado_bd?.toLowerCase() === 'activo' || (row as any).estado_bd?.toLowerCase() === 'online' ? 'success' : 'default'}
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
                          label={`${(row as any).total_db} DBs`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          {(row as any).peso_total_mb > 1024 
                            ? `${((row as any).peso_total_mb / 1024).toFixed(2)} GB`
                            : `${(row as any).peso_total_mb.toFixed(2)} MB`
                          }
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
                    No se encontraron activos que coincidan con la búsqueda.
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
