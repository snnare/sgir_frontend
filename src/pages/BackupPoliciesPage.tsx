import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Typography, Stack, Paper, 
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, IconButton, Button, Chip, Divider, Skeleton
  } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useBackupStore } from '../store/useBackupStore';
import { useNotificationStore } from '../components/GlobalNotification';
import { useConfirmStore } from '../store/useConfirmStore';
import { MetricCard } from '../components/MetricCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import { FloatingActionGroup } from '../components/FloatingActionGroup';
import { FilterBar } from '../components/FilterBar';
import { type BackupPolicy } from '../api/types';

const BACKUP_TYPES_MAP: Record<number, string> = {
  1: 'Completo',
  2: 'Incremental',
  3: 'Diferencial',
  4: 'Full',
};

const TEST_POLICIES: BackupPolicy[] = [
  {
    id_politica: 101,
    nombre_politica: "Diario Crítico",
    descripcion: "Respaldo cada 24 horas con retención de 30 días",
    frecuencia_horas: 24,
    retencion_dias: 30,
    id_tipo_respaldo: 1,
    id_estado_politica: 1
  },
  {
    id_politica: 102,
    nombre_politica: "Semanal Archivo (Inexistente)",
    descripcion: "Política de prueba para simular error de no-encontrado en detalles",
    frecuencia_horas: 168,
    retencion_dias: 365,
    id_tipo_respaldo: 4,
    id_estado_politica: 1
  }
];

export const BackupPoliciesPage = () => {
  const navigate = useNavigate();
  const { policies, fetchPolicies, deletePolicy, loading: storeLoading } = useBackupStore();
  const { showNotification } = useNotificationStore();
  const { confirmAction } = useConfirmStore();
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    const loadData = async () => {
      await fetchPolicies();
      setLoading(false);
    };
    loadData();
  }, [fetchPolicies]);

  const handleDelete = async (id: number, name: string) => {
    confirmAction({
      title: '¿Eliminar Política?',
      description: `Esta acción eliminará de forma permanente la política "${name}". Los respaldos ya realizados no se verán afectados, pero no se generarán nuevos bajo esta regla.`,
      confirmLabel: 'Eliminar ahora',
      severity: 'error',
      onConfirm: async () => {
        try {
          await deletePolicy(id);
          showNotification('Política eliminada correctamente', 'success');
        } catch (error: any) {
          console.error('Error deleting policy:', error);
          showNotification(error.response?.data?.detail || 'Error al eliminar la política', 'error');
        }
      }
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchPolicies();
    setLoading(false);
    showNotification('Datos actualizados', 'info');
  };

  // Combinar políticas reales con datos de prueba si no hay reales
  const allData = useMemo(() => {
    return policies.length > 0 ? policies : TEST_POLICIES;
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    return allData.filter(policy => {
      const matchesSearch = 
        policy.nombre_politica.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (policy.descripcion?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesType = 
        typeFilter === 'all' || policy.id_tipo_respaldo === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [allData, searchTerm, typeFilter]);

  if (loading && policies.length === 0) {
    return (
      <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box sx={{ width: '60%' }}>
            <Skeleton width={300} height={48} />
            <Skeleton width={450} height={20} sx={{ mt: 1 }} />
          </Box>
          <Skeleton width={120} height={40} variant="rounded" />
        </Box>

        {/* Metrics Cards Skeleton */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}><Skeleton width="40%" height={24} sx={{ mb: 1 }} /><Skeleton width="70%" height={40} /></Paper>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}><Skeleton width="40%" height={24} sx={{ mb: 1 }} /><Skeleton width="70%" height={40} /></Paper>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}><Skeleton width="40%" height={24} sx={{ mb: 1 }} /><Skeleton width="70%" height={40} /></Paper>
        </Box>

        {/* Table Skeleton */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton width={100} height={20} /></TableCell>
                <TableCell><Skeleton width={150} height={20} /></TableCell>
                <TableCell><Skeleton width={100} height={20} /></TableCell>
                <TableCell><Skeleton width={80} height={20} /></TableCell>
                <TableCell align="right"><Skeleton width={80} height={20} sx={{ ml: 'auto' }} /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width="80%" height={24} /></TableCell>
                  <TableCell><Skeleton width="50%" height={24} /></TableCell>
                  <TableCell><Skeleton width="60%" height={24} /></TableCell>
                  <TableCell><Skeleton width={60} height={24} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Skeleton width={28} height={28} variant="circular" />
                      <Skeleton width={28} height={28} variant="circular" />
                      <Skeleton width={28} height={28} variant="circular" />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  const hasNothing = allData.length === 0;

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO --- */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            Políticas de Respaldo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configuración de frecuencia y retención de respaldos automatizados.
          </Typography>
        </Box>
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
            title="Políticas Activas" 
            value={allData.filter(p => p.id_estado_politica === 1).length} 
            unit="Reglas" 
            percent={100} 
            icon={<BackupTableIcon fontSize="small" />} 
          />
          <MetricCard 
            title="Frecuencia Promedio" 
            value={Math.round(allData.reduce((acc, p) => acc + p.frecuencia_horas, 0) / allData.length) || 0} 
            unit="Horas" 
            percent={100} 
            icon={<AccessTimeIcon fontSize="small" />} 
          />
          <MetricCard 
            title="Retención Promedio" 
            value={Math.round(allData.reduce((acc, p) => acc + p.retencion_dias, 0) / allData.length) || 0} 
            unit="Días" 
            percent={100} 
            icon={<HistoryIcon fontSize="small" />} 
          />
        </Box>
      )}

      <FilterBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre o descripción..."
        filters={[
          { label: 'Todos los tipos', value: 'all' },
          ...Object.entries(BACKUP_TYPES_MAP).map(([id, label]) => ({
            label,
            value: Number(id)
          }))
        ]}
        activeFilter={typeFilter}
        onFilterChange={setTypeFilter}
        statsLabel={`${filteredPolicies.length} políticas encontradas`}
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
            No hay políticas
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
            Define reglas de respaldo para automatizar la protección de tus datos.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/add-policy')}
            sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: 2 }}
          >
            Crear Primera Política
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Nombre de Política</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Frecuencia</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Retención</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
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
              {filteredPolicies.map((policy) => (
                <TableRow key={policy.id_politica} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {policy.nombre_politica}
                    </Typography>
                    {policy.descripcion && (
                      <Typography variant="caption" color="text.secondary">
                        {policy.descripcion}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                      label={`Cada ${policy.frecuencia_horas}h`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<HistoryIcon sx={{ fontSize: '14px !important' }} />}
                      label={`${policy.retencion_dias} días`}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {BACKUP_TYPES_MAP[policy.id_tipo_respaldo] || 'Desconocido'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={policy.id_estado_politica === 1 ? 'Activo' : 'Inactivo'}
                      color={policy.id_estado_politica === 1 ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="Ver Detalle de Política">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => navigate(`/backups/politica/${policy.id_politica}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar Política">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/edit-policy/${policy.id_politica}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar Política">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(policy.id_politica, policy.nombre_politica)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
            label: "Nueva Política",
            icon: <AddIcon />,
            color: "primary",
            onClick: () => navigate('/add-policy')
          }
        ]}
      />
    </Box>
  );
};
