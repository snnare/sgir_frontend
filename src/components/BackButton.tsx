import { IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BackButtonProps {
  to?: string; // Ruta específica o -1 por defecto
  label?: string; // Texto para el tooltip
}

export const BackButton = ({ to, label = "Volver" }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Tooltip title={label} placement="right">
      <IconButton
        onClick={() => (to ? navigate(to) : navigate(-1))}
        sx={{
          color: 'text.secondary',
          p: 1,
          ml: -1.5, // Alineación óptica: el icono se alinea con el texto de abajo
          mb: 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: 'text.primary',
            bgcolor: 'action.hover',
            transform: 'translateX(-4px)', // Pequeña animación técnica
          },
        }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};