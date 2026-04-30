import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Button, TextField, Stack, 
  CircularProgress, Paper, FormControlLabel, Switch, Tooltip, IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getServerById, updateServer } from '../api/infrastructureService';
import { ServerUpdateSchema, type ServerUpdateInput } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
import { CriticalitySelect } from '../components/CriticalitySelect';
import { StatusSelect } from '../components/StatusSelect';
import { BackButton } from '../components/BackButton';

export const UpdateServerInfoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ServerUpdateInput>({
    resolver: zodResolver(ServerUpdateSchema),
  });

  useEffect(() => {
    const fetchServer = async () => {
      if (!id) return;
      try {
        const serverData = await getServerById(Number(id));
        // Resetear el formulario con los datos actuales
        reset({
          nombre_servidor: serverData.nombre_servidor,
          direccion_ip: serverData.direccion_ip,
          es_legacy: serverData.es_legacy,
          id_nivel_criticidad: serverData.id_nivel_criticidad,
          id_estado_servidor: serverData.id_estado_servidor,
          descripcion: serverData.descripcion || "",
        });
      } catch (error) {
        console.error('Error fetching server data:', error);
        showNotification('Error al cargar los datos del servidor', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [id, reset, navigate, showNotification]);

  const onSubmit = async (data: ServerUpdateInput) => {
    if (!id) return;
    setSaving(true);
    try {
      // Limpiar campos vacíos si es necesario, aunque Zod ya los maneja según el esquema
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
      );

      await updateServer(Number(id), filteredData as ServerUpdateInput);
      showNotification('Servidor actualizado correctamente', 'success');
      navigate('/');
    } catch (error: any) {
      console.error('Error updating server:', error);
      showNotification(error.response?.data?.detail || 'Error al actualizar el servidor', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <BackButton to="/" label="Volver al Panel de Control" />
        
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em', mt: 0.5, lineHeight: 1.2 }}>
          Editar Servidor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Modifica la información técnica y de red del activo.
        </Typography>
      </Box>

      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, borderRadius: 2 }}>
        <Stack spacing={3}>
          <TextField
            required
            fullWidth
            label="Dirección IP del Servidor"
            {...register('direccion_ip')}
            error={!!errors.direccion_ip}
            helperText={errors.direccion_ip?.message}
          />

          <TextField
            required
            fullWidth
            label="Nombre del Servidor"
            {...register('nombre_servidor')}
            error={!!errors.nombre_servidor}
            helperText={errors.nombre_servidor?.message}
          />

          <Stack direction="row" alignItems="center" spacing={1}>
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
            label="Estado del Servidor"
            filterIds={[1, 2, 3]} // Asumiendo que 3 es Offline/Mantenimiento
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ py: 1.5, fontWeight: 700, mt: 2 }}
          >
            {saving ? 'Guardando Cambios...' : 'Guardar Cambios'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};