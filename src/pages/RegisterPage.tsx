import { Container, Box, Paper, Typography, Avatar } from '@mui/material';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
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
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    {/* Icono minimalista con el color primary definido en el theme */}
                    <Avatar sx={{ m: 1, bgcolor: 'text.primary', color: 'background.paper', width: 48, height: 48 }}>
                        <AppRegistrationIcon />
                    </Avatar>

                    <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                        Registro SGIR
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                        Plataforma de Gestión de Infraestructura y Respaldos
                    </Typography>

                    <RegisterForm />
                </Paper>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
                    © {new Date().getFullYear()} SGIR - Entorno Corporativo
                </Typography>
            </Box>
        </Container>
    );
};