import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, TextField, Button, Stack, MenuItem, 
  InputAdornment, IconButton, CircularProgress 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import DnsIcon from '@mui/icons-material/Dns'; 
import { CredentialCreateSchema, type CredentialCreateInput } from '../api/types';
import { createCredential } from '../api/infrastructureService';
import { useNotificationStore } from './GlobalNotification';

interface CredentialFormProps {
  serverId?: number;
  onSuccess?: () => void;
}

export const CredentialForm = ({ serverId, onSuccess }: CredentialFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotificationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialCreateInput>({
    resolver: zodResolver(CredentialCreateSchema),
    defaultValues: {
      id_servidor: serverId,
      id_estado_credencial: 1,
    }
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const onSubmit = async (data: CredentialCreateInput) => {
    if (!data.id_servidor) {
      showNotification('Error: ID de servidor no encontrado', 'error');
      return;
    }

    setLoading(true);
    try {
      await createCredential(data);
      showNotification('Credencial guardada correctamente', 'success');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      showNotification(error.response?.data?.detail || 'Error al guardar la credencial', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>

        {/* Tipo de Acceso */}
        <TextField
          select
          fullWidth
          label="Tipo de Acceso"
          {...register('id_tipo_acceso', { valueAsNumber: true })}
          error={!!errors.id_tipo_acceso}
          helperText={errors.id_tipo_acceso?.message}
          defaultValue=""
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
          label="Nombre de Usuario / Identificador"
          {...register('usuario')}
          error={!!errors.usuario}
          helperText={errors.usuario?.message}
        />

        {/* Password con Toggle de Visibilidad */}
        <TextField
          required
          fullWidth
          label="Contraseña / Token / Secret Key"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Estado de Credencial */}
        <TextField
          select
          fullWidth
          label="Estado de la Credencial"
          {...register('id_estado_credencial', { valueAsNumber: true })}
          defaultValue={1}
        >
          <MenuItem value={1}>Activo</MenuItem>
          <MenuItem value={2}>Inactivo</MenuItem>
        </TextField>

        {/* Fila de Botones de Acción */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<DnsIcon fontSize="small" />}
            sx={{ 
              py: 1.5, 
              fontWeight: 600,
              fontSize: '0.9rem',
              borderStyle: 'dashed',
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover'
              }
            }}
          >
            Test Conexión
          </Button>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <KeyIcon />}
            sx={{ 
              py: 1.5, 
              fontWeight: 700,
              fontSize: '0.9rem',
              bgcolor: 'text.primary',
              color: 'background.paper'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Stack>

      </Stack>
    </Box>
  );
};