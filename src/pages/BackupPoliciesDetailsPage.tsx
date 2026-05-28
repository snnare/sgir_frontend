import { useEffect, useState } from 'react';
import { 
  Box, Typography, Stack, Paper, CircularProgress, 
  Button, Grid, Chip, Table, TableBody, 
  TableCell, TableHead, TableRow, IconButton, Tooltip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import EditIcon from '@mui/icons-material/Edit';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import { getBackupPolicies, getPolicyAssets } from '../api/backupService';
import { type BackupPolicy, type PolicyAssetResponse } from '../api/types';
import { useAlertStore } from '../store/useAlertStore';

const BACKUP_TYPES_MAP: Record<number, string> = {
  1: 'Completo',
  2: 'Incremental',
  3: 'Diferencial',
  4: 'Full',
};

const MOCK_POLICY: BackupPolicy = {
  id_politica: 101,
  nombre_politica: "Diario Crítico",
  descripcion: "Respaldo cada 24 horas con retención de 30 días",
  frecuencia_horas: 24,
  retencion_dias: 30,
  id_tipo_respaldo: 1,
  id_estado_politica: 1
};

const MOCK_ASSETS: PolicyAssetResponse = {
  id_politica: 101,
  nombre_politica: "Diario Crítico",
  servidores_vinculados: [
    {
      ip: "192.168.12.20",
      motor: "Oracle Enterprise Legacy 10g",
      databases: [
        {
          id_base_datos: 1,
          nombre_base: "ERP_PROD",
          tamano_mb: 20480.0,
          estado: "ACTIVO"
        }
      ]
    }
  ]
};

export const BackupPoliciesDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlertStore();
  const [policy, setPolicy] = useState<BackupPolicy | null>(null);
  const [assets, setAssets] = useState<PolicyAssetResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const policyId = Number(id);
      try {
        const allPolicies = await getBackupPolicies();
        const foundPolicy = allPolicies.find(p => p.id_politica === policyId);
        
        if (foundPolicy) {
          setPolicy(foundPolicy);
          const assetData = await getPolicyAssets(policyId);
          setAssets(assetData);
        } else if (policyId === 101) {
          setPolicy(MOCK_POLICY);
          setAssets(MOCK_ASSETS);
        } else {
          showAlert({
            title: 'Política No Encontrada',
            description: 'La política de respaldo solicitada no existe o no se encuentra registrada en el sistema.',
            severity: 'warning'
          });
          navigate('/backups/politicas');
        }
      } catch (error) {
        console.error('Error loading policy details:', error);
        if (policyId === 101) {
          setPolicy(MOCK_POLICY);
          setAssets(MOCK_ASSETS);
        } else {
          showAlert({
            title: 'Error al Cargar',
            description: 'Hubo un error de conexión al cargar la política de respaldo seleccionada, o esta no existe.',
            severity: 'error'
          });
          navigate('/backups/politicas');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate, showAlert]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!policy) {
    return null;
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: 'center' }}>
            <Tooltip title="Ir al Panel de Control">
              <IconButton 
                onClick={() => navigate('/')}
                sx={{ 
                  bgcolor: 'action.hover', 
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <HomeIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Volver a Políticas">
              <IconButton 
                onClick={() => navigate('/backups/politicas')}
                sx={{ 
                  bgcolor: 'action.hover', 
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <ArrowBackIosNewIcon sx={{ fontSize: 16 }} color="action" />
              </IconButton>
            </Tooltip>
          </Stack>
          
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
          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
        >
          Editar
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Configuración de la Política */}
        <Grid size={{ xs: 12, md: 4 }}>
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
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
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
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                  <HistoryIcon fontSize="small" color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {policy.retencion_dias} días naturales
                  </Typography>
                </Stack>
              </Box>

              {policy.expression_cron && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Expresión Cron
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', mt: 0.5, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                    {policy.expression_cron}
                  </Typography>
                </Box>
              )}

              {policy.hora_ejecuccion && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Hora de Ejecución
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {policy.hora_ejecuccion}
                  </Typography>
                </Box>
              )}

              {policy.dias_semana && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Días de Ejecución
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {policy.dias_semana}
                  </Typography>
                </Box>
              )}

              {policy.script_path && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Script de Respaldo
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', mt: 0.5, bgcolor: 'action.hover', p: 1, borderRadius: 1, wordBreak: 'break-all' }}>
                    {policy.script_path}
                  </Typography>
                </Box>
              )}

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
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon color="primary" /> Activos Protegidos
            </Typography>

            {assets && assets.servidores_vinculados.length > 0 ? (
              <Stack spacing={3}>
                {assets.servidores_vinculados.map((sv, idx) => (
                  <Box key={idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: 'action.hover', p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
