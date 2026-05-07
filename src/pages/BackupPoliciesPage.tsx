import { useEffect, useState } from 'react';
import { 
  Box, Typography, Stack, Paper, CircularProgress, 
  Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, IconButton, Button, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useBackupStore } from '../store/useBackupStore';
import { useNotificationStore } from '../components/GlobalNotification';
import { MetricCard } from '../components/MetricCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';

const BACKUP_TYPES_MAP: Record<number, string> = {
  1: 'Completo',
  2: 'Incremental',
  3: 'Diferencial',
  4: 'Full',
};

export const BackupPoliciesPage = () => {
  const navigate = useNavigate();
  const { policies, fetchPolicies, deletePolicy, loading: storeLoading } = useBackupStore();
  const { showNotification } = useNotificationStore();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchPolicies();
      setLoading(false);
    };
    loadData();
  }, [fetchPolicies]);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta política de respaldo?')) {
      try {
        await deletePolicy(id);
        showNotification('Política eliminada correctamente', 'success');
      } catch (error: any) {
        console.error('Error deleting policy:', error);
        showNotification(error.response?.data?.detail || 'Error al eliminar la política', 'error');
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchPolicies();
    setLoading(false);
    showNotification('Datos actualizados', 'info');
  };

  if (loading && policies.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasNothing = policies.length === 0;

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-policy')}
          sx={{ 
            bgcolor: 'text.primary', 
            color: 'background.paper',
            borderRadius: 2,
            fontWeight: 700,
            px: 3,
            py: 1,
            '&:hover': { bgcolor: 'text.secondary' }
          }}
        >
          Nueva Política
        </Button>
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
            value={policies.filter(p => p.id_estado_politica === 1).length} 
            unit="Reglas" 
            percent={100} 
            icon={<BackupTableIcon fontSize="small" />} 
          />
          <MetricCard 
            title="Frecuencia Promedio" 
            value={Math.round(policies.reduce((acc, p) => acc + p.frecuencia_horas, 0) / policies.length) || 0} 
            unit="Horas" 
            percent={100} 
            icon={<AccessTimeIcon fontSize="small" />} 
          />
          <MetricCard 
            title="Retención Promedio" 
            value={Math.round(policies.reduce((acc, p) => acc + p.retencion_dias, 0) / policies.length) || 0} 
            unit="Días" 
            percent={100} 
            icon={<HistoryIcon fontSize="small" />} 
          />
        </Box>
      )}

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
              {policies.map((policy) => (
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
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
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
                          onClick={() => handleDelete(policy.id_politica)}
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
    </Box>
  );
};
