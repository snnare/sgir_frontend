import { Container, Box, Paper, Typography } from '@mui/material';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Marcador de texto para el Icono de SGIR */}
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              mb: 3, 
              letterSpacing: '-0.05em',
              color: 'text.primary'
            }}
          >
            SGIR
          </Typography>

          <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
            Bienvenido
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Accede al panel de control de infraestructura
          </Typography>

          <LoginForm />
        </Paper>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} SGIR - Sistema de Gestión e Infraestructura
        </Typography>
      </Box>
    </Container>
  );
};