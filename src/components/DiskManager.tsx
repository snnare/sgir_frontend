import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, TextField, IconButton, Tooltip
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import axios from 'axios';
import { discoverFilesystems, upsertPartition, getPartitionsByServer, deletePartition } from '../api/infrastructureService';
import { type Filesystem, type PartitionResponse } from '../api/types';
import { useNotificationStore } from './GlobalNotification';

interface DiskManagerProps {
    serverId: number;
}

export const DiskManager = ({ serverId }: DiskManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [filesystems, setFilesystems] = useState<Filesystem[]>([]);
  const [registeredPartitions, setRegisteredPartitions] = useState<PartitionResponse[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  
  const { showNotification } = useNotificationStore();

  const fetchFilesystems = useCallback(async (signal?: AbortSignal) => {
    if (!serverId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [discoveryRes, registeredRes] = await Promise.all([
        discoverFilesystems(serverId, signal),
        getPartitionsByServer(serverId)
      ]);
      
      setFilesystems(discoveryRes.filesystems);
      setRegisteredPartitions(registeredRes);
      
      const initialLabels: Record<string, string> = {};
      discoveryRes.filesystems.forEach(fs => {
          const registered = registeredRes.find(p => p.path === fs.mount_point);
          if (registered) {
              initialLabels[fs.mount_point] = registered.etiqueta;
          } else {
              initialLabels[fs.mount_point] = fs.mount_point === '/' ? 'Root' : `Datos ${fs.mount_point}`;
          }
      });
      setLabels(initialLabels);
      
    } catch (err: any) {
      if (axios.isCancel(err) || err.name === 'CanceledError') {
        return; // Silently ignore request abortion on unmount
      }
      console.error(err);
      setError(err.response?.data?.detail || 'Error al conectar por SSH para descubrir discos. Verifique las credenciales.');
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    const controller = new AbortController();
    if (serverId) {
      fetchFilesystems(controller.signal);
    }
    return () => {
      controller.abort();
    };
  }, [serverId, fetchFilesystems]);

  const handleLabelChange = (path: string, newLabel: string) => {
      setLabels(prev => ({ ...prev, [path]: newLabel }));
  };

  const handleSyncPartition = async (fs: Filesystem) => {
      if (!serverId) return;

      setSyncing(fs.mount_point);
      try {
          await upsertPartition({
              id_servidor: serverId,
              path: fs.mount_point,
              etiqueta: labels[fs.mount_point] || fs.mount_point
          });
          showNotification(`Partición ${fs.mount_point} sincronizada para monitoreo`, 'success');
          
          // Recargar particiones registradas para reflejar el estado en la UI sin re-escanear por SSH
          const registeredRes = await getPartitionsByServer(serverId);
          setRegisteredPartitions(registeredRes);
      } catch (err: any) {
          console.error(err);
          showNotification(`Error al sincronizar partición: ${err.response?.data?.detail || err.message}`, 'error');
      } finally {
          setSyncing(null);
      }
  };

  const handleDeletePartition = async (partitionId: number, mountPoint: string) => {
      if (!serverId) return;

      setSyncing(mountPoint);
      try {
          await deletePartition(partitionId);
          showNotification(`Partición ${mountPoint} desvinculada del monitoreo`, 'success');
          
          // Recargar particiones registradas para reflejar el estado en la UI sin re-escanear por SSH
          const registeredRes = await getPartitionsByServer(serverId);
          setRegisteredPartitions(registeredRes);
      } catch (err: any) {
          console.error(err);
          showNotification(`Error al desvincular partición: ${err.response?.data?.detail || err.message}`, 'error');
      } finally {
          setSyncing(null);
      }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
      )}

      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3, 
          border: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <StorageIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Discos y Particiones Descubiertas
                </Typography>
            </Stack>
            <Tooltip title="Volver a Escanear">
                <IconButton onClick={() => fetchFilesystems()} disabled={loading} size="small">
                    <SyncIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>

        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        ) : filesystems.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography color="text.secondary">No se encontraron particiones o no se ha realizado el escaneo.</Typography>
            </Box>
        ) : (
            <TableContainer>
                <Table size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Punto de Montaje</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Origen</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Tamaño</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Uso</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Etiqueta (Opcional)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Acción</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filesystems.map((fs) => {
                            const usagePctNumber = parseInt(fs.usage_pct);
                            const isCritical = usagePctNumber > 85;
                            const isSyncingThis = syncing === fs.mount_point;
                            const isRoot = fs.mount_point === '/';
                            
                            const isRegistered = isRoot || registeredPartitions.some(p => p.path === fs.mount_point);
                            const dbPartition = registeredPartitions.find(p => p.path === fs.mount_point);
                            const hasLabelChanged = dbPartition ? (labels[fs.mount_point] || '') !== dbPartition.etiqueta : false;

                            return (
                                <TableRow 
                                    key={fs.mount_point} 
                                    hover
                                    sx={{ 
                                        transition: 'background-color 0.2s ease',
                                        ...(isRegistered && {
                                            bgcolor: 'rgba(34, 197, 94, 0.03)',
                                            '&:hover': {
                                                bgcolor: 'rgba(34, 197, 94, 0.06) !important',
                                            }
                                        })
                                    }}
                                >
                                    <TableCell>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                            {isRegistered && (
                                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                            )}
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 700, 
                                                    fontFamily: 'monospace',
                                                    color: isRegistered ? 'success.main' : 'text.primary'
                                                }}
                                            >
                                                {fs.mount_point}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                            {fs.source}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{fs.size}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                                            <Box sx={{ flexGrow: 1, height: 6, bgcolor: 'divider', borderRadius: 1, overflow: 'hidden', minWidth: 60 }}>
                                                <Box sx={{ width: fs.usage_pct, height: '100%', bgcolor: isCritical ? 'error.main' : 'primary.main' }} />
                                            </Box>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: isCritical ? 'error.main' : 'text.primary' }}>
                                                {fs.usage_pct}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <TextField 
                                            size="small"
                                            variant="outlined"
                                            placeholder="Ej. Datos DB"
                                            value={labels[fs.mount_point] || ''}
                                            onChange={(e) => handleLabelChange(fs.mount_point, e.target.value)}
                                            sx={{ minWidth: 150 }}
                                            slotProps={{ input: { sx: { py: 0, fontSize: '0.875rem' } } }}
                                        />
                                    </TableCell>
                                     <TableCell align="right">
                                         <Button
                                             variant={isRoot ? "outlined" : (isRegistered && !hasLabelChanged ? (hoveredBtn === fs.mount_point ? "contained" : "outlined") : "contained")}
                                             color={isRoot ? "inherit" : (isRegistered ? (hoveredBtn === fs.mount_point && !hasLabelChanged ? "error" : "success") : "primary")}
                                             size="small"
                                             onMouseEnter={() => !isRoot && setHoveredBtn(fs.mount_point)}
                                             onMouseLeave={() => setHoveredBtn(null)}
                                             onClick={() => {
                                                 if (isRoot) return;
                                                 if (isRegistered && !hasLabelChanged) {
                                                     if (dbPartition) handleDeletePartition(dbPartition.id_particion, fs.mount_point);
                                                 } else {
                                                     handleSyncPartition(fs);
                                                 }
                                             }}
                                             disabled={isSyncingThis || isRoot} // Bloqueado si es root
                                             startIcon={isSyncingThis 
                                                 ? <CircularProgress size={14} color="inherit" /> 
                                                 : (isRegistered && !hasLabelChanged && hoveredBtn === fs.mount_point
                                                     ? <DeleteOutlinedIcon sx={{ fontSize: 14 }} /> 
                                                     : <CheckCircleIcon />
                                                 )
                                             }
                                             sx={{ 
                                                 fontWeight: 700, 
                                                 boxShadow: 0, 
                                                 transition: 'all 0.2s ease-in-out',
                                                 '&:hover': { 
                                                     boxShadow: 0,
                                                     ...(isRegistered && !hasLabelChanged && {
                                                         bgcolor: 'error.main',
                                                         color: 'error.contrastText',
                                                         borderColor: 'error.main'
                                                     })
                                                 }
                                             }}
                                         >
                                             {isRoot 
                                                 ? 'Monitoreado' 
                                                 : isSyncingThis 
                                                     ? 'Sync...' 
                                                     : isRegistered 
                                                         ? (hasLabelChanged 
                                                             ? 'Actualizar' 
                                                             : (hoveredBtn === fs.mount_point ? 'Desvincular' : 'Sincronizado')
                                                         ) 
                                                         : 'Monitorear'
                                             }
                                         </Button>
                                     </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
      </Paper>
    </Box>
  );
};
