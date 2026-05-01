import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, TextField, Button, Stack, MenuItem, 
  InputAdornment, IconButton, CircularProgress, Typography 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import DnsIcon from '@mui/icons-material/Dns'; 
import StorageIcon from '@mui/icons-material/Storage';
import { CredentialCreateSchema, type CredentialCreateInput, type Dbms } from '../api/types';
import { createCredential, getDbms } from '../api/infrastructureService';
import { useNotificationStore } from './GlobalNotification';

interface CredentialFormProps {
  serverId?: number;
  serverIp?: string; // Prop opcional para la IP
  onSuccess?: () => void;
}

// Interfaz extendida temporalmente para incluir los campos visuales
interface ExtendedCredentialInput extends CredentialCreateInput {
  id_dbms?: number;
  puerto?: number;
}

export const CredentialForm = ({ serverId, serverIp, onSuccess }: CredentialFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbmsList, setDbmsList] = useState<Dbms[]>([]);
  const { showNotification } = useNotificationStore();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ExtendedCredentialInput>({
    resolver: zodResolver(CredentialCreateSchema), // Validará la parte de CredentialCreateInput
    defaultValues: {
      id_servidor: serverId,
      id_estado_credencial: 1,
    }
  });

  const tipoAcceso = useWatch({ control, name: 'id_tipo_acceso' });
  const isDbNative = tipoAcceso === 2; // Asumiendo que 2 es "DB Native"
  const selectedDbmsId = useWatch({ control, name: 'id_dbms' });

  useEffect(() => {
    const fetchDbms = async () => {
      try {
        const data = await getDbms();
        setDbmsList(data);
      } catch (error) {
        console.error("Error al cargar lista de DBMS:", error);
      }
    };
    if (isDbNative && dbmsList.length === 0) {
      fetchDbms();
    }
  }, [isDbNative, dbmsList.length]);

  // Efecto para autocompletar el puerto basado en el motor seleccionado
  useEffect(() => {
    if (selectedDbmsId && dbmsList.length > 0) {
      const selectedDbms = dbmsList.find(d => d.id_dbms === selectedDbmsId);
      if (selectedDbms) {
        const name = selectedDbms.nombre_dbms.toLowerCase();
        if (name.includes('mysql')) setValue('puerto', 3306);
        else if (name.includes('postgres')) setValue('puerto', 5432);
        else if (name.includes('oracle')) setValue('puerto', 1521);
        else if (name.includes('mongo')) setValue('puerto', 27017);
        else if (name.includes('sql server') || name.includes('sqlserver')) setValue('puerto', 1433);
      }
    }
  }, [selectedDbmsId, dbmsList, setValue]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleTestConnection = () => {
    const values = getValues();
    let payload;
    let endpoint = '';

    if (values.id_tipo_acceso === 2) {
      // Monitoreo DB
      const selectedDbms = dbmsList.find(d => d.id_dbms === values.id_dbms);
      const motor = selectedDbms?.nombre_dbms.toLowerCase() || 'desconocido';
      
      // Construimos el endpoint teórico
      endpoint = `/conexion/test/db/${motor}`;
      
      payload = {
        direccion_ip: serverIp || '0.0.0.0', // Inyectamos la IP del servidor
        puerto: values.puerto,
        usuario: values.usuario,
        password: values.password_hash
      };
    } else {
      // Monitoreo SSH (id_tipo_acceso === 1 u otros)
      endpoint = `/conexion/test/ssh`;
      payload = {
        direccion_ip: serverIp || '0.0.0.0', // Inyectamos la IP del servidor
        usuario: values.usuario,
        password: values.password_hash
      };
    }

    console.log(`Disparando a ${endpoint}`, payload);
    showNotification(`Simulando petición a ${endpoint} para la IP ${serverIp || '0.0.0.0'}. Revisa la consola.`, 'info');
  };

  const onSubmit = async (data: ExtendedCredentialInput) => {
    if (!data.id_servidor) {
      showNotification('Error: ID de servidor no encontrado', 'error');
      return;
    }

    setLoading(true);
    try {
      // Por ahora solo enviaremos la parte de la credencial como estaba antes.
      const payload: CredentialCreateInput = {
        usuario: data.usuario,
        password_hash: data.password_hash,
        id_tipo_acceso: data.id_tipo_acceso,
        id_servidor: data.id_servidor,
        id_estado_credencial: data.id_estado_credencial,
      };

      await createCredential(payload);
      showNotification('Credencial guardada correctamente', 'success');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      showNotification(error.response?.data?.detail || 'Error al guardar la credencial', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>

        {/* Tipo de Acceso */}
        <TextField
          select
          fullWidth
          label="Tipo de Acceso"
          {...register('id_tipo_acceso', { valueAsNumber: true })}
          error={!!errors.id_tipo_acceso}
          helperText={errors.id_tipo_acceso?.message}
          defaultValue=""
          required
        >
          <MenuItem value={1}>SSH (Monitoreo Básico)</MenuItem>
          <MenuItem value={2}>DB Native (Monitoreo BD)</MenuItem>
          <MenuItem value={3}>SFTP</MenuItem>
          <MenuItem value={4}>API</MenuItem>
        </TextField>

        {/* Campos Condicionales de Base de Datos */}
        {isDbNative && (
          <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: 'text.secondary' }}>
              <StorageIcon fontSize="small" /> Detalles de la Instancia DBMS
            </Typography>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Motor de Base de Datos (DBMS)"
                  {...register('id_dbms', { valueAsNumber: true })}
                  defaultValue=""
                  required={isDbNative}
                >
                  {dbmsList.length === 0 ? (
                    <MenuItem value="" disabled>Cargando motores...</MenuItem>
                  ) : (
                    dbmsList.map((dbms) => (
                      <MenuItem key={dbms.id_dbms} value={dbms.id_dbms}>
                        {dbms.nombre_dbms} {dbms.version && `(${dbms.version})`}
                      </MenuItem>
                    ))
                  )}
                </TextField>

                <TextField
                  fullWidth
                  label="Puerto"
                  type="number"
                  placeholder="Ej. 1521, 3306, 5432"
                  {...register('puerto', { valueAsNumber: true })}
                  required={isDbNative}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                />
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Usuario */}
        <TextField
          required
          fullWidth
          label="Nombre de Usuario / Identificador"
          {...register('usuario')}
          error={!!errors.usuario}
          helperText={errors.usuario?.message}
        />

        {/* Password con Toggle de Visibilidad */}
        <TextField
          required
          fullWidth
          label="Contraseña / Token / Secret Key"
          type={showPassword ? 'text' : 'password'}
          {...register('password_hash')}
          error={!!errors.password_hash}
          helperText={errors.password_hash?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Estado de Credencial */}
        <TextField
          select
          fullWidth
          label="Estado de la Credencial"
          {...register('id_estado_credencial', { valueAsNumber: true })}
          defaultValue={1}
        >
          <MenuItem value={1}>Activo</MenuItem>
          <MenuItem value={2}>Inactivo</MenuItem>
        </TextField>

        {/* Fila de Botones de Acción */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleTestConnection}
            startIcon={<DnsIcon fontSize="small" />}
            sx={{ 
              py: 1.5, 
              fontWeight: 600,
              fontSize: '0.9rem',
              borderStyle: 'dashed',
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover'
              }
            }}
          >
            Test Conexión
          </Button>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <KeyIcon />}
            sx={{ 
              py: 1.5, 
              fontWeight: 700,
              fontSize: '0.9rem',
              bgcolor: 'text.primary',
              color: 'background.paper'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Stack>

      </Stack>
    </Box>
  );
};