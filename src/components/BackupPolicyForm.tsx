import { useEffect, useState } from 'react';
import { 
  Box, TextField, Button, Stack, MenuItem, InputAdornment, CircularProgress, Divider, Typography
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

// Helper para parsear líneas de crontab y extraer campos clave
const parseCrontabLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;

  // Determinar número de campos cron antes del comando
  let cronFieldsCount = 5;
  if (parts.length === 5) {
    cronFieldsCount = 4;
  } else if (parts.length === 4) {
    cronFieldsCount = 3;
  } else if (parts.length >= 6) {
    cronFieldsCount = 5;
  }

  const cronParts = parts.slice(0, cronFieldsCount);
  const commandParts = parts.slice(cronFieldsCount);
  const command = commandParts.join(' ');
  const cronExpr = cronParts.join(' ');

  let hourStr = '';
  let dayOfWeekStr = '';
  let frequency = 24;

  if (cronFieldsCount === 5) {
    const [min, hour, , , dow] = cronParts;
    
    if (hour !== '*' && !hour.includes('/') && !hour.includes(',') && !hour.includes('-')) {
      const h = parseInt(hour, 10);
      const m = min !== '*' ? parseInt(min, 10) : 0;
      if (!isNaN(h) && !isNaN(m)) {
        hourStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
      }
    } else if (hour.startsWith('*/')) {
      const freq = parseInt(hour.substring(2), 10);
      if (!isNaN(freq)) frequency = freq;
    } else if (hour === '*') {
      frequency = 1;
    }

    if (dow !== '*') {
      dayOfWeekStr = dow;
    }
  } else if (cronFieldsCount === 4) {
    const [hour, , , dow] = cronParts;
    
    if (hour !== '*' && !hour.includes('/') && !hour.includes(',') && !hour.includes('-')) {
      const h = parseInt(hour, 10);
      if (!isNaN(h)) {
        hourStr = `${h.toString().padStart(2, '0')}:00:00`;
      }
    } else if (hour === '*') {
      frequency = 1;
    }

    if (dow !== '*') {
      dayOfWeekStr = dow;
    }
  }

  return {
    cronExpr,
    command,
    hourStr,
    dayOfWeekStr,
    frequency
  };
};

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

  const [cronPreset, setCronPreset] = useState<string>('custom');
  const [crontabInput, setCrontabInput] = useState<string>('');

  const handleCrontabInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCrontabInput(val);
    
    const parsed = parseCrontabLine(val);
    if (parsed) {
      if (parsed.cronExpr) {
        setValue('expression_cron', parsed.cronExpr);
        setCronPreset(getPresetFromCron(parsed.cronExpr));
      }
      if (parsed.command) {
        setValue('script_path', parsed.command);
      }
      if (parsed.hourStr) {
        setValue('hora_ejecuccion', parsed.hourStr);
      }
      if (parsed.dayOfWeekStr) {
        setValue('dias_semana', parsed.dayOfWeekStr);
      }
      if (parsed.frequency) {
        setValue('frecuencia_horas', parsed.frequency);
      }
      showNotification('Campos auto-completados desde la línea de crontab', 'success');
    }
  };

  const getPresetFromCron = (cron: string): string => {
    if (!cron) return 'custom';
    switch (cron.trim()) {
      case '0 0 * * *': return 'daily';
      case '0 0 * * 0': return 'weekly';
      case '0 0 1 * *': return 'monthly';
      case '0 * * * *': return 'hourly';
      default: return 'custom';
    }
  };

  const handlePresetChange = (preset: string) => {
    setCronPreset(preset);
    if (preset === 'daily') {
      setValue('expression_cron', '0 0 * * *');
    } else if (preset === 'weekly') {
      setValue('expression_cron', '0 0 * * 0');
    } else if (preset === 'monthly') {
      setValue('expression_cron', '0 0 1 * *');
    } else if (preset === 'hourly') {
      setValue('expression_cron', '0 * * * *');
    } else if (preset === 'custom') {
      setValue('expression_cron', '');
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BackupPolicyCreateInput>({
    resolver: zodResolver(BackupPolicyCreateSchema) as any,
    defaultValues: {
      nombre_politica: '',
      descripcion: '',
      expression_cron: '',
      hora_ejecuccion: '',
      dias_semana: '',
      frecuencia_horas: 24,
      retencion_dias: 7,
      script_path: '',
      id_tipo_respaldo: 1,
      id_estado_politica: 1,
    }
  });

  // Observa los cambios del formulario para forzar el re-render de React y permitir que MUI contraiga (shrink) las etiquetas automáticamente
  watch();

  useEffect(() => {
    if (initialData) {
      setValue('nombre_politica', initialData.nombre_politica);
      setValue('descripcion', initialData.descripcion || '');
      setValue('expression_cron', initialData.expression_cron || '');
      setValue('hora_ejecuccion', initialData.hora_ejecuccion || '');
      setValue('dias_semana', initialData.dias_semana || '');
      setValue('frecuencia_horas', initialData.frecuencia_horas);
      setValue('retencion_dias', initialData.retencion_dias);
      setValue('script_path', initialData.script_path || '');
      setValue('id_tipo_respaldo', initialData.id_tipo_respaldo);
      setValue('id_estado_politica', initialData.id_estado_politica);
      setCronPreset(getPresetFromCron(initialData.expression_cron || ''));
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

        <TextField
          fullWidth
          id="crontab_input"
          label="Expresión Crontab de Importación Rápida"
          placeholder="ej. * * * 4 backup.sh o 0 4 * * 1-5 /var/scripts/backup.sh"
          value={crontabInput}
          onChange={handleCrontabInputChange}
          helperText="Pega una línea de crontab válida para auto-llenar los campos automáticamente"
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
              },
              inputLabel: { shrink: true }
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
              },
              inputLabel: { shrink: true }
            }}
            {...register('retencion_dias', { valueAsNumber: true })}
            error={!!errors.retencion_dias}
            helperText={errors.retencion_dias?.message}
          />
        </Stack>

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'primary.main', mb: 1 }}>
          Planificación Avanzada y Automatización (Opcional)
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            select
            fullWidth
            label="Planificador Rápido (Frecuencia)"
            value={cronPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <MenuItem value="daily">Diario (Cada medianoche - 0 0 * * *)</MenuItem>
            <MenuItem value="weekly">Semanal (Domingos medianoche - 0 0 * * 0)</MenuItem>
            <MenuItem value="monthly">Mensual (Día 1 medianoche - 0 0 1 * *)</MenuItem>
            <MenuItem value="hourly">Cada hora (0 * * * *)</MenuItem>
            <MenuItem value="custom">Personalizado (Manual)</MenuItem>
          </TextField>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            id="expression_cron"
            label={cronPreset !== 'custom' ? "Expresión Cron Generada" : "Expresión Cron"}
            placeholder="ej. 0 4 * * 1-5"
            disabled={cronPreset !== 'custom'}
            slotProps={{
              input: {
                readOnly: cronPreset !== 'custom'
              },
              inputLabel: { shrink: true }
            }}
            {...register('expression_cron')}
            error={!!errors.expression_cron}
            helperText={errors.expression_cron?.message || "Patrón cron estándar (minuto hora día-mes mes día-semana)"}
          />
          <TextField
            fullWidth
            id="hora_ejecuccion"
            label="Hora de Ejecución"
            placeholder="ej. 04:00:00"
            slotProps={{
              inputLabel: { shrink: true }
            }}
            {...register('hora_ejecuccion')}
            error={!!errors.hora_ejecuccion}
            helperText={errors.hora_ejecuccion?.message || "Formato de hora de 24h (HH:MM:SS)"}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            id="dias_semana"
            label="Días de la Semana"
            placeholder="ej. 1,2,3,4,5 o L,M,M,J,V"
            slotProps={{
              inputLabel: { shrink: true }
            }}
            {...register('dias_semana')}
            error={!!errors.dias_semana}
            helperText={errors.dias_semana?.message || "Lista de días separados por comas"}
          />
          <TextField
            fullWidth
            id="script_path"
            label="Ruta del Script de Respaldo"
            placeholder="ej. /var/scripts/backup_mysql.sh"
            slotProps={{
              inputLabel: { shrink: true }
            }}
            {...register('script_path')}
            error={!!errors.script_path}
            helperText={errors.script_path?.message || "Ubicación del ejecutable o script en el host"}
          />
        </Stack>

        <Divider sx={{ my: 1 }} />

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
          {isEdit ? 'Guardar' : 'Crear Política'}
        </Button>
      </Stack>
    </Box>
  );
};