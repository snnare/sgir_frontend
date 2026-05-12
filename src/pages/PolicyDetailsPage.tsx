import { useEffect, useState } from 'react';
import { 
  Box, Typography, Stack, Paper, CircularProgress, 
  Button, Grid, Divider, Chip, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow 
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import { getBackupPolicies, getPolicyAssets } from '../api/backupService';
import { type BackupPolicy, type PolicyAssetResponse } from '../api/types';

const BACKUP_TYPES_MAP: Record<number, string> = {
  1: 'Completo',
  2: 'Incremental',
  3: 'Diferencial',
  4: 'Full',
};

export const PolicyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<BackupPolicy | null>(null);
  const [assets, setAssets] = useState<PolicyAssetResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const policyId = Number(id);
        const allPolicies = await getBackupPolicies();
        const foundPolicy = allPolicies.find(p => p.id_politica === policyId);
        
        if (foundPolicy) {
          setPolicy(foundPolicy);
          const assetData = await getPolicyAssets(policyId);
          setAssets(assetData);
        }
      } catch (error) {
        console.error('Error loading policy details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!policy) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Política no encontrada</Typography>
        <Button onClick={() => navigate('/backups/politicas')} sx={{ mt: 2 }}>
          Volver al listado
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/backups/politicas')}
            sx={{ mb: 1, color: 'text.secondary', textTransform: 'none' }}
          >
            Volver a Políticas
          </Button>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            {policy.nombre_politica}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {policy.descripcion || 'Sin descripción adicional.'}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={() => navigate(`/edit-policy/${policy.id_politica}`)}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Editar Configuración
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Configuración de la Política */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BackupTableIcon color="primary" /> Configuración
            </Typography>
            
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Tipo de Respaldo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {BACKUP_TYPES_MAP[policy.id_tipo_respaldo] || 'Desconocido'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Frecuencia de Ejecución
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Cada {policy.frecuencia_horas} horas
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Retención de Datos
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <HistoryIcon fontSize="small" color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {policy.retencion_dias} días naturales
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Estado Actual
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={policy.id_estado_politica === 1 ? 'ACTIVA' : 'INACTIVA'} 
                    color={policy.id_estado_politica === 1 ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Activos Vinculados */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon color="primary" /> Activos Protegidos
            </Typography>

            {assets && assets.servidores_vinculados.length > 0 ? (
              <Stack spacing={3}>
                {assets.servidores_vinculados.map((sv, idx) => (
                  <Box key={idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: 'action.hover', p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DnsIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{sv.ip}</Typography>
                        <Chip label={sv.motor} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                      </Stack>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {sv.databases.length} Bases de Datos
                      </Typography>
                    </Box>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Base de Datos</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Tamaño</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sv.databases.map((db) => (
                          <TableRow key={db.id_base_datos}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{db.nombre_base}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption">{db.tamano_mb?.toFixed(1)} MB</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={db.estado} 
                                size="small" 
                                variant="outlined"
                                color={db.estado.toLowerCase() === 'activo' ? 'success' : 'default'}
                                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay activos vinculados a esta política.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
