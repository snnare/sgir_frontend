import { Box, TextField, Button, Typography, Link, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const LoginForm = () => {
  return (
    <Box component="form" noValidate sx={{ width: '100%', mt: 1 }}>
      <Stack spacing={2.5}>
        <TextField
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
          autoFocus
        />
        <TextField
          required
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          autoComplete="current-password"
        />
      </Stack>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ 
          mt: 4, 
          mb: 2, 
          py: 1.5, 
          fontWeight: 600,
          fontSize: '0.9rem'
        }}
      >
        Iniciar Sesión
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