import { Box, TextField, Button, Typography, Link, Stack, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginInput } from '../api/types';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from './GlobalNotification';
import { useState, useEffect } from 'react';

export const LoginForm = () => {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const status = useAuthStore((state) => state.status);
  const errorStore = useAuthStore((state) => state.error);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLocalError(null);
    try {
      await loginAction(data);
      showNotification('¡Bienvenido al sistema!', 'success');
      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Error en el inicio de sesión';
      const formattedMessage = typeof message === 'string' ? message : JSON.stringify(message);
      showNotification(formattedMessage, 'error');
      console.error('Login failed', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%', mt: 1 }}>
      <Stack spacing={2.5}>
        {(errorStore || localError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorStore || localError}
          </Alert>
        )}

        <TextField
          {...register('email')}
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
          autoFocus
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          {...register('password')}
          required
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
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
        {status === 'loading' ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          ¿No tienes una cuenta?{' '}
          <Link 
            component={RouterLink} 
            to="/register" 
            sx={{ 
              color: 'text.primary', 
              fontWeight: 600, 
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' } 
            }}
          >
            Regístrate aquí
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};