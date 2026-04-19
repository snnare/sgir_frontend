import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, TextField, Button, Stack, 
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { UserUpdateSchema, type UserUpdateInput } from '../api/types';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from './GlobalNotification';

interface ProfileFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const ProfileForm = ({ onCancel, onSuccess }: ProfileFormProps) => {
  const { user, updateUser } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserUpdateInput>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      nombres: user?.nombres || '',
      apellidos: user?.apellidos || '',
      email: user?.email || '',
      id_estado_usuario: user?.id_estado_usuario,
    }
  });

  const onSubmit = async (data: UserUpdateInput) => {
    setLoading(true);
    try {
      await updateUser(data);
      showNotification('Perfil actualizado correctamente', 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.detail || 'Error al actualizar el perfil';
      showNotification(typeof errorMessage === 'string' ? errorMessage : 'Error de validación', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <TextField
          required
          fullWidth
          label="Nombres"
          {...register('nombres')}
          error={!!errors.nombres}
          helperText={errors.nombres?.message}
        />

        <TextField
          required
          fullWidth
          label="Apellidos"
          {...register('apellidos')}
          error={!!errors.apellidos}
          helperText={errors.apellidos?.message}
        />

        <TextField
          required
          fullWidth
          type="email"
          label="Correo Electrónico"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onCancel}
            startIcon={<CloseIcon />}
            disabled={loading}
            sx={{ 
              py: 1.5, 
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ 
              py: 1.5, 
              fontWeight: 700,
              bgcolor: 'text.primary',
              color: 'background.paper',
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'text.secondary',
              }
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};