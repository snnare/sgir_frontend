import { useEffect, useState } from 'react';
import { 
  Box, Typography, Stack, Paper, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Divider, Chip, Grid, Card, CardContent
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import { useMonitoringStore } from '../store/useMonitoringStore';

export const MonitoringLogsPage = () => {
  const { 
    sessions, sessionDetail, loading, 
    fetchMonitoringSessions, fetchMonitoringDetail 
  } = useMonitoringStore();
  
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  useEffect(() => {
    fetchMonitoringSessions();
  }, [fetchMonitoringSessions]);

  const handleViewDetail = (id: number) => {
    setSelectedSessionId(id);
    fetchMonitoringDetail(id);
  };

  const getMetricIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cpu')) return <SpeedIcon fontSize="small" sx={{ color: '#ef4444' }} />;
    if (n.includes('ram') || n.includes('mem')) return <MemoryIcon fontSize="small" sx={{ color: '#3b82f6' }} />;
    if (n.includes('disk') || n.includes('disco')) return <StorageIcon fontSize="small" sx={{ color: '#f59e0b' }} />;
    return <ListAltIcon fontSize="small" />;
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Logs de Monitoreo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Historial de sesiones y métricas críticas que superaron el umbral del 90%.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Lista de Sesiones */}
        <Grid item xs={12} md={selectedSessionId ? 5 : 12}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>ID Sesión</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Fecha Inicio</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Estado</TableCell>
                  <TableCell align="right" sx={{ width: 60 }}>
                    <Tooltip title="Actualizar">
                      <IconButton onClick={() => fetchMonitoringSessions()} size="small" disabled={loading}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <TableRow 
                      key={session.id_monitoreo} 
                      hover 
                      selected={selectedSessionId === session.id_monitoreo}
                      onClick={() => handleViewDetail(session.id_monitoreo)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        #{session.id_monitoreo}
                      </TableCell>
                      <TableCell variant="body2">
                        {session.fecha_inicio ? new Date(session.fecha_inicio).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={session.id_estado_monitoreo === 1 ? 'ACTIVA' : 'FINALIZADA'} 
                          size="small"
                          color={session.id_estado_monitoreo === 1 ? 'success' : 'default'}
                          sx={{ fontSize: '0.65rem', fontWeight: 800 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      {loading ? <CircularProgress size={24} /> : 'No hay sesiones registradas'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Detalle de Métricas */}
        {selectedSessionId && (
          <Grid item xs={12} md={7}>
            <Box sx={{ animation: 'slideInRight 0.3s ease-out' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  border: '1px solid', 
                  borderColor: 'primary.light',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ListAltIcon color="primary" /> Detalle de Excesos (Sesión #{selectedSessionId})
                </Typography>

                {loading && !sessionDetail ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                  </Box>
                ) : sessionDetail?.metrics && sessionDetail.metrics.length > 0 ? (
                  <Stack spacing={2}>
                    {sessionDetail.metrics.map((metric) => (
                      <Card 
                        key={metric.id_metrica} 
                        elevation={0} 
                        sx={{ 
                          border: '1px solid', 
                          borderColor: 'divider',
                          borderRadius: 2,
                          bgcolor: 'background.paper'
                        }}
                      >
                        <CardContent sx={{ p: '16px !important' }}>
                          <Grid container alignItems="center">
                            <Grid item xs={1}>
                              {getMetricIcon(metric.tipo?.nombre_metrica || '')}
                            </Grid>
                            <Grid item xs={5}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {metric.tipo?.nombre_metrica || 'Métrica Desconocida'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(metric.fecha_recoleccion).toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={3} textAlign="right">
                              <Typography variant="h6" sx={{ fontWeight: 900, color: 'error.main' }}>
                                {metric.valor}{metric.tipo?.unidad_medida || '%'}
                              </Typography>
                            </Grid>
                            <Grid item xs={3} textAlign="right">
                              <Chip 
                                label="EXCESO > 90%" 
                                size="small" 
                                color="error" 
                                sx={{ fontSize: '0.6rem', fontWeight: 900 }} 
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ 
                    py: 8, 
                    textAlign: 'center', 
                    border: '2px dashed', 
                    borderColor: 'divider',
                    borderRadius: 3
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      No se registraron métricas que superaran el umbral crítico en esta sesión.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
