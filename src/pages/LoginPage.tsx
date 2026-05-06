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
          {/* Logo Oficial SGIR */}
          <Box 
            component="img"
            src="/sgir-logo.png"
            alt="SGIR Logo"
            sx={{ 
              width: 200, 
              height: 'auto', 
              mb: 3,
              filter: (theme) => theme.palette.mode === 'dark' ? 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' : 'none'
            }}
          />

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