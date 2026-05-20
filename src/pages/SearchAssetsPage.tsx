import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Stack, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, CircularProgress,
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
import { getAssets, discoverAllInventory } from '../api/infrastructureService';
import { type Asset, type GlobalDiscoveryResponse } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
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
  const [globalResult, setGlobalResult] = useState<GlobalDiscoveryResponse | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  const menuOpen = Boolean(anchorEl);
  const { showNotification } = useNotificationStore();

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
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncByServer = () => {
    handleMenuClose();
    setWizardOpen(true);
  };

  const fetchAllAssets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      showNotification('Error al cargar la lista de activos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAllAssets();
  }, [fetchAllAssets]);

  const handleRefresh = () => {
    fetchAllAssets();
  };

  // Generar lista de motores únicos para los filtros
  const uniqueMotors = useMemo(() => {
    const motors = new Set(assets.map(a => a.motor));
    return Array.from(motors);
  }, [assets]);

  const filteredData = useMemo(() => {
    // Aplanamos la estructura para que cada base de datos sea una fila
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
      
      const matchesDbms = 
        dbmsFilter === 'all' || item.motor === dbmsFilter;
      
      return matchesSearch && matchesDbms;
    });
  }, [assets, searchTerm, dbmsFilter]);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO --- */}
      <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Inventario de Activos
          </Typography>
          <Typography variant="body1" color="text.secondary">
          Búsqueda global y control centralizado de bases de datos y servidores.
          </Typography>
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
          ...uniqueMotors.map(motor => ({ label: motor, value: motor }))
        ]}
        activeFilter={dbmsFilter}
        onFilterChange={setDbmsFilter}
        statsLabel={`${filteredData.length} activos encontrados`}
      />

      {/* --- 4. LISTAS (Tabla) --- */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 400 }}>
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 20 }}>
                <CircularProgress />
            </Box>
        ) : (
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Base de Datos</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Servidor / IP</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Instancia / Motor</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Criticidad</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Estado</TableCell>
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
                  <TableCell>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <StorageIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.base_datos}</Typography>
                        {row.tamano_mb !== null && (
                          <Typography variant="caption" color="text.secondary">
                            {row.tamano_mb?.toFixed(2)} MB
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.servidor}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {row.ip}
                    </Typography>
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
                      label={row.estado_bd} 
                      size="small" 
                      color={row.estado_bd.toLowerCase() === 'activo' || row.estado_bd.toLowerCase() === 'online' ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                    />
                  </TableCell>
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
