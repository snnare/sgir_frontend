import { Container, Paper, Typography } from '@mui/material';
import { ConnectivityStatus } from '../components/checkStatus';

export const CheckPage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="primary">
          SGIR Frontend
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Panel de Gestión de Infraestructura
        </Typography>
        <ConnectivityStatus />
      </Paper>
    </Container>
  );
};