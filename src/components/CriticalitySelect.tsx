import { useEffect } from 'react';
import { MenuItem, TextField, CircularProgress } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { useInfrastructureStore } from '../store/useInfrastructureStore';

interface CriticalitySelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
}

export const CriticalitySelect = <T extends FieldValues>({ 
  name, 
  control, 
  label = "Nivel de Criticidad",
  required = false
}: CriticalitySelectProps<T>) => {
  // Consumimos el Store centralizado
  const { criticalities, fetchCriticalities, loading } = useInfrastructureStore();

  useEffect(() => {
    // La acción fetchCriticalities ahora tiene lógica de caché interna
    fetchCriticalities();
  }, [fetchCriticalities]);

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
          {/* Si no está cargando y hay datos, los mostramos */}
          {!loading && criticalities.length > 0 ? (
            criticalities.map((c) => (
              <MenuItem key={c.id_nivel_criticidad} value={c.id_nivel_criticidad}>
                {c.nombre_nivel} {c.descripcion ? `- ${c.descripcion}` : ''}
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