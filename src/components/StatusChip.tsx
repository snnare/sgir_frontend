import { Chip } from '@mui/material';

export interface StatusConfig {
  label: string;
  color: "success" | "default" | "warning" | "error" | "info";
}

export const STATUS_MAP: Record<number, StatusConfig> = {
  1: { label: 'ACTIVO', color: 'success' },
  2: { label: 'INACTIVO', color: 'default' },
  3: { label: 'PENDIENTE', color: 'warning' },
  4: { label: 'ÉXITO', color: 'success' },
  5: { label: 'FALLO', color: 'error' },
  6: { label: 'ABIERTA', color: 'warning' },
  7: { label: 'CERRADA', color: 'success' },
  8: { label: 'EN PROGRESO', color: 'info' },
};

interface StatusChipProps {
  statusId: number;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  sx?: object;
}

/**
 * Reusable component to display a status as a Material UI Chip
 * based on the global system status mapping.
 */
export const StatusChip = ({ statusId, variant = 'outlined', size = 'small', sx }: StatusChipProps) => {
  const config = STATUS_MAP[statusId] || { label: 'DESCONOCIDO', color: 'default' };

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={variant}
      size={size}
      sx={{ 
        fontWeight: 700, 
        fontSize: size === 'small' ? '0.6rem' : '0.75rem',
        borderRadius: 1,
        ...sx
      }}
    />
  );
};
