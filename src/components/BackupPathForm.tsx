import { useEffect } from 'react';
import { 
  Box, TextField, Button, Stack, MenuItem, InputAdornment, CircularProgress 
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import StorageIcon from '@mui/icons-material/Storage';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import SaveIcon from '@mui/icons-material/Save';
import DnsIcon from '@mui/icons-material/Dns';
import { BackupPathCreateSchema, type BackupPathCreateInput, type BackupPath } from '../api/types';
import { useInfrastructureStore } from '../store/useInfrastructureStore';
import { createBackupPath, updateBackupPath } from '../api/backupService';
import { useNotificationStore } from './GlobalNotification';
import { useNavigate, useLocation } from 'react-router-dom';

const STORAGE_TYPES = [
  { id: 1, name: 'Disco Local' },
  { id: 2, name: 'S3 Cloud' },
  { id: 3, name: 'NFS/NAS' },
  { id: 4, name: 'SAN/Fibre Channel' },
  { id: 5, name: 'NFS' },
];

interface BackupPathFormProps {
  initialData?: BackupPath;
  isEdit?: boolean;
}

export const BackupPathForm = ({ initialData, isEdit = false }: BackupPathFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { servers, fetchServers, loading: infraLoading } = useInfrastructureStore();
  const { showNotification } = useNotificationStore();

  const preselectedServerId = location.state?.serverId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<BackupPathCreateInput>({
    resolver: zodResolver(BackupPathCreateSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      id_servidor: initialData.id_servidor || undefined
    } : {
      id_estado_ruta: 1,
      id_servidor: preselectedServerId || undefined
    }
  });

  useEffect(() => {
    fetchServers();
    if (initialData) {
      reset({
        ...initialData,
        id_servidor: initialData.id_servidor || undefined
      });
    }
  }, [fetchServers, initialData, reset]);

  const onSubmit = async (data: BackupPathCreateInput) => {
    try {
      if (isEdit && initialData) {
        await updateBackupPath(initialData.id_ruta, data);
        showNotification('Ruta de respaldo actualizada correctamente', 'success');
      } else {
        await createBackupPath(data);
        showNotification('Ruta de respaldo registrada correctamente', 'success');
      }
      navigate('/backups/rutas');
    } catch (error: any) {
      console.error('Error saving backup path:', error);
      showNotification(error.response?.data?.detail || 'Error al guardar la ruta', 'error');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>

        {/* Servidor Vinculado */}
        <TextField
          select
          fullWidth
          label="Servidor Vinculado"
          {...register('id_servidor', { valueAsNumber: true })}
          error={!!errors.id_servidor}
          helperText={errors.id_servidor?.message}
          disabled={infraLoading}
          defaultValue={preselectedServerId || ""}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <DnsIcon fontSize="small" />
                </InputAdornment>
              ),
            }
          }}
        >
          {servers.map((server) => (
            <MenuItem key={server.id_servidor} value={server.id_servidor}>
              {server.nombre_servidor} ({server.direccion_ip})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          fullWidth
          label="Descripción de la Ruta"
          placeholder="ej. Almacenamiento Local de Emergencia"
          {...register('descripcion_ruta')}
          error={!!errors.descripcion_ruta}
          helperText={errors.descripcion_ruta?.message}
        />

        <TextField
          required
          fullWidth
          label="Path / URI de Destino"
          placeholder="ej. /mnt/backups/db o s3://my-bucket/backup"
          {...register('path')}
          error={!!errors.path}
          helperText={errors.path?.message}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FolderOpenIcon fontSize="small" />
                </InputAdornment>
              ),
            }
          }}
        />

        {/* Tipo de Almacenamiento */}
        <TextField
          select
          fullWidth
          label="Tipo de Almacenamiento"
          {...register('id_tipo_almacenamiento', { valueAsNumber: true })}
          error={!!errors.id_tipo_almacenamiento}
          helperText={errors.id_tipo_almacenamiento?.message}
          defaultValue=""
        >
          {STORAGE_TYPES.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                {type.id === 2 ? <CloudQueueIcon fontSize="inherit" /> : <StorageIcon fontSize="inherit" />}
                <span>{type.name}</span>
              </Stack>
            </MenuItem>
          ))}
        </TextField>

        {/* Estado */}
        <TextField
          select
          fullWidth
          label="Estado de la Ruta"
          {...register('id_estado_ruta', { valueAsNumber: true })}
          defaultValue={1}
        >
          <MenuItem value={1}>Activo</MenuItem>
          <MenuItem value={2}>Inactivo</MenuItem>
        </TextField>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{ 
            mt: 2, 
            py: 1.5, 
            fontWeight: 700,
            bgcolor: 'text.primary',
            color: 'background.paper',
            '&:hover': { bgcolor: 'grey.800' }
          }}
        >
          Guardar
        </Button>
      </Stack>
    </Box>
  );
};