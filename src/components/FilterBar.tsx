import React from 'react';
import { 
  Paper, Stack, TextField, InputAdornment, Divider, 
  Chip, Typography, type SxProps, type Theme 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

export interface FilterOption {
  label: string;
  value: any;
  color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

interface FilterBarProps {
  // Search
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  filters?: FilterOption[];
  activeFilter?: any;
  onFilterChange?: (value: any) => void;
  
  // Actions
  rightActions?: React.ReactNode;  // Usually buttons next to search
  bottomActions?: React.ReactNode; // Usually toggles or stats next to chips
  
  // Stats
  statsLabel?: string;
  
  // Styling
  showFilterIcon?: boolean;
  sx?: SxProps<Theme>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters,
  activeFilter,
  onFilterChange,
  rightActions,
  bottomActions,
  statsLabel,
  showFilterIcon = true,
  sx
}) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, md: 2.5 }, 
        mb: 4, 
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...sx
      }}
    >
      {/* Row 1: Search & Main Actions */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <TextField
          placeholder={searchPlaceholder}
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2, 
                bgcolor: 'action.hover', 
                border: 'none', 
                '& fieldset': { border: 'none' } 
              }
            }
          }}
        />
        {rightActions && (
          <Stack direction="row" spacing={1} alignItems="center">
            {rightActions}
          </Stack>
        )}
      </Stack>

      {/* Row 2: Filters & Bottom Actions */}
      {(filters || bottomActions || statsLabel) && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {showFilterIcon && <FilterListIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />}
              {filters?.map((option) => (
                <Chip 
                  key={String(option.value)}
                  label={option.label} 
                  onClick={() => onFilterChange?.(option.value)}
                  color={activeFilter === option.value ? (option.color || 'primary') : 'default'}
                  variant={activeFilter === option.value ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 600, borderRadius: 1.5 }}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ alignSelf: { xs: 'flex-end', md: 'center' } }}>
              {bottomActions}
              {statsLabel && (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {statsLabel}
                </Typography>
              )}
            </Stack>
          </Stack>
        </>
      )}
    </Paper>
  );
};
