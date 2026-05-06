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
                    {/* Logo Oficial SGIR */}
                    <Box 
                        component="img"
                        src="/sgir-logo.png"
                        alt="SGIR Logo"
                        sx={{ 
                            width: 180, 
                            height: 'auto', 
                            mb: 3,
                            filter: (theme) => theme.palette.mode === 'dark' ? 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' : 'none'
                        }}
                    />

                    <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                        Registro
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