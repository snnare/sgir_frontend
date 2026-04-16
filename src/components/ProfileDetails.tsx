import { Box, Typography, Stack, Divider, Avatar, Button, TextField, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from './GlobalNotification';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserUpdateSchema, type UserUpdateInput } from '../api/types';
import { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export const ProfileDetails = () => {
  const { user, updateUser, status, clearError } = useAuthStore();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserUpdateInput>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      nombres: user?.nombres || '',
      apellidos: user?.apellidos || '',
      email: user?.email || '',
    },
  });

  // Sincronizar formulario si los datos del usuario cambian en el store
  useEffect(() => {
    if (user) {
      reset({
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserUpdateInput) => {
    try {
      await updateUser(data);
      showNotification('Perfil actualizado correctamente', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed', error);
      // El error ya se maneja en el store y se muestra vía interceptor/GlobalNotification
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    clearError();
  };

  if (!user) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: -4 }}>
        {!isEditing ? (
          <Tooltip title="Editar Perfil">
            <IconButton onClick={() => setIsEditing(true)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Cancelar">
              <IconButton onClick={handleCancel} size="small" color="error">
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'text.primary', 
            fontSize: '2rem',
            fontWeight: 700 
          }}
        >
          {user.nombres[0]}{user.apellidos[0]}
        </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          {!isEditing ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                {user.nombres} {user.apellidos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.id_rol === 1 ? 'Administrador' : 'Operador'} — SGIR
              </Typography>
            </>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Editando Perfil
            </Typography>
          )}
        </Box>
      </Stack>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          {isEditing ? (
            <>
              <TextField
                {...register('nombres')}
                label="Nombres"
                fullWidth
                size="small"
                error={!!errors.nombres}
                helperText={errors.nombres?.message}
              />
              <TextField
                {...register('apellidos')}
                label="Apellidos"
                fullWidth
                size="small"
                error={!!errors.apellidos}
                helperText={errors.apellidos?.message}
              />
              <TextField
                {...register('email')}
                label="Correo Electrónico"
                fullWidth
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={status === 'loading' ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={status === 'loading'}
                sx={{ mt: 2 }}
              >
                Guardar Cambios
              </Button>
            </>
          ) : (
            <>
              <DataRow label="Correo Electrónico" value={user.email} />
              <Divider />
              <DataRow label="ID de Usuario" value={`USR-${user.id_usuario}-SGIR`} isMono />
              <Divider />
              <DataRow label="Rol en Sistema" value={user.id_rol === 1 ? 'Administrador' : 'Operador'} />
              <Divider />
              <DataRow label="Miembro desde" value={user.creado_en ? new Date(user.creado_en).toLocaleDateString() : 'N/A'} />
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

const DataRow = ({ label, value, isMono = false }: any) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        fontWeight: 600, 
        fontFamily: isMono ? '"JetBrains Mono", monospace' : 'inherit' 
      }}
    >
      {value}
    </Typography>
  </Stack>
);