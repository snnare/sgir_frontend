import { useEffect } from 'react';
import { MenuItem, TextField, CircularProgress } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { useInfrastructureStore } from '../store/useInfrastructureStore';

interface StatusSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  filterIds?: number[]; 
}

export const StatusSelect = <T extends FieldValues>({ 
  name, 
  control, 
  label = "Estado",
  required = false,
  filterIds
}: StatusSelectProps<T>) => {
  const { statuses, fetchStatuses, loading } = useInfrastructureStore();

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Filtrar estados si se proporcionan IDs específicos
  const displayedStatuses = filterIds 
    ? statuses.filter(s => filterIds.includes(s.id_estado))
    : statuses;

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field, fieldState: { error } }) => (
        <TextField
          select
          fullWidth
          label={label}
          {...field}
          onChange={(e) => field.onChange(Number(e.target.value))}
          error={!!error}
          helperText={error?.message}
          slotProps={{
            input: {
              endAdornment: loading && <CircularProgress size={20} color="inherit" sx={{ mr: 2 }} />
            }
          }}
        >
          {!loading && displayedStatuses.length > 0 ? (
            displayedStatuses.map((s) => (
              <MenuItem key={s.id_estado} value={s.id_estado}>
                {s.nombre_estado}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="">{loading ? 'Cargando...' : 'Sin opciones'}</MenuItem>
          )}
        </TextField>
      )}
    />
  );
};