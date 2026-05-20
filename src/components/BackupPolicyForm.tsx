import { useEffect } from 'react';
import { 
  Box, TextField, Button, Stack, MenuItem, InputAdornment, CircularProgress 
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import { useBackupStore } from '../store/useBackupStore';
import { useNotificationStore } from './GlobalNotification';
import { BackupPolicyCreateSchema, type BackupPolicyCreateInput, type BackupPolicy } from '../api/types';

const BACKUP_TYPES = [
  { id: 1, name: 'Completo' },
  { id: 2, name: 'Incremental' },
  { id: 3, name: 'Diferencial' },
  { id: 4, name: 'Full' },
];

interface Props {
  initialData?: BackupPolicy;
  isEdit?: boolean;
}

export const BackupPolicyForm = ({ initialData, isEdit = false }: Props) => {
  const navigate = useNavigate();
  const { addPolicy, updatePolicy, loading } = useBackupStore();
  const { showNotification } = useNotificationStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<BackupPolicyCreateInput>({
    resolver: zodResolver(BackupPolicyCreateSchema) as any,
    defaultValues: {
      nombre_politica: '',
      descripcion: '',
      frecuencia_horas: 24,
      retencion_dias: 7,
      id_tipo_respaldo: 1,
      id_estado_politica: 1,
    }
  });

  useEffect(() => {
    if (initialData) {
      setValue('nombre_politica', initialData.nombre_politica);
      setValue('descripcion', initialData.descripcion || '');
      setValue('frecuencia_horas', initialData.frecuencia_horas);
      setValue('retencion_dias', initialData.retencion_dias);
      setValue('id_tipo_respaldo', initialData.id_tipo_respaldo);
      setValue('id_estado_politica', initialData.id_estado_politica);
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: BackupPolicyCreateInput) => {
    try {
      if (isEdit && initialData) {
        await updatePolicy(initialData.id_politica, data);
        showNotification('Política actualizada correctamente', 'success');
      } else {
        await addPolicy(data);
        showNotification('Política creada correctamente', 'success');
      }
      navigate('/backups/politicas');
    } catch (error: any) {
      console.error('Error saving policy:', error);
      showNotification(error.response?.data?.detail || 'Error al guardar la política', 'error');
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      <Stack spacing={3}>

        <TextField
          required
          fullWidth
          id="nombre_politica"
          label="Nombre de la Política"
          placeholder="ej. Diaria_Produccion_Standard"
          autoFocus
          {...register('nombre_politica')}
          error={!!errors.nombre_politica}
          helperText={errors.nombre_politica?.message}
        />

        <TextField
          fullWidth
          multiline
          rows={2}
          id="descripcion"
          label="Descripción"
          {...register('descripcion')}
          error={!!errors.descripcion}
          helperText={errors.descripcion?.message}
        />

        {/* Fila de Parámetros Numéricos */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            required
            fullWidth
            type="number"
            id="frecuencia_horas"
            label="Frecuencia"
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">Horas</InputAdornment>,
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon fontSize="small" />
                  </InputAdornment>
                ),
              }
            }}
            {...register('frecuencia_horas', { valueAsNumber: true })}
            error={!!errors.frecuencia_horas}
            helperText={errors.frecuencia_horas?.message}
          />
          <TextField
            required
            fullWidth
            type="number"
            id="retencion_dias"
            label="Retención"
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">Días</InputAdornment>,
                startAdornment: (
                  <InputAdornment position="start">
                    <HistoryIcon fontSize="small" />
                  </InputAdornment>
                ),
              }
            }}
            {...register('retencion_dias', { valueAsNumber: true })}
            error={!!errors.retencion_dias}
            helperText={errors.retencion_dias?.message}
          />
        </Stack>

        {/* Tipo de Respaldo */}
        <TextField
          select
          fullWidth
          id="id_tipo_respaldo"
          label="Tipo de Respaldo"
          defaultValue={initialData?.id_tipo_respaldo || 1}
          required
          {...register('id_tipo_respaldo')}
          error={!!errors.id_tipo_respaldo}
          helperText={errors.id_tipo_respaldo?.message}
        >
          {BACKUP_TYPES.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Estado */}
        <TextField
          select
          fullWidth
          id="id_estado_politica"
          label="Estado de la Política"
          defaultValue={initialData?.id_estado_politica || 1}
          {...register('id_estado_politica')}
          error={!!errors.id_estado_politica}
          helperText={errors.id_estado_politica?.message}
        >
          <MenuItem value={1}>Activo</MenuItem>
          <MenuItem value={2}>Inactivo</MenuItem>
        </TextField>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <BackupTableIcon />}
          sx={{ 
            mt: 2, 
            py: 1.5, 
            fontWeight: 700,
            bgcolor: 'text.primary',
            color: 'background.paper',
            '&:hover': { bgcolor: 'text.secondary' }
          }}
        >
          {isEdit ? 'Guardar Cambios' : 'Crear Política'}
        </Button>
      </Stack>
    </Box>
  );
};