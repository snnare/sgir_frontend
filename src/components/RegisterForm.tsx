import { Box, TextField, Button, Typography, Link, Stack, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type RegisterInput } from '../api/types';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from './GlobalNotification';
import { useEffect, useState } from 'react';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const registerAction = useAuthStore((state) => state.register);
  const clearError = useAuthStore((state) => state.clearError);
  const status = useAuthStore((state) => state.status);
  const errorStore = useAuthStore((state) => state.error);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const [showPassword, setShowPassword] = useState(false);

  // Limpiar errores previos al entrar a la página
  useEffect(() => {
    clearError();
  }, [clearError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema) as any,
    defaultValues: {
      id_rol: 2,
      id_estado_usuario: 1
    }
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      // Omitimos confirmPassword antes de enviar al backend
      const { confirmPassword, ...registerData } = data;
      await registerAction(registerData as any);
      showNotification('¡Usuario registrado con éxito! Ya puedes iniciar sesión.', 'success');
      // Tras registro exitoso, enviamos al login
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Error en el registro';
      const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message);
      showNotification(formattedMessage, 'error');
      console.error('Registration failed', err);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit as any)} noValidate sx={{ width: '100%', mt: 1 }}>
      <Stack spacing={2}>
        {errorStore && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorStore}
          </Alert>
        )}

        <TextField
          {...register('nombres')}
          required
          fullWidth
          id="nombres"
          label="Nombres"
          name="nombres"
          autoFocus
          error={!!errors.nombres}
          helperText={errors.nombres?.message}
        />
        <TextField
          {...register('apellidos')}
          required
          fullWidth
          id="apellidos"
          label="Apellidos"
          name="apellidos"
          error={!!errors.apellidos}
          helperText={errors.apellidos?.message}
        />
        <TextField
          {...register('email')}
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          {...register('password')}
          required
          fullWidth
          name="password"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          {...register('confirmPassword')}
          required
          fullWidth
          name="confirmPassword"
          label="Confirmar Contraseña"
          type={showPassword ? 'text' : 'password'}
          id="confirmPassword"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={status === 'loading'}
        sx={{ 
          mt: 4, 
          mb: 2, 
          py: 1.5,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}
      >
        {status === 'loading' ? <CircularProgress size={24} color="inherit" /> : 'Crear Cuenta'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          ¿Ya tienes una cuenta?{' '}
          <Link 
            component={RouterLink} 
            to="/login" 
            sx={{ 
              color: 'text.primary', 
              fontWeight: 600, 
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' } 
            }}
          >
            Inicia sesión
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};