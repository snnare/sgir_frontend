import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, TextField, Button, Stack, MenuItem, 
  CircularProgress 
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useNavigate } from 'react-router-dom';
import { ServerCreateSchema, type ServerCreateInput } from '../api/types';
import { createServer, checkServerByIp } from '../api/infrastructureService';
import { useNotificationStore } from './GlobalNotification';
import { CriticalitySelect } from './CriticalitySelect';

export const ServerForm = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ServerCreateInput>({
    resolver: zodResolver(ServerCreateSchema),
    defaultValues: {
      id_tipo_acceso: 1, 
      id_nivel_criticidad: 1, 
      id_estado: 1, 
    }
  });

  const ipValue = watch('direccion_ip');

  const handleCheckIp = async () => {
    if (!ipValue || errors.direccion_ip) {
      showNotification('Por favor, ingrese una IP válida para verificar', 'warning');
      return;
    }

    setChecking(true);
    try {
      const response = await checkServerByIp(ipValue);
      // Caso 200 OK: El servidor existe
      showNotification(`${response.message}: ${response.server?.nombre_servidor || 'Ya registrado'}`, 'info');
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Caso 404: El servidor no existe (IP disponible)
        showNotification('La IP está disponible para registro', 'success');
      } else if (error.response?.status === 200 || !error.response) {
        // Si por alguna razón el parsing falló pero el status fue 200
        showNotification('Esta IP ya se encuentra registrada en el sistema', 'info');
      } else {
        console.error('Error checking IP:', error);
        showNotification('Error al verificar la IP', 'error');
      }
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (data: ServerCreateInput) => {
    setLoading(true);
    try {
      await createServer(data);
      showNotification('Servidor registrado correctamente', 'success');
      navigate('/'); 
    } catch (error: any) {
      if (error.response?.status === 400) {
        showNotification(error.response.data.detail || 'Ya existe un servidor con esa IP', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        
        {/* IP del Servidor con botón Check */}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            required
            fullWidth
            label="Dirección IP del Servidor"
            placeholder="192.168.1.1"
            {...register('direccion_ip')}
            error={!!errors.direccion_ip}
            helperText={errors.direccion_ip?.message}
          />
          <Button 
            variant="outlined" 
            onClick={handleCheckIp}
            disabled={checking}
            sx={{ height: 56, minWidth: 100, borderStyle: 'dashed' }}
            startIcon={checking ? <CircularProgress size={20} /> : <CheckCircleOutlinedIcon />}
          >
            {checking ? '...' : 'Check'}
          </Button>
        </Stack>

        <TextField
          required
          fullWidth
          label="Nombre del Servidor"
          {...register('nombre_servidor')}
          error={!!errors.nombre_servidor}
          helperText={errors.nombre_servidor?.message}
        />

        {/* Tipo de Acceso */}
        <Controller
          name="id_tipo_acceso"
          control={control}
          render={({ field }) => (
            <TextField
              select
              fullWidth
              label="Tipo de Acceso"
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              <MenuItem value={1}>SSH</MenuItem>
              <MenuItem value={2}>RDP</MenuItem>
              <MenuItem value={3}>WinRM</MenuItem>
            </TextField>
          )}
        />

        {/* Nivel de Criticidad Modularizado */}
        <CriticalitySelect name="id_nivel_criticidad" control={control} />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Descripción del Activo"
          {...register('descripcion')}
        />

        {/* Estado del Servidor */}
        <Controller
          name="id_estado"
          control={control}
          render={({ field }) => (
            <TextField
              select
              fullWidth
              label="Estado Inicial"
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              <MenuItem value={1}>Activo</MenuItem>
              <MenuItem value={2}>Inactivo</MenuItem>
              <MenuItem value={3}>Mantenimiento</MenuItem>
            </TextField>
          )}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ 
            mt: 2, 
            py: 1.5, 
            fontWeight: 700,
            bgcolor: 'text.primary',
            color: 'background.paper'
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar Servidor'}
        </Button>
      </Stack>
    </Box>
  );
};