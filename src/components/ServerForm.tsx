import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, TextField, Button, Stack, 
  CircularProgress, FormControlLabel, Switch, Tooltip, IconButton
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
import { ServerCreateSchema, type ServerCreateInput } from '../api/types';
import { createServer, checkServerByIp, pingServer } from '../api/infrastructureService';
import { useNotificationStore } from './GlobalNotification';
import { CriticalitySelect } from './CriticalitySelect';
import { StatusSelect } from './StatusSelect';

interface ServerFormProps {
  onSuccess?: (serverId: number, ip: string) => void;
  monitoreoHost?: boolean;
  monitoreoDb?: boolean;
}

export const ServerForm = ({ onSuccess, monitoreoHost = false, monitoreoDb = false }: ServerFormProps) => {
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
      id_nivel_criticidad: 1, 
      id_estado_servidor: 1, 
      es_legacy: false,
      monitoreo_host: monitoreoHost,
      monitoreo_db: monitoreoDb,
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
      // 1. Validación de Registro (DB)
      const checkData = await checkServerByIp(ipValue);
      
      // Si el backend devuelve el servidor (200), significa que ya existe.
      // Si devuelve 404, checkData suele tener un campo 'detail'.
      if (checkData && !checkData.detail) {
        showNotification('Esta IP ya se encuentra registrada en el sistema', 'error');
        setChecking(false);
        return;
      }

      // 2. Validación de Conectividad (Ping)
      const isReachable = await pingServer(ipValue);

      if (isReachable) {
        showNotification('IP disponible y alcanzable (Responde al Ping)', 'success');
      } else {
        showNotification('IP disponible para registro, pero el servidor NO responde al ping', 'warning');
      }

    } catch (error: any) {
      console.error('Error checking IP/Ping:', error);
      showNotification('Error al verificar la IP o conectividad', 'error');
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (data: ServerCreateInput) => {
    const payload = {
      nombre_servidor: data.nombre_servidor,
      direccion_ip: data.direccion_ip,
      es_legacy: data.es_legacy,
      id_nivel_criticidad: data.id_nivel_criticidad,
      id_estado_servidor: data.id_estado_servidor,
      descripcion: data.descripcion || "",
      monitoreo_host: monitoreoHost,
      monitoreo_db: monitoreoDb,
    };
    
    console.log('Enviando payload al backend:', JSON.stringify(payload, null, 2));
    setLoading(true);
    try {
      const newServer = await createServer(payload);
      showNotification('Servidor registrado correctamente', 'success');
      
      if (onSuccess) {
        onSuccess(newServer.id_servidor, data.direccion_ip);
      } else {
        // Redirigimos al Wizard de configuración con el ID del servidor recién creado
        navigate(`/setup-wizard/${newServer.id_servidor}`); 
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const details = error.response.data.detail;
        const errorMessage = Array.isArray(details) 
          ? details.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ')
          : 'Error de validación en el servidor';
        showNotification(`Error: ${errorMessage}`, 'error');
      } else if (error.response?.status === 400) {
        showNotification(error.response.data.detail || 'Ya existe un servidor con esa IP', 'error');
      } else {
        showNotification('Error al registrar el servidor', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
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

        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
          <Controller
            name="es_legacy"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch 
                    checked={field.value} 
                    onChange={(e) => field.onChange(e.target.checked)} 
                    color="primary" 
                  />
                }
                label="Servidor Legacy"
                sx={{ mr: 0 }}
              />
            )}
          />
          <Tooltip title="Los servidores legacy utilizan protocolos de conexión antiguos">
            <IconButton size="small">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <CriticalitySelect name="id_nivel_criticidad" control={control} />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Descripción del Activo"
          {...register('descripcion')}
        />

        <StatusSelect 
          name="id_estado_servidor" 
          control={control} 
          label="Estado Inicial"
          filterIds={[1, 2]} 
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