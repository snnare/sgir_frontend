import React from 'react';
import { Box, Button, Tooltip, type SxProps, type Theme } from '@mui/material';

export interface FloatingActionItem {
  label: string;
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit";
  onClick: () => void;
}

interface FloatingActionGroupProps {
  items: FloatingActionItem[];
  sx?: SxProps<Theme>;
}

/**
 * Patrón de UI: Grupo de Acciones Flotantes (FAB Stack)
 * Ubica una pila vertical de botones circulares con tooltips en la esquina inferior derecha.
 */
export const FloatingActionGroup: React.FC<FloatingActionGroupProps> = ({ items, sx }) => {
  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 32, 
        right: 32, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        zIndex: 1100, // Por encima de la mayoría de componentes, debajo de modales
        ...sx 
      }}
    >
      {items.map((item, index) => (
        <Tooltip key={index} title={item.label} placement="left">
          <Button
            variant="contained"
            color={item.color || "primary"}
            onClick={item.onClick}
            sx={{ 
              borderRadius: '50%', 
              width: 56, 
              height: 56, 
              minWidth: 0,
              boxShadow: 3,
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s'
              }
            }}
          >
            {item.icon}
          </Button>
        </Tooltip>
      ))}
    </Box>
  );
};
