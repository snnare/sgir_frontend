import { Paper, Typography, Box, Stack } from '@mui/material';
import { type ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  percent: number; // Para lógica de colores
}

export const MetricCard = ({ title, value, unit, icon, percent }: MetricCardProps) => {
  // Lógica de color Poimandres técnica
  const getStatusColor = () => {
    if (percent > 85) return '#ef4444'; // Critical - Red
    if (percent > 70) return '#f59e0b'; // Warning - Amber
    return 'text.secondary'; // Normal
  };

  return (
    <Paper sx={{ p: 2.5, flex: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
        <Box sx={{ color: getStatusColor() }}>{icon}</Box>
      </Stack>

      <Stack direction="row" alignItems="baseline" spacing={0.5}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {unit}
        </Typography>
      </Stack>

      {/* Barra de progreso sutil técnica */}
      <Box sx={{ mt: 2, width: '100%', height: 4, bgcolor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            width: `${percent}%`, 
            height: '100%', 
            bgcolor: percent > 85 ? '#ef4444' : 'text.primary',
            transition: 'width 0.5s ease-in-out'
          }} 
        />
      </Box>
    </Paper>
  );
};