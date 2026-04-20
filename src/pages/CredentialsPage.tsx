import { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  Stack, Button, CircularProgress, Tooltip 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate } from 'react-router-dom';
import { getCredentials } from '../api/infrastructureService';
import { type CredentialEnriched } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';

export const CredentialsPage = () => {
  const [credentials, setCredentials] = useState<CredentialEnriched[]>([]);
  const [loading, setLoading] = useState(true);
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
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Credenciales de Acceso
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de llaves SSH, accesos a bases de datos y tokens de API (Datos Enriquecidos).
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchData}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/credenciales/nueva')}
            sx={{ bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' } }}
          >
            Nueva Credencial
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
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
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>Cargando credenciales...</Typography>
                </TableCell>
              </TableRow>
            ) : credentials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <VpnKeyIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No hay credenciales registradas</Typography>
                  <Button sx={{ mt: 2 }} onClick={() => navigate('/credenciales/nueva')}>Registrar la primera</Button>
                </TableCell>
              </TableRow>
            ) : (
              credentials.map((cred) => (
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
                      variant="soft" 
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
                        <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error"><DeleteOutlinedIcon fontSize="small" /></IconButton>
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
