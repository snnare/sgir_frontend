import { useState, useMemo } from 'react';
import { 
  Box, Typography, Stack, Paper, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import StorageIcon from '@mui/icons-material/Storage';

// Datos de muestra según los headers solicitados
const SAMPLE_DATA = [
  { 
    id_base_datos: 1, 
    nombre_base: "db_ventas_prod", 
    ip_servidor: "192.168.10.50", 
    nombre_servidor: "SRV-ORACLE-01", 
    tipo_dbms: "Oracle Database", 
    version_dbms: "19c", 
    estado_bd: "Activo" 
  },
  { 
    id_base_datos: 2, 
    nombre_base: "app_catalog_test", 
    ip_servidor: "10.0.0.15", 
    nombre_servidor: "SRV-MYSQL-TEST", 
    tipo_dbms: "MySQL", 
    version_dbms: "8.0", 
    estado_bd: "Activo" 
  },
  { 
    id_base_datos: 3, 
    nombre_base: "reporting_dw", 
    ip_servidor: "172.16.5.20", 
    nombre_servidor: "SRV-POSTGRES-DW", 
    tipo_dbms: "PostgreSQL", 
    version_dbms: "15.2", 
    estado_bd: "Inactivo" 
  },
  { 
    id_base_datos: 4, 
    nombre_base: "auth_service_db", 
    ip_servidor: "192.168.10.51", 
    nombre_servidor: "SRV-MONGO-AUTH", 
    tipo_dbms: "MongoDB", 
    version_dbms: "6.0", 
    estado_bd: "Activo" 
  },
];

export const SearchAssetsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dbmsFilter, setDbmsFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulación de carga de datos
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    return SAMPLE_DATA.filter(item => {
      const matchesSearch = 
        item.nombre_base.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ip_servidor.includes(searchTerm) ||
        item.tipo_dbms.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDbms = 
        dbmsFilter === 'all' || 
        (dbmsFilter === 'MySQL' && item.tipo_dbms === 'MySQL') ||
        (dbmsFilter === 'Oracle' && item.tipo_dbms === 'Oracle Database') ||
        (dbmsFilter === 'MongoDB' && item.tipo_dbms === 'MongoDB');
      
      return matchesSearch && matchesDbms;
    });
  }, [searchTerm, dbmsFilter]);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Buscar Activos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Localiza instancias de bases de datos y servicios en toda la infraestructura.
        </Typography>
      </Box>

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
            placeholder="Buscar por nombre de base, IP o motor..."
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
        </Stack>

        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <FilterListIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Chip 
            label="Todos" 
            onClick={() => setDbmsFilter('all')}
            color={dbmsFilter === 'all' ? 'primary' : 'default'}
            variant={dbmsFilter === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Chip 
            label="MySQL" 
            onClick={() => setDbmsFilter('MySQL')}
            color={dbmsFilter === 'MySQL' ? 'primary' : 'default'}
            variant={dbmsFilter === 'MySQL' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Chip 
            label="Oracle" 
            onClick={() => setDbmsFilter('Oracle')}
            color={dbmsFilter === 'Oracle' ? 'primary' : 'default'}
            variant={dbmsFilter === 'Oracle' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Chip 
            label="MongoDB" 
            onClick={() => setDbmsFilter('MongoDB')}
            color={dbmsFilter === 'MongoDB' ? 'primary' : 'default'}
            variant={dbmsFilter === 'MongoDB' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {filteredData.length} activos encontrados
          </Typography>
        </Stack>
      </Paper>

      {/* --- 4. LISTAS (Tabla) --- */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Nombre de Base</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>IP Servidor</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Motor DBMS</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Versión</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Estado</TableCell>
              <TableCell align="center" sx={{ width: 50 }}>
                <Tooltip title="Actualizar Tabla">
                  <IconButton onClick={handleRefresh} size="small" disabled={loading}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow key={row.id_base_datos} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <StorageIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.nombre_base}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {row.ip_servidor}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.tipo_dbms}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{row.version_dbms}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={row.estado_bd} 
                      size="small" 
                      color={row.estado_bd === 'Activo' ? 'success' : 'default'}
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
      </TableContainer>
    </Box>
  );
};
