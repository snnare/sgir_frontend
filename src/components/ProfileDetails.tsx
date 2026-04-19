import { Box, Typography, Stack, Divider, Avatar, Skeleton } from '@mui/material';
import { useAuthStore } from '../store/useAuthStore';
import { useRoleStore } from '../store/useRoleStore';
import { useEffect, useMemo } from 'react';

export const ProfileDetails = () => {
  const { user } = useAuthStore();
  const { roles, fetchRoles } = useRoleStore();

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [roles.length, fetchRoles]);

  const roleName = useMemo(() => {
    if (!user) return '';
    const role = roles.find(r => r.id_rol === user.id_rol);
    return role ? role.nombre_rol : `Rol #${user.id_rol}`;
  }, [user, roles]);

  if (!user) {
    return (
      <Box sx={{ width: '100%' }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
          </Box>
        </Stack>
        <Stack spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Box key={i}>
              <Skeleton variant="text" />
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  const initials = `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();

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
          {initials}
        </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            {user.nombres} {user.apellidos}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {roleName} — Sistema SGIR
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2.5}>
        <DataRow label="Correo Electrónico" value={user.email} />
        <Divider />
        <DataRow label="ID de Usuario" value={`USR-${user.id_usuario.toString().padStart(4, '0')}-SGIR`} isMono />
        <Divider />
        <DataRow 
          label="Miembro desde" 
          value={user.fecha_creacion ? new Date(user.fecha_creacion).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) : 'N/A'} 
        />
        <Divider />
        <DataRow 
          label="Estado de Cuenta" 
          value={user.id_estado_usuario === 1 ? 'Activo' : 'Inactivo'} 
          color={user.id_estado_usuario === 1 ? 'success.main' : 'error.main'}
        />
      </Stack>
    </Box>
  );
};

const DataRow = ({ label, value, isMono = false, color }: any) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        fontWeight: 600, 
        fontFamily: isMono ? '"JetBrains Mono", monospace' : 'inherit',
        color: color || 'inherit'
      }}
    >
      {value}
    </Typography>
  </Stack>
);