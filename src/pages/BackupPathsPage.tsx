import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Typography, Stack, Paper, CircularProgress, 
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, IconButton, Button, Chip, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import { useBackupStore } from '../store/useBackupStore';
import { useNotificationStore } from '../components/GlobalNotification';
import { useConfirmStore } from '../store/useConfirmStore';
import { MetricCard } from '../components/MetricCard';
import { FilterBar } from '../components/FilterBar';
import { FloatingActionGroup } from '../components/FloatingActionGroup';

import { type BackupPathDetails } from '../api/types';
import { getBackupPathsDetails } from '../api/backupService';

const STORAGE_TYPES_MAP: Record<number, { label: string; icon: React.ReactNode; color: string }> = {
  1: { label: 'Local Disk', icon: <StorageIcon fontSize="inherit" />, color: 'primary' },
  2: { label: 'Network (NAS)', icon: <DnsIcon fontSize="inherit" />, color: 'info' },
  3: { label: 'Cloud Storage', icon: <CloudQueueIcon fontSize="inherit" />, color: 'secondary' },
  4: { label: 'Amazon S3', icon: <CloudQueueIcon fontSize="inherit" />, color: 'warning' },
};

const TEST_PATHS_DETAILS: BackupPathDetails[] = [
  {
    ip: "192.168.12.10",
    path: "/data/respaldos",
    descripcion: "Almacenamiento Local de Backups",
    estado: "Activo",
    id_ruta: 201
  },
  {
    ip: "192.168.12.20",
    path: "/u01/app/oracle/backups",
    descripcion: "Respaldo Oracle RMAN",
    estado: "Activo",
    id_ruta: 202
  }
];

export const BackupPathsPage = () => {
  const navigate = useNavigate();
  const { paths, fetchPaths, deletePath, loading: storeLoading } = useBackupStore();
  const { showNotification } = useNotificationStore();
  const { confirmAction } = useConfirmStore();
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [storageFilter, setStorageFilter] = useState<number | 'all'>('all');
  const [detailsList, setDetailsList] = useState<BackupPathDetails[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPaths();
        const data = await getBackupPathsDetails();
        if (data.length > 0) {
          setDetailsList(data);
        } else {
          setDetailsList(TEST_PATHS_DETAILS);
        }
      } catch (error) {
        console.error("Error fetching path details:", error);
        setDetailsList(TEST_PATHS_DETAILS);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchPaths]);

  const handleDelete = async (id: number, name: string) => {
    confirmAction({
      title: '¿Eliminar Ruta de Respaldo?',
      description: `Esta acción eliminará de forma permanente la ruta "${name}". Los respaldos almacenados físicamente no se borrarán, pero el sistema ya no podrá usarlos como destino ni rastrearlos automáticamente.`,
      confirmLabel: 'Eliminar ahora',
      severity: 'error',
      onConfirm: async () => {
        try {
          await deletePath(id);
          showNotification('Ruta eliminada correctamente', 'success');
          const data = await getBackupPathsDetails();
          setDetailsList(data.length > 0 ? data : TEST_PATHS_DETAILS);
        } catch (error: any) {
          console.error('Error deleting path:', error);
          showNotification(error.response?.data?.detail || 'Error al eliminar la ruta', 'error');
        }
      }
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchPaths();
      const data = await getBackupPathsDetails();
      setDetailsList(data.length > 0 ? data : TEST_PATHS_DETAILS);
      showNotification('Datos de rutas actualizados', 'info');
    } catch (error) {
      setDetailsList(TEST_PATHS_DETAILS);
    } finally {
      setLoading(false);
    }
  };

  const filteredPaths = useMemo(() => {
    return detailsList.filter(p => {
      const matchesSearch = 
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ip.toLowerCase().includes(searchTerm.toLowerCase());

      const basePath = paths.find(bp => bp.path === p.path || (p.id_ruta && bp.id_ruta === p.id_ruta));
      const matchesStorage = 
        storageFilter === 'all' || 
        (basePath && basePath.id_tipo_almacenamiento === storageFilter);

      return matchesSearch && matchesStorage;
    });
  }, [detailsList, searchTerm, storageFilter, paths]);

  if (loading && paths.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasNothing = detailsList.length === 0;

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Rutas de Respaldo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de destinos físicos y almacenamiento lógico para el resguardo de datos.
        </Typography>
      </Box>

      {/* --- 2. MÉTRICAS --- */}
      {!hasNothing && (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(3, 1fr)'
            }, 
            gap: 3,
            mb: 4
          }}
        >
          <MetricCard 
            title="Rutas Registradas" 
            value={paths.length} 
            unit="Destinos" 
            percent={100} 
            icon={<FolderSpecialIcon fontSize="small" />} 
          />
          <MetricCard 
            title="Puntos Activos" 
            value={paths.filter(p => p.id_estado_ruta === 1).length} 
            unit="Online" 
            percent={Math.round((paths.filter(p => p.id_estado_ruta === 1).length / paths.length) * 100)} 
            color="#22c55e"
            icon={<StorageIcon fontSize="small" />} 
          />
          <MetricCard 
            title="Almacenamiento Red" 
            value={paths.filter(p => p.id_tipo_almacenamiento !== 1).length} 
            unit="NAS/Cloud" 
            percent={100} 
            color="#3b82f6"
            icon={<CloudQueueIcon fontSize="small" />} 
          />
        </Box>
      )}

      <FilterBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por descripción o ruta física..."
        filters={[
          { label: 'Todos los tipos', value: 'all' },
          ...Object.entries(STORAGE_TYPES_MAP).map(([id, data]) => ({
            label: data.label,
            value: Number(id)
          }))
        ]}
        activeFilter={storageFilter}
        onFilterChange={setStorageFilter}
        statsLabel={`${filteredPaths.length} rutas encontradas`}
      />

      <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

      {/* --- 3. TABLA --- */}
      {hasNothing ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 10, 
            textAlign: 'center', 
            border: '2px dashed', 
            borderColor: 'divider',
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4
          }}
        >
          <SearchOffIcon sx={{ fontSize: 64, color: 'divider', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            No hay rutas configuradas
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
            Debes registrar al menos una ruta física para que el sistema sepa dónde depositar los respaldos.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/add-path')}
            sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: 2 }}
          >
            Configurar Primera Ruta
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Servidor (IP)</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Ruta Física (Mount Point)</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Descripción / Alias</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Acciones</TableCell>
                <TableCell align="center" sx={{ width: 50 }}>
                  <Tooltip title="Actualizar Tabla">
                    <IconButton onClick={handleRefresh} size="small" disabled={storeLoading}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPaths.map((path, idx) => (
                <TableRow key={path.id_ruta || idx} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 750, fontFamily: '"JetBrains Mono", monospace', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DnsIcon fontSize="small" color="primary" /> {path.ip}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                      {path.path}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {path.descripcion}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={path.estado}
                      color={path.estado.toLowerCase() === 'activo' || path.estado.toLowerCase() === 'disponible' ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      {path.id_ruta && (
                        <>
                          <Tooltip title="Editar Ruta">
                            <IconButton 
                              size="small" 
                              onClick={() => navigate(`/edit-path/${path.id_ruta}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar Ruta">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(path.id_ruta!, path.descripcion)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FloatingActionGroup 
        items={[
          {
            label: "Carga Masiva",
            icon: <CloudUploadIcon />,
            color: "secondary",
            onClick: () => navigate('/bulk-upload')
          },
          {
            label: "Nueva Ruta",
            icon: <AddIcon />,
            color: "primary",
            onClick: () => navigate('/add-path')
          }
        ]}
      />
    </Box>
  );
};
