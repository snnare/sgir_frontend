import { Typography, Stack, Tooltip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  isLogout?: boolean;
  open: boolean;
  onClick?: () => void;
  isSubItem?: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
}

export const SidebarItem = ({ 
  icon, 
  label, 
  to, 
  active, 
  isLogout, 
  open, 
  onClick,
  isSubItem = false,
  hasChildren = false,
  expanded = false
}: SidebarItemProps) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleClick = async (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      // Si tiene hijos y no tiene ruta, no navegamos
      if (hasChildren && !to) return;
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
      sx={{ 
        p: 1.2, 
        pl: open && isSubItem ? 4 : 1.2, // Indentación si es sub-item y el sidebar está abierto
        borderRadius: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: active ? 'text.primary' : isLogout ? 'error.main' : 'text.secondary',
        bgcolor: active ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
        position: 'relative',
        alignItems: 'center',
        justifyContent: open ? 'flex-start' : 'center'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
      
      {open && (
        <>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: active ? 600 : 500, 
              whiteSpace: 'nowrap',
              flexGrow: 1
            }}
          >
            {label}
          </Typography>
          
          {hasChildren && (
            expanded ? <ExpandLessIcon fontSize="inherit" /> : <ExpandMoreIcon fontSize="inherit" />
          )}
        </>
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