import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Button, TextField, MenuItem, 
  Stack, CircularProgress, InputAdornment, IconButton, Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  getCredentialById, updateCredential, getServers 
} from '../api/infrastructureService';
import { 
  CredentialUpdateSchema, type CredentialUpdateInput, type Server 
} from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';

export const EditCredentialPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CredentialUpdateInput>({
    resolver: zodResolver(CredentialUpdateSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [credData, serversData] = await Promise.all([
          getCredentialById(Number(id)),
          getServers()
        ]);
        setServers(serversData);
        // Reseteamos el formulario con los valores actuales
        reset({
          usuario: credData.usuario,
          id_tipo_acceso: credData.id_tipo_acceso,
          id_servidor: credData.id_servidor,
          id_estado_credencial: credData.id_estado_credencial,
        });
      } catch (error) {
        console.error('Error fetching credential data:', error);
        showNotification('Error al cargar los datos de la credencial', 'error');
        navigate('/credenciales');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset, navigate, showNotification]);

  const onSubmit = async (data: CredentialUpdateInput) => {
    if (!id) return;
    setSaving(true);
    try {
      // Eliminamos campos vacíos para el PUT parcial
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
      );

      await updateCredential(Number(id), filteredData as CredentialUpdateInput);
      showNotification('Credencial actualizada correctamente', 'success');
      navigate('/credenciales');
    } catch (error: any) {
      console.error('Error updating credential:', error);
      showNotification(error.response?.data?.detail || 'Error al actualizar la credencial', 'error');
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
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/credenciales')}
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          Volver a Credenciales
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
          Editar Credencial
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Modifica los datos de acceso o el servidor vinculado.
        </Typography>
      </Box>

      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, borderRadius: 2 }}>
        <Stack spacing={3}>
          {/* Servidor */}
          <TextField
            select
            fullWidth
            label="Servidor"
            {...register('id_servidor', { valueAsNumber: true })}
            error={!!errors.id_servidor}
            helperText={errors.id_servidor?.message}
            required
          >
            {servers.map((server) => (
              <MenuItem key={server.id_servidor} value={server.id_servidor}>
                {server.nombre_servidor} ({server.direccion_ip})
              </MenuItem>
            ))}
          </TextField>

          {/* Tipo de Acceso */}
          <TextField
            select
            fullWidth
            label="Tipo de Acceso"
            {...register('id_tipo_acceso', { valueAsNumber: true })}
            error={!!errors.id_tipo_acceso}
            helperText={errors.id_tipo_acceso?.message}
            required
          >
            <MenuItem value={1}>SSH (Monitoreo Básico)</MenuItem>
            <MenuItem value={2}>DB Native (Monitoreo BD)</MenuItem>
            <MenuItem value={3}>SFTP</MenuItem>
            <MenuItem value={4}>API</MenuItem>
          </TextField>

          {/* Usuario */}
          <TextField
            required
            fullWidth
            label="Nombre de Usuario"
            {...register('usuario')}
            error={!!errors.usuario}
            helperText={errors.usuario?.message}
          />

          {/* Password (Opcional en edición) */}
          <TextField
            fullWidth
            label="Nueva Contraseña (Dejar en blanco para no cambiar)"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Estado */}
          <TextField
            select
            fullWidth
            label="Estado"
            {...register('id_estado_credencial', { valueAsNumber: true })}
          >
            <MenuItem value={1}>Activo</MenuItem>
            <MenuItem value={2}>Inactivo</MenuItem>
          </TextField>

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
