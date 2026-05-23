import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { type ReactNode } from 'react';
import EditIcon from '@mui/icons-material/Edit';

interface CompactMetricProps {
  label: string;
  value: number;
  unit: string;
  icon: ReactNode;
  disabled?: boolean;
  onAction?: (e: React.MouseEvent) => void;
  actionIcon?: ReactNode;
  tooltipTitle?: string;
}

export const CompactMetric = ({ 
  label, 
  value, 
  unit, 
  icon, 
  disabled = false,
  onAction,
  actionIcon = <EditIcon sx={{ fontSize: 12 }} />,
  tooltipTitle
}: CompactMetricProps) => {
  // Lógica de color inspirada en severidad técnica (PRTG Style)
  const getColors = (val: number) => {
    if (disabled) return { bg: 'transparent', text: '#94a3b8', border: '#e2e8f0', borderStyle: 'dashed' };
    if (val > 90) return { bg: '#fee2e2', text: '#ef4444', border: '#fca5a5', borderStyle: 'solid' }; // Critical
    if (val > 75) return { bg: '#fef3c7', text: '#d97706', border: '#fcd34d', borderStyle: 'solid' }; // Warning
    return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', borderStyle: 'solid' }; // Normal
  };

  const colors = getColors(value);

  return (
    <Tooltip title={tooltipTitle ?? (disabled ? `${label}: No configurado` : `${label}: ${value}${unit}`)}>
      <Box 

        sx={{ 
          flex: 1,
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          py: 0.75,
          px: 1,
          borderRadius: 1.5,
          bgcolor: colors.bg,
          border: '1px',
          borderStyle: colors.borderStyle,
          borderColor: colors.border,
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.5 : 1,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: disabled ? 'none' : 'translateY(-1px)',
            boxShadow: disabled ? 'none' : '0 4px 8px rgba(0,0,0,0.04)',
            borderColor: disabled ? colors.border : colors.text,
            '& .metric-action': { opacity: 1 }
          }
        }}
      >
        <Box sx={{ color: colors.text, display: 'flex', flexShrink: 0 }}>
          {icon}
        </Box>
        
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography 
            variant="caption" 
            noWrap
            sx={{ 
              fontWeight: 800, 
              color: colors.text,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.75rem',
              display: 'block',
              lineHeight: 1
            }}
          >
            {disabled ? '--' : Math.round(value)}{!disabled && unit}
          </Typography>
          <Typography 
            variant="caption" 
            noWrap
            sx={{ 
              fontSize: '0.6rem', 
              fontWeight: 700, 
              color: colors.text, 
              textTransform: 'uppercase',
              opacity: 0.7,
              display: 'block',
              lineHeight: 1,
              mt: 0.1
            }}
          >
            {label}
          </Typography>
        </Box>

        {onAction && !disabled && (
          <IconButton
            className="metric-action"
            size="small"
            onClick={onAction}
            sx={{ 
              position: 'absolute',
              right: 2,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0,
              transition: 'opacity 0.2s',
              bgcolor: colors.bg,
              p: 0.2,
              '&:hover': { bgcolor: colors.border }
            }}
          >
            {actionIcon}
          </IconButton>
        )}
      </Box>
    </Tooltip>
  );
};

