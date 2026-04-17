import { Box, Typography, Stack, Divider, Avatar } from '@mui/material';

// Datos de ejemplo basados en tu perfil
const USER_DATA = {
  nombres: 'Angel',
  apellidos: 'Rios',
  email: 'angel.rios@example.com',
  rol: 'Backend Engineer',
  institucion: 'UAEMéx / Oracle'
};

export const ProfileDetails = () => {
  return (
    <Box sx={{ width: '100%' }}>
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
          AR
        </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            {USER_DATA.nombres} {USER_DATA.apellidos}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {USER_DATA.rol} — {USER_DATA.institucion}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2.5}>
        <DataRow label="Correo Electrónico" value={USER_DATA.email} />
        <Divider />
        <DataRow label="ID de Usuario" value="USR-9421-SGIR" isMono />
        <Divider />
        <DataRow label="Miembro desde" value="Abril 2026" />
      </Stack>
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