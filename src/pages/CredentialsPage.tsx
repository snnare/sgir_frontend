import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, 
  Stack, Button, Tooltip, Skeleton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { getCredentials, deleteCredential } from '../api/infrastructureService';
import { type CredentialEnriched } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
import { useConfirmStore } from '../store/useConfirmStore';
import { MetricCard } from '../components/MetricCard';
import { FilterBar } from '../components/FilterBar';
import { FloatingActionGroup } from '../components/FloatingActionGroup';

export const CredentialsPage = () => {
  const [credentials, setCredentials] = useState<CredentialEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<number | 'all'>('all');
  
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const { confirmAction } = useConfirmStore();

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
    confirmAction({
      title: '¿Eliminar Credencial?',
      description: `Esta acción eliminará de forma permanente la credencial del usuario "${usuario}". El sistema ya no podrá usarla para acceder a los servidores vinculados.`,
      confirmLabel: 'Eliminar ahora',
      severity: 'error',
      onConfirm: async () => {
        try {
          await deleteCredential(id);
          showNotification('Credencial eliminada correctamente', 'success');
          setCredentials(prev => prev.filter(c => c.id_credencial !== id));
        } catch (error: any) {
          console.error('Error deleting credential:', error);
          showNotification(error.response?.data?.detail || 'Error al eliminar la credencial', 'error');
        }
      }
    });
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

  const sshCount = credentials.filter(c => c.tipo.id_tipo_acceso === 1).length;
  const dbCount = credentials.filter(c => c.tipo.id_tipo_acceso === 2).length;

  const getTipoAccesoColor = (tipoId: number) => {
    switch (tipoId) {
      case 1: return 'primary' as const;
      case 2: return 'secondary' as const;
      case 3: return 'info' as const;
      case 4: return 'warning' as const;
      default: return 'default' as const;
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Credenciales de Acceso
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión centralizada de llaves SSH, accesos a bases de datos y tokens de API.
        </Typography>
      </Box>

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

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por usuario o servidor..."
        rightActions={
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Actualizar">
              <IconButton onClick={fetchData} disabled={loading} size="medium">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        filters={[
          { label: `Todas (${credentials.length})`, value: 'all' },
          { label: 'SSH', value: 1 },
          { label: 'Base de Datos', value: 2 },
          { label: 'SFTP', value: 3 },
          { label: 'API', value: 4 },
        ]}
        activeFilter={typeFilter}
        onFilterChange={setTypeFilter}
        statsLabel={`Mostrando ${filteredCredentials.length} de ${credentials.length} registros`}
      />

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
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width="40%" height={24} /></TableCell>
                  <TableCell><Skeleton width="70%" height={24} /></TableCell>
                  <TableCell><Skeleton width="50%" height={24} /></TableCell>
                  <TableCell><Skeleton width="30%" height={24} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Skeleton width={28} height={28} variant="circular" />
                      <Skeleton width={28} height={28} variant="circular" />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCredentials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <VpnKeyIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No se encontraron credenciales</Typography>
                  <Button 
                    sx={{ mt: 2, fontWeight: 700 }} 
                    onClick={() => { setSearchTerm(''); setTypeFilter('all'); }}
                  >
                    Limpiar Filtros
                  </Button>
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
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
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

      <FloatingActionGroup 
        items={[
          {
            label: "Carga Masiva (Credenciales)",
            icon: <CloudUploadIcon />,
            color: "secondary",
            onClick: () => navigate('/bulk-upload?target=credentials')
          },
          {
            label: "Nueva Credencial",
            icon: <AddIcon />,
            color: "primary",
            onClick: () => navigate('/credenciales/nueva')
          }
        ]}
      />
    </Box>
  );
};
