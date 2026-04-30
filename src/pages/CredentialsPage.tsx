import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  Stack, Button, CircularProgress, Tooltip, TextField, 
  InputAdornment, Divider 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';
import { getCredentials, deleteCredential } from '../api/infrastructureService';
import { type CredentialEnriched } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
import { MetricCard } from '../components/MetricCard';

export const CredentialsPage = () => {
  const [credentials, setCredentials] = useState<CredentialEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<number | 'all'>('all');
  
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const credsData = await getCredentials();
      setCredentials(credsData);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      showNotification('Error al cargar la lista de credenciales', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number, usuario: string) => {
    if (!window.confirm(`¿Está seguro de eliminar la credencial del usuario "${usuario}"?`)) {
      return;
    }

    try {
      await deleteCredential(id);
      showNotification('Credencial eliminada correctamente', 'success');
      setCredentials(prev => prev.filter(c => c.id_credencial !== id));
    } catch (error: any) {
      console.error('Error deleting credential:', error);
      showNotification(error.response?.data?.detail || 'Error al eliminar la credencial', 'error');
    }
  };

  const filteredCredentials = useMemo(() => {
    return credentials.filter(cred => {
      const matchesSearch = 
        cred.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cred.servidor_nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = 
        typeFilter === 'all' || 
        cred.tipo.id_tipo_acceso === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [credentials, searchTerm, typeFilter]);

  // Cálculos para métricas
  const sshCount = credentials.filter(c => c.tipo.id_tipo_acceso === 1).length;
  const dbCount = credentials.filter(c => c.tipo.id_tipo_acceso === 2).length;

  const getTipoAccesoColor = (tipoId: number) => {
    switch (tipoId) {
      case 1: return 'primary' as const;   // SSH
      case 2: return 'secondary' as const; // DB Native
      case 3: return 'info' as const;      // SFTP
      case 4: return 'warning' as const;   // API
      default: return 'default' as const;
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- SECCIÓN 1: ENCABEZADO --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Credenciales de Acceso
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión centralizada de llaves SSH, accesos a bases de datos y tokens de API.
        </Typography>
      </Box>

      {/* --- SECCIÓN 2: MÉTRICAS --- */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }, 
          gap: 3,
          mb: 6
        }}
      >
        <MetricCard 
          title="Total Credenciales" 
          value={credentials.length} 
          unit="Keys" 
          percent={100} 
          icon={<VpnKeyIcon fontSize="small" />} 
        />
        <MetricCard 
          title="Accesos SSH" 
          value={sshCount} 
          unit="Cuentas" 
          percent={credentials.length > 0 ? (sshCount / credentials.length) * 100 : 0} 
          icon={<TerminalIcon fontSize="small" />} 
        />
        <MetricCard 
          title="Accesos DB" 
          value={dbCount} 
          unit="Instancias" 
          percent={credentials.length > 0 ? (dbCount / credentials.length) * 100 : 0} 
          icon={<StorageIcon fontSize="small" />} 
        />
      </Box>

      {/* --- SECCIÓN 3: ÁREA DE BOTONES Y FILTROS --- */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 5, 
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        {/* Fila Superior: Búsqueda y Acciones */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Buscar por usuario o servidor..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
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
          
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Actualizar">
              <IconButton onClick={fetchData} disabled={loading} size="medium">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/credenciales/nueva')}
              sx={{ 
                bgcolor: 'text.primary', 
                color: 'background.paper',
                borderRadius: 2,
                px: 3,
                fontWeight: 700,
                '&:hover': { bgcolor: 'grey.800' }
              }}
            >
              Nueva Credencial
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Fila Inferior: Filtros de Tipo */}
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterListIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Chip 
            label={`Todas (${credentials.length})`} 
            onClick={() => setTypeFilter('all')}
            color={typeFilter === 'all' ? 'primary' : 'default'}
            variant={typeFilter === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Chip 
            label="SSH" 
            onClick={() => setTypeFilter(1)}
            color={typeFilter === 1 ? 'primary' : 'default'}
            variant={typeFilter === 1 ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Chip 
            label="Base de Datos" 
            onClick={() => setTypeFilter(2)}
            color={typeFilter === 2 ? 'primary' : 'default'}
            variant={typeFilter === 2 ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Chip 
            label="SFTP" 
            onClick={() => setTypeFilter(3)}
            color={typeFilter === 3 ? 'primary' : 'default'}
            variant={typeFilter === 3 ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          <Chip 
            label="API" 
            onClick={() => setTypeFilter(4)}
            color={typeFilter === 4 ? 'primary' : 'default'}
            variant={typeFilter === 4 ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Mostrando {filteredCredentials.length} de {credentials.length} registros
          </Typography>
        </Stack>
      </Paper>

      {/* --- SECCIÓN 4: LISTADO (TABLA) --- */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Usuario / Identificador</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Servidor Vinculado</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={32} thickness={5} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>Cargando datos...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredCredentials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <VpnKeyIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No se encontraron credenciales</Typography>
                  <Button sx={{ mt: 2 }} onClick={() => navigate('/credenciales/nueva')}>Registrar nueva</Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredCredentials.map((cred) => (
                <TableRow key={cred.id_credencial} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{cred.usuario}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cred.fecha_creacion ? new Date(cred.fecha_creacion).toLocaleDateString() : 'Sin fecha'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={cred.tipo.nombre_tipo} 
                      size="small" 
                      color={getTipoAccesoColor(cred.tipo.id_tipo_acceso)} 
                      sx={{ fontWeight: 700, borderRadius: 1 }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{cred.servidor_nombre}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={cred.estado.nombre_estado} 
                      size="small"
                      color={cred.estado.id_estado === 1 ? 'success' : 'default'}
                      variant={cred.estado.id_estado === 1 ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/credenciales/editar/${cred.id_credencial}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDelete(cred.id_credencial, cred.usuario)}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
