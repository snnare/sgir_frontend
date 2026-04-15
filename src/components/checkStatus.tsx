import { useEffect } from 'react';
import { Alert, CircularProgress, Button, Box, Typography } from '@mui/material';
import { useHealthStore } from '../store/useHealthStore';

export const ConnectivityStatus = () => {
  const { status, data, checkConnection } = useHealthStore();

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
      <Typography variant="h6">Estado del Backend SGIR</Typography>
      
      {status === 'loading' && <CircularProgress size={24} />}
      
      {status === 'online' && (
        <Alert severity="success">
          Conectado: {data?.message || 'Sistema operativo'}
        </Alert>
      )}

      {status === 'offline' && (
        <Alert severity="error">
          Error de conexión: No se pudo alcanzar el servidor.
        </Alert>
      )}

      <Button variant="contained" onClick={checkConnection} disabled={status === 'loading'}>
        Reintentar Conexión
      </Button>
    </Box>
  );
};