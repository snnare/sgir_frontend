import { Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  isLogout?: boolean;
}

export const SidebarItem = ({ icon, label, to, active, isLogout }: SidebarItemProps) => {
  const navigate = useNavigate();

  return (
    <Stack 
      direction="row" 
      spacing={1.5} 
      onClick={() => navigate(to)}
      sx={{ 
        p: 1.2, 
        borderRadius: 1.5, // Look Poimandres
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        // Colores dinámicos basados en el estado
        color: active ? 'text.primary' : isLogout ? 'error.main' : 'text.secondary',
        bgcolor: active ? 'action.selected' : 'transparent',
        '&:hover': { 
          bgcolor: isLogout ? 'error.lighter' : 'action.hover',
          color: isLogout ? 'error.dark' : 'text.primary'
        }
      }}
    >
      {icon}
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: active ? 600 : 500,
          fontSize: '0.875rem'
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};