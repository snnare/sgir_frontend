import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Stack, Paper, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, Divider, CircularProgress,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import StorageIcon from '@mui/icons-material/Storage';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { getAssets } from '../api/infrastructureService';
import { type Asset } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
import { DiscoveryWizard } from '../components/DiscoveryWizard';

export const SearchAssetsPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbmsFilter, setDbmsFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const { showNotification } = useNotificationStore();

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
    return assets.filter(item => {
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
        onSuccess={handleRefresh} 
      />

      {/* --- 2. GENERAL (Buscador y Filtros) --- */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 4, 
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por base, IP, motor o servidor..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: 'action.hover', border: 'none', '& fieldset': { border: 'none' } }
              }
            }}
          />
          <Button 
              variant="contained" 
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setWizardOpen(true)}
              sx={{ 
                  borderRadius: 2, 
                  px: 4, 
                  height: 40,
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
          >
              Sincronizar
          </Button>
        </Stack>

        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <FilterListIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Chip 
            label="Todos" 
            onClick={() => setDbmsFilter('all')}
            color={dbmsFilter === 'all' ? 'primary' : 'default'}
            variant={dbmsFilter === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          {uniqueMotors.map(motor => (
            <Chip 
              key={motor}
              label={motor} 
              onClick={() => setDbmsFilter(motor)}
              color={dbmsFilter === motor ? 'primary' : 'default'}
              variant={dbmsFilter === motor ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, borderRadius: 1.5 }}
            />
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {filteredData.length} activos encontrados
          </Typography>
        </Stack>
      </Paper>

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
                <TableRow key={row.id_asset} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <StorageIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.base_datos}</Typography>
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
                      label={row.estado} 
                      size="small" 
                      color={row.estado === 'Activo' ? 'success' : 'default'}
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
