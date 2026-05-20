import { IconButton, Tooltip, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

interface BackButtonProps {
  to?: string; // Ruta específica o -1 por defecto
  label?: string; // Texto para el tooltip/botón
  variant?: 'icon' | 'text' | 'dual'; // Variante visual
}

export const BackButton = ({ to, label = "Volver", variant = 'dual' }: BackButtonProps) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  if (variant === 'text') {
    return (
      <Button
        onClick={handleBack}
        startIcon={<ArrowBackIcon fontSize="small" />}
        sx={{
          color: 'text.secondary',
          textTransform: 'none',
          fontWeight: 600,
          p: 0.5,
          px: 1.5,
          ml: -1.5,
          mb: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: 'text.primary',
            bgcolor: 'action.hover',
            transform: 'translateX(-4px)',
          },
        }}
      >
        {label}
      </Button>
    );
  }

  if (variant === 'icon') {
    return (
      <Tooltip title={label} placement="right">
        <IconButton
          onClick={handleBack}
          sx={{
            color: 'text.secondary',
            p: 1,
            ml: -1.5, // Alineación óptica
            mb: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              color: 'text.primary',
              bgcolor: 'action.hover',
              transform: 'translateX(-4px)',
            },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  // default 'dual' variant with Home & Back squircle buttons
  return (
    <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
      <Tooltip title="Ir al Panel de Control">
        <IconButton 
          onClick={() => navigate('/')}
          sx={{ 
            bgcolor: 'action.hover', 
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': { 
              bgcolor: 'action.selected',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <HomeIcon fontSize="small" color="action" />
        </IconButton>
      </Tooltip>

      <Tooltip title={label}>
        <IconButton 
          onClick={handleBack}
          sx={{ 
            bgcolor: 'action.hover', 
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': { 
              bgcolor: 'action.selected',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" color="action" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};