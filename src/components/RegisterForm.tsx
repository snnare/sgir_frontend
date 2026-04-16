import { Box, TextField, Button, Typography, Link, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const RegisterForm = () => {
  return (
    <Box component="form" noValidate sx={{ width: '100%', mt: 1 }}>
      <Stack spacing={2}> {/* Stack asegura alineación perfecta y espacio uniforme */}
        <TextField
          required
          fullWidth
          id="nombres"
          label="Nombres"
          name="nombres"
          autoFocus
        />
        <TextField
          required
          fullWidth
          id="apellidos"
          label="Apellidos"
          name="apellidos"
        />
        <TextField
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
        />
        <TextField
          required
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          autoComplete="new-password"
        />
      </Stack>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ 
          mt: 4, 
          mb: 2, 
          py: 1.5, // Un poco más de altura para el look premium
          fontWeight: 600,
          fontSize: '0.9rem'
        }}
      >
        Crear Cuenta
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