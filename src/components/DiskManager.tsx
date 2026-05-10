import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, TextField
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { discoverFilesystems, upsertPartition } from '../api/infrastructureService';
import { type Filesystem } from '../api/types';
import { useNotificationStore } from './GlobalNotification';

interface DiskManagerProps {
    serverId: number;
}

export const DiskManager = ({ serverId }: DiskManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [filesystems, setFilesystems] = useState<Filesystem[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  
  const { showNotification } = useNotificationStore();

  const fetchFilesystems = useCallback(async () => {
    if (!serverId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await discoverFilesystems(serverId);
      setFilesystems(response.filesystems);
      
      const initialLabels: Record<string, string> = {};
      response.filesystems.forEach(fs => {
          initialLabels[fs.mount_point] = fs.mount_point === '/' ? 'Root' : `Datos ${fs.mount_point}`;
      });
      setLabels(initialLabels);
      
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error al conectar por SSH para descubrir discos. Verifique las credenciales.');
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    if (serverId) {
      fetchFilesystems();
    }
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
      } catch (err: any) {
          console.error(err);
          showNotification(`Error al sincronizar partición: ${err.response?.data?.detail || err.message}`, 'error');
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
            <Stack direction="row" spacing={1} alignItems="center">
                <StorageIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Discos y Particiones Descubiertas
                </Typography>
            </Stack>
            <Button 
                variant="outlined" 
                startIcon={loading ? <CircularProgress size={16} /> : <SyncIcon />}
                onClick={fetchFilesystems}
                disabled={loading}
                size="small"
                sx={{ bgcolor: 'background.paper', fontWeight: 600 }}
            >
                Volver a Escanear
            </Button>
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

                            return (
                                <TableRow key={fs.mount_point} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                            {fs.mount_point}
                                        </Typography>
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
                                        <Stack direction="row" alignItems="center" spacing={1}>
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
                                            variant={isRoot ? "outlined" : "contained"}
                                            color={isRoot ? "inherit" : "primary"}
                                            size="small"
                                            onClick={() => handleSyncPartition(fs)}
                                            disabled={isSyncingThis || isRoot} // Bloqueado si es root
                                            startIcon={isSyncingThis ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                                            sx={{ fontWeight: 700, boxShadow: 0, '&:hover': { boxShadow: 0 } }}
                                        >
                                            {isRoot ? 'Monitoreado' : (isSyncingThis ? 'Sync...' : 'Monitorear')}
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
