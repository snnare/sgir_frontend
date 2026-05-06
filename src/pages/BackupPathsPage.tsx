import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Typography, Stack, Paper, CircularProgress, 
  Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, IconButton, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import DnsIcon from '@mui/icons-material/Dns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useInfrastructureStore } from '../store/useInfrastructureStore';
import { useBackupStore } from '../store/useBackupStore';
import { deleteBackupPath } from '../api/backupService';
import { useNotificationStore } from '../components/GlobalNotification';
import { MetricCard } from '../components/MetricCard';

export const BackupPathsPage = () => {
  const navigate = useNavigate();
  const { servers, fetchServers } = useInfrastructureStore();
  const { paths, fetchPaths } = useBackupStore();
  const { showNotification } = useNotificationStore();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchServers(), fetchPaths()]);
      setLoading(false);
    };
    loadData();
  }, [fetchServers, fetchPaths]);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta ruta de respaldo?')) {
      try {
        await deleteBackupPath(id);
        showNotification('Ruta eliminada correctamente', 'success');
        fetchPaths();
      } catch (error: any) {
        console.error('Error deleting backup path:', error);
        showNotification(error.response?.data?.detail || 'Error al eliminar la ruta', 'error');
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchServers(), fetchPaths()]);
    setLoading(false);
    showNotification('Datos actualizados', 'info');
  };

  // Aplanamos la relación Servidor-Rutas para la tabla
  const tableData = useMemo(() => {
    if (servers.length === 0) return [];

    const result: { 
      ip: string; 
      nombre: string;
      path?: string; 
      id_ruta?: number;
      id_servidor: number;
    }[] = [];

    servers.forEach(server => {
      const serverPaths = paths.filter(p => p.id_servidor === server.id_servidor);
      
      if (serverPaths.length === 0) {
        result.push({ 
          ip: server.direccion_ip, 
          nombre: server.nombre_servidor,
          id_servidor: server.id_servidor 
        });
      } else {
        serverPaths.forEach(p => {
          result.push({ 
            ip: server.direccion_ip, 
            nombre: server.nombre_servidor,
            path: p.path,
            id_ruta: p.id_ruta,
            id_servidor: server.id_servidor
          });
        });
      }
    });

    return result;
  }, [servers, paths]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasNothing = servers.length === 0;

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* --- 1. TITULO --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Rutas de Respaldo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión y consulta de destinos de almacenamiento por servidor.
        </Typography>
      </Box>

      {/* --- 2. GENERAL (MÉTRICAS) --- */}
      {!hasNothing && (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)'
            }, 
            gap: 3,
            mb: 4
          }}
        >
          <MetricCard 
            title="Servidores en Inventario" 
            value={servers.length} 
            unit="Nodos" 
            percent={100} 
            icon={<DnsIcon fontSize="small" />} 
          />
          <MetricCard 
            title="Rutas Totales" 
            value={paths.length} 
            unit="Destinos" 
            percent={100} 
            icon={<FolderSpecialIcon fontSize="small" />} 
          />
        </Box>
      )}

      {/* --- 3. ACCIONES --- */}
      <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

      {/* --- 4. TABLA DE CONTENIDO --- */}
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
            No hay nada
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
            No se encontraron servidores registrados en el sistema.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/add-server')}
            sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: 2 }}
          >
            Registrar Primer Servidor
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Dirección IP</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Rutas de Respaldo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Acciones</TableCell>
                <TableCell align="center" sx={{ width: 50 }}>
                  <Tooltip title="Actualizar Tabla">
                    <IconButton onClick={handleRefresh} size="small" disabled={loading}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={`${row.id_servidor}-${row.id_ruta || index}`} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {row.ip}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.path ? (
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 500 }}>
                        {row.path}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No hay nada
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Agregar Ruta">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate('/add-path', { state: { serverId: row.id_servidor } })}
                          sx={{ color: 'success.main' }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {row.id_ruta && (
                        <>
                          <Tooltip title="Editar Ruta">
                            <IconButton 
                              size="small" 
                              onClick={() => navigate(`/edit-path/${row.id_ruta}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar Ruta">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(row.id_ruta!)}
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
    </Box>
  );
};
