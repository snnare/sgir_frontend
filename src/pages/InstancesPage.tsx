import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Stack, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, Skeleton, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DnsIcon from '@mui/icons-material/Dns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { getInstances, getServers, getDbms, getGeneralStatuses, deleteInstance } from '../api/infrastructureService';
import { type Instance, type Server, type Dbms, type GeneralStatus } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
import { useConfirmStore } from '../store/useConfirmStore';
import { FilterBar } from '../components/FilterBar';

export const InstancesPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const { confirmAction } = useConfirmStore();

  const [instances, setInstances] = useState<Instance[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [dbmsList, setDbmsList] = useState<Dbms[]>([]);
  const [statuses, setStatuses] = useState<GeneralStatus[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbmsFilter, setDbmsFilter] = useState<string>('all');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [instancesData, serversData, dbmsData, statusesData] = await Promise.all([
        getInstances(),
        getServers(),
        getDbms(),
        getGeneralStatuses()
      ]);
      setInstances(instancesData);
      setServers(serversData);
      setDbmsList(dbmsData);
      setStatuses(statusesData);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error fetching instances page data:', error);
      showNotification('Error al cargar datos de las instancias DBMS', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const handleDelete = (id: number, name: string) => {
    confirmAction({
      title: '¿Eliminar Instancia DBMS?',
      description: `¿Está seguro de que desea eliminar la instancia "${name}"? Esta acción eliminará permanentemente la instancia y todas sus bases de datos asociadas en la CMDB. No se puede deshacer.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      severity: 'error',
      onConfirm: async () => {
        try {
          await deleteInstance(id);
          showNotification(`Instancia "${name}" eliminada exitosamente`, 'success');
          // Update local state
          setInstances(prev => prev.filter(inst => inst.id_instancia !== id));
        } catch (error: any) {
          console.error('Error deleting instance:', error);
          showNotification(error.response?.data?.detail || 'Error al eliminar la instancia', 'error');
        }
      }
    });
  };

  // Enriquecer y filtrar datos
  const filteredData = useMemo(() => {
    const enriched = instances.map(inst => {
      const server = servers.find(s => s.id_servidor === inst.id_servidor);
      const dbms = dbmsList.find(d => d.id_dbms === inst.id_dbms);
      const status = statuses.find(s => s.id_estado === (inst.id_estado_instancia ?? inst.id_estado));

      return {
        ...inst,
        serverName: server ? server.nombre_servidor : 'Desconocido',
        serverIp: server ? server.direccion_ip : '0.0.0.0',
        dbmsName: dbms ? dbms.nombre_dbms : 'Desconocido',
        dbmsVersion: dbms ? dbms.version : '',
        statusName: status ? status.nombre_estado : 'Desconocido'
      };
    });

    return enriched.filter(item => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        item.nombre_instancia.toLowerCase().includes(searchStr) ||
        String(item.puerto).includes(searchStr) ||
        item.serverName.toLowerCase().includes(searchStr) ||
        item.serverIp.includes(searchStr) ||
        item.dbmsName.toLowerCase().includes(searchStr);

      const matchesDbms = (() => {
        if (dbmsFilter === 'all') return true;
        const motorLower = item.dbmsName.toLowerCase();
        if (dbmsFilter === 'mysql5') return motorLower.includes('mysql') && item.dbmsVersion.startsWith('5');
        if (dbmsFilter === 'mysql8') return motorLower.includes('mysql') && item.dbmsVersion.startsWith('8');
        if (dbmsFilter === 'mongo') return motorLower.includes('mongo');
        if (dbmsFilter === 'oracle') return motorLower.includes('oracle');
        return motorLower.includes(dbmsFilter.toLowerCase());
      })();

      return matchesSearch && matchesDbms;
    });
  }, [instances, servers, dbmsList, statuses, searchTerm, dbmsFilter]);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Title */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
            Instancias DBMS
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Búsqueda y control centralizado de instancias de bases de datos registradas.
          </Typography>
        </Box>
      </Box>

      {/* Filter Bar */}
      <FilterBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por instancia, puerto, servidor o motor..."
        rightActions={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-instance')}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              height: 40,
              whiteSpace: 'nowrap',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            Nueva Instancia
          </Button>
        }
        filters={[
          { label: 'Todas', value: 'all' },
          { label: 'MySQL 5', value: 'mysql5' },
          { label: 'MySQL 8', value: 'mysql8' },
          { label: 'Mongo', value: 'mongo' },
          { label: 'Oracle', value: 'oracle' }
        ]}
        activeFilter={dbmsFilter}
        onFilterChange={setDbmsFilter}
        bottomActions={
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.9rem' }} /> Actualizado: {lastSyncTime.toLocaleTimeString()}
          </Typography>
        }
        statsLabel={`${filteredData.length} ${filteredData.length === 1 ? 'instancia encontrada' : 'instancias encontradas'}`}
      />

      {/* Table Container */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 400 }}>
        {loading ? (
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Instancia</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Servidor / IP</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Motor DBMS</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Puerto</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Estado</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Fecha Registro</TableCell>
                <TableCell align="right" sx={{ width: 80 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width="60%" height={24} /></TableCell>
                  <TableCell><Skeleton width="70%" height={24} /></TableCell>
                  <TableCell><Skeleton width="50%" height={24} /></TableCell>
                  <TableCell align="center"><Skeleton width="30%" height={24} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="center"><Skeleton width={60} height={24} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="center"><Skeleton width={100} height={24} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="right"><Skeleton width={28} height={28} variant="circular" sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Instancia</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Servidor / IP</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Motor DBMS</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Puerto</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Estado</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Fecha Registro</TableCell>
                <TableCell align="right" sx={{ width: 80 }}>
                  <Tooltip title="Actualizar Tabla">
                    <IconButton onClick={handleRefresh} size="small">
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <TableRow key={row.id_instancia} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <StorageIcon fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {row.nombre_instancia}
                          </Typography>
                          {row.parametros_conexion?.sid && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              SID: {row.parametros_conexion.sid}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <DnsIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {row.serverName}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'text.secondary' }}>
                            {row.serverIp}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.dbmsName}</Typography>
                      <Chip 
                        label={row.dbmsVersion || 'Sin versión'}
                        size="small"
                        sx={{ 
                          fontWeight: 800, 
                          borderRadius: 1.5, 
                          fontSize: '0.6rem',
                          bgcolor: row.dbmsName.toLowerCase().includes('oracle') ? 'error.lighter' : row.dbmsName.toLowerCase().includes('mongo') ? 'success.lighter' : 'primary.lighter',
                          color: row.dbmsName.toLowerCase().includes('oracle') ? 'error.dark' : row.dbmsName.toLowerCase().includes('mongo') ? 'success.dark' : 'primary.dark',
                          border: '1px solid',
                          borderColor: 'currentColor',
                          textTransform: 'uppercase',
                          mt: 0.5,
                          display: 'inline-flex'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {row.puerto}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={row.statusName} 
                        size="small" 
                        color={row.statusName.toLowerCase() === 'activo' || row.statusName.toLowerCase() === 'online' ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarTodayIcon sx={{ fontSize: '0.75rem', color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric'
                          }) : 'N/D'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Eliminar Instancia">
                        <IconButton 
                          onClick={() => handleDelete(row.id_instancia, row.nombre_instancia)} 
                          size="small" 
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron instancias que coincidan con los filtros aplicados.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};
