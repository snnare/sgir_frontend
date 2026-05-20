import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Typography, Stack, Paper, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Chip, Button
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useMonitoringStore } from '../store/useMonitoringStore';
import { StatusChip } from '../components/StatusChip';
import { FilterBar } from '../components/FilterBar';

export const MonitoringAlertsPage = () => {
  const { alerts, loading, fetchAlertsRecent } = useMonitoringStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchAlertsRecent();
  }, [fetchAlertsRecent]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = 
        alert.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.id_servidor.toString().includes(searchTerm);
      
      const matchesLevel = 
        levelFilter === 'all' || alert.id_nivel_alerta === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [alerts, searchTerm, levelFilter]);

  const getAlertLevelInfo = (levelId: number) => {
    switch (levelId) {
      case 1: return { label: 'CRÍTICO', color: 'error', icon: <ErrorIcon fontSize="inherit" /> };
      case 2: return { label: 'ALTO', color: 'warning', icon: <WarningIcon fontSize="inherit" /> };
      case 3: return { label: 'MEDIO', color: 'info', icon: <InfoIcon fontSize="inherit" /> };
      case 4: return { label: 'BAJO', color: 'default', icon: <InfoIcon fontSize="inherit" /> };
      default: return { label: 'DESCONOCIDO', color: 'default', icon: <InfoIcon fontSize="inherit" /> };
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Centro de Alertas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Notificaciones críticas e incidencias detectadas en la infraestructura.
        </Typography>
      </Box>

      {/* --- 2. BUSCADOR Y FILTROS --- */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por descripción o ID de servidor..."
        rightActions={
          <Tooltip title="Actualizar Alertas">
            <IconButton 
              onClick={() => fetchAlertsRecent()} 
              disabled={loading} 
              size="medium" 
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
        filters={[
          { label: 'Todos los Niveles', value: 'all' },
          { label: 'Crítico', value: 1, color: 'error' },
          { label: 'Alto', value: 2, color: 'warning' },
          { label: 'Medio', value: 3, color: 'info' },
          { label: 'Bajo', value: 4, color: 'default' },
        ]}
        activeFilter={levelFilter}
        onFilterChange={setLevelFilter}
        statsLabel={`Mostrando ${filteredAlerts.length} de ${alerts.length} alertas`}
      />

      {/* --- 3. LISTADO (Tabla) --- */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Nivel</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Descripción de la Incidencia</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Fecha / Hora</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Servidor ID</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => {
                const level = getAlertLevelInfo(alert.id_nivel_alerta);
                return (
                  <TableRow key={alert.id_alerta} hover>
                    <TableCell>
                      <Chip 
                        icon={level.icon as any}
                        label={level.label} 
                        color={level.color as any} 
                        size="small" 
                        sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {alert.descripcion}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {new Date(alert.fecha_alerta).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      #{alert.id_servidor}
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip statusId={alert.id_estado_alerta} />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  {loading ? (
                    <CircularProgress size={32} />
                  ) : (
                    <Box sx={{ opacity: 0.5 }}>
                      <SearchOffIcon sx={{ fontSize: 48, mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {searchTerm || levelFilter !== 'all' ? 'Sin coincidencias' : 'Sin Alertas Activas'}
                      </Typography>
                      <Typography variant="body2">
                        {searchTerm || levelFilter !== 'all' 
                          ? 'Pruebe con otros criterios de búsqueda.' 
                          : 'No se han detectado incidencias críticas en el sistema.'}
                      </Typography>
                      {(searchTerm || levelFilter !== 'all') && (
                        <Button 
                          variant="text" 
                          size="small" 
                          onClick={() => { setSearchTerm(''); setLevelFilter('all'); }}
                          sx={{ mt: 1, fontWeight: 700 }}
                        >
                          Limpiar Filtros
                        </Button>
                      )}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
