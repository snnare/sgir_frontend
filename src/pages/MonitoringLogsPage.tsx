import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Typography, Stack, Paper, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Chip, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Button
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import { useAuditStore } from '../store/useAuditStore';
import { type AuditLog } from '../api/types';
import { FilterBar } from '../components/FilterBar';

export const MonitoringLogsPage = () => {
  const { logs, loading, fetchLogs, loadMoreLogs, hasMore } = useAuditStore();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchLogs(true);
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.descripcion_evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.entidad_afectada.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = actionFilter === 'all' || log.id_tipo_evento === actionFilter;
      
      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, actionFilter]);

  const handleOpenDetail = (log: AuditLog) => {
    setSelectedLog(log);
  };

  const handleCloseDetail = () => {
    setSelectedLog(null);
  };

  const getActionInfo = (typeId: number) => {
    switch (typeId) {
      case 1: // Creación
        return { label: 'CREACIÓN', color: 'success' as const };
      case 2: // Actualización
        return { label: 'ACTUALIZACIÓN', color: 'info' as const };
      case 3: // Eliminación
        return { label: 'BORRADO', color: 'error' as const };
      default:
        return { label: 'ACCIÓN', color: 'default' as const };
    }
  };

  const getModuleInfo = (entity: string) => {
    const e = entity.toUpperCase();
    if (e.includes('RESPALDO')) return { label: 'RESPALDOS', color: 'secondary' as const };
    if (e.includes('SERVIDOR')) return { label: 'SERVIDORES', color: 'primary' as const };
    if (e.includes('USUARIO')) return { label: 'USUARIOS', color: 'warning' as const };
    if (e.includes('CREDENCIAL')) return { label: 'CREDENCIALES', color: 'info' as const };
    return { label: e, color: 'default' as const };
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Bitácora de Actividad
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Registro de auditoría del sistema: quién, qué y cuándo se realizaron cambios.
        </Typography>
      </Box>

      {/* --- 2. BUSCADOR Y FILTROS --- */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por descripción o módulo..."
        rightActions={
          <Tooltip title="Actualizar Bitácora">
            <IconButton onClick={() => fetchLogs(true)} disabled={loading} size="medium" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
        filters={[
          { label: 'Todos los Eventos', value: 'all' },
          { label: 'Creaciones', value: 1, color: 'success' },
          { label: 'Actualizaciones', value: 2, color: 'info' },
          { label: 'Eliminaciones', value: 3, color: 'error' },
        ]}
        activeFilter={actionFilter}
        onFilterChange={setActionFilter}
        statsLabel={`Mostrando ${filteredLogs.length} de ${logs.length} registros`}
      />

      {/* --- 3. TABLA DE LOGS --- */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Fecha y Hora</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Acción</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Módulo</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Descripción</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Detalles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>Cargando bitácora...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const action = getActionInfo(log.id_tipo_evento);
                const module = getModuleInfo(log.entidad_afectada);
                
                return (
                  <TableRow key={log.id_bitacora} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'action.selected', color: 'text.secondary' }}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Stack>
                          <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary' }}>
                            {log.usuario ? `${log.usuario.nombres} ${log.usuario.apellidos}` : (log.email || `Usuario #${log.id_usuario}`)}
                          </Typography>
                          {(log.usuario?.email || (!log.usuario && log.email)) && (
                            <Typography variant="caption" color="text.secondary">
                              {log.usuario?.email || log.email}
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Date(log.fecha_evento).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.fecha_evento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={action.label} 
                        size="small" 
                        color={action.color}
                        sx={{ fontWeight: 800, fontSize: '0.6rem', borderRadius: 1 }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={module.label} 
                        size="small" 
                        variant="outlined"
                        color={module.color}
                        sx={{ fontWeight: 700, fontSize: '0.6rem', borderRadius: 1 }} 
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap sx={{ color: 'text.primary' }}>
                        {log.descripcion_evento}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Ver ID Entidad: ${log.id_entidad}`}>
                        <IconButton size="small" onClick={() => handleOpenDetail(log)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Box sx={{ opacity: 0.5 }}>
                    <HistoryIcon sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {searchTerm || actionFilter !== 'all' ? 'Sin coincidencias' : 'Sin registros'}
                    </Typography>
                    <Typography variant="body2">
                      {searchTerm || actionFilter !== 'all' 
                        ? 'Pruebe con otros criterios de búsqueda.' 
                        : 'No se han detectado eventos en el sistema.'}
                    </Typography>
                    {(searchTerm || actionFilter !== 'all') && (
                      <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => { setSearchTerm(''); setActionFilter('all'); }}
                        sx={{ mt: 1, fontWeight: 700 }}
                      >
                        Limpiar Filtros
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- 4. PAGINACIÓN / CARGAR MÁS --- */}
      {hasMore && logs.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => loadMoreLogs()} 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
          >
            {loading ? 'Cargando...' : 'Cargar más registros'}
          </Button>
        </Box>
      )}

      {/* --- DIALOGO DE DETALLES --- */}
      <Dialog open={!!selectedLog} onClose={handleCloseDetail} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Detalles del Evento</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>DESCRIPCIÓN COMPLETA</Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>{selectedLog.descripcion_evento}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ID BITÁCORA</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>#{selectedLog.id_bitacora}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ID ENTIDAD AFECTADA</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>#{selectedLog.id_entidad}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>USUARIO ASOCIADO</Typography>
                {selectedLog.usuario ? (
                  <Typography variant="body2">
                    {selectedLog.usuario.nombres} {selectedLog.usuario.apellidos} ({selectedLog.usuario.email})
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    {selectedLog.email || `Usuario ID #${selectedLog.id_usuario}`}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>FECHA EXACTA</Typography>
                <Typography variant="body2">{new Date(selectedLog.fecha_evento).toLocaleString()}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} color="primary" sx={{ fontWeight: 700 }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
