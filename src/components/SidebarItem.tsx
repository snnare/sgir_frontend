import { Typography, Stack, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  isLogout?: boolean;
  open: boolean;
  onClick?: () => void;
}

export const SidebarItem = ({ icon, label, to, active, isLogout, open, onClick }: SidebarItemProps) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }
    
    if (isLogout) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    } else if (to) {
      navigate(to);
    }
  };

  const content = (
    <Stack 
      direction="row" 
      spacing={open ? 1.5 : 0} 
      onClick={handleClick}
      justifyContent={open ? 'flex-start' : 'center'}
      sx={{ 
        p: 1.2, 
        borderRadius: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: active ? 'text.primary' : isLogout ? 'error.main' : 'text.secondary',
        bgcolor: active ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      {icon}
      {open && (
        <Typography variant="body2" sx={{ fontWeight: active ? 600 : 500, whiteSpace: 'nowrap' }}>
          {label}
        </Typography>
      )}
    </Stack>
  );

  // Si está cerrado, mostramos Tooltip para que el usuario sepa qué icono es cada cosa
  return !open ? (
    <Tooltip title={label} placement="right">
      {content}
    </Tooltip>
  ) : content;
};