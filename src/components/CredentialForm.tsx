import { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, TextField, Button, Stack, MenuItem, 
  InputAdornment, IconButton, CircularProgress, Typography, Divider 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import DnsIcon from '@mui/icons-material/Dns'; 
import StorageIcon from '@mui/icons-material/Storage';
import ComputerIcon from '@mui/icons-material/Computer';
import { CredentialCreateSchema, type CredentialCreateInput, type Dbms, type Server } from '../api/types';
import { createCredential, getDbms, testConnectionDb, testConnectionSsh, getServers, type ConnectionTestRequest } from '../api/infrastructureService';
import { useNotificationStore } from './GlobalNotification';
import { useInfrastructureStore } from '../store/useInfrastructureStore';

interface CredentialFormProps {
  serverId?: number;
  serverIp?: string;
  onSuccess?: (typeId: number) => void;
}

interface ExtendedCredentialInput extends CredentialCreateInput {
  id_dbms?: number;
  puerto?: number;
}

export const CredentialForm = ({ serverId, serverIp: initialIp, onSuccess }: CredentialFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [dbmsList, setDbmsList] = useState<Dbms[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [currentIp, setCurrentIp] = useState<string | undefined>(initialIp);
  const { showNotification } = useNotificationStore();

  const { servers: globalServers, fetchServers: fetchGlobalServers } = useInfrastructureStore();

  useEffect(() => {
    if (globalServers.length === 0) {
      fetchGlobalServers();
    }
  }, [globalServers.length, fetchGlobalServers]);

  const activeServerId = serverId || watchServerId;
  const currentServer = useMemo(() => {
    return globalServers.find(s => s.id_servidor === activeServerId);
  }, [globalServers, activeServerId]);

  const isLegacy = currentServer?.es_legacy ?? false;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ExtendedCredentialInput>({
    resolver: zodResolver(CredentialCreateSchema) as any,
    defaultValues: {
      id_servidor: serverId,
      id_estado_credencial: 1,
    }
  });

  const tipoAcceso = useWatch({ control, name: 'id_tipo_acceso' });
  const isDbNative = tipoAcceso === 2;
  const selectedDbmsId = useWatch({ control, name: 'id_dbms' });
  const watchServerId = useWatch({ control, name: 'id_servidor' });
  const watchUsuario = useWatch({ control, name: 'usuario' });
  const watchPassword = useWatch({ control, name: 'password' });
  const watchPuerto = useWatch({ control, name: 'puerto' });

  // Lógica para habilitar el botón de Test Connection
  const canTest = useMemo(() => {
    // Validar campos base (Servidor, Tipo Acceso, Usuario, Password)
    const hasBaseFields = (serverId || watchServerId) && tipoAcceso && watchUsuario?.trim() && watchPassword?.trim();
    if (!hasBaseFields) return false;
    
    // Si es DB Native, requiere motor y puerto
    if (isDbNative) {
      return !!selectedDbmsId && !!watchPuerto;
    }
    
    // Para SSH u otros, basta con los base fields
    return true;
  }, [serverId, watchServerId, tipoAcceso, watchUsuario, watchPassword, isDbNative, selectedDbmsId, watchPuerto]);

  // 1. Cargar servidores si estamos en modo "Standalone"
  useEffect(() => {
    if (!serverId) {
      const fetchServers = async () => {
        try {
          const data = await getServers();
          setServers(data);
        } catch (error) {
          console.error("Error al cargar lista de servidores:", error);
        }
      };
      fetchServers();
    }
  }, [serverId]);

  // 2. Sincronizar IP cuando cambia el servidor seleccionado (modo Standalone)
  useEffect(() => {
    if (!serverId && watchServerId && servers.length > 0) {
      const selectedServer = servers.find(s => s.id_servidor === watchServerId);
      if (selectedServer) {
        setCurrentIp(selectedServer.direccion_ip);
      }
    }
  }, [watchServerId, servers, serverId]);

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

  const handleTestConnection = async () => {
    const values = getValues();
    
    if (!currentIp) {
      showNotification('Seleccione un servidor o IP válida para realizar el test', 'error');
      return;
    }
    if (!values.usuario || !values.password) {
      showNotification('Ingrese usuario y contraseña para realizar el test', 'warning');
      return;
    }

    setTesting(true);
    try {
      const payload: ConnectionTestRequest = {
        direccion_ip: currentIp,
        puerto: values.puerto || (values.id_tipo_acceso === 1 ? 22 : undefined),
        usuario: values.usuario,
        password: values.password
      };

      let response;
      if (values.id_tipo_acceso === 2) {
        const selectedDbms = dbmsList.find(d => d.id_dbms === values.id_dbms);
        if (!selectedDbms) {
          showNotification('Seleccione un motor de base de datos', 'warning');
          setTesting(false);
          return;
        }
        const motorKey = selectedDbms.nombre_dbms.toLowerCase().split(' ')[0];
        const motorPath = motorKey === 'oracle' 
          ? (isLegacy ? 'oracle/legacy' : 'oracle/no-legacy') 
          : motorKey;
        
        response = await testConnectionDb(motorPath, payload);
      } else {
        response = await testConnectionSsh(payload);
      }

      if (response.status === 'success') {
        showNotification(response.message, 'success');
      } else {
        showNotification(response.message || 'La conexión falló', 'error');
      }
    } catch (error: any) {
      console.error('Error en Test Conexión:', error);
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail) 
        ? detail.map((d: any) => d.msg).join(', ')
        : (typeof detail === 'string' ? detail : 'Error al intentar conectar con el servidor');
      showNotification(message, 'error');
    } finally {
      setTesting(false);
    }
  };

  const onSubmit = async (data: ExtendedCredentialInput) => {
    if (!data.id_servidor) {
      showNotification('Error: Debe seleccionar un servidor destino', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: CredentialCreateInput = {
        usuario: data.usuario,
        password: data.password,
        id_tipo_acceso: data.id_tipo_acceso,
        id_servidor: data.id_servidor,
        id_estado_credencial: data.id_estado_credencial,
      };

      await createCredential(payload);
      showNotification('Credencial guardada correctamente', 'success');
      if (onSuccess) onSuccess(payload.id_tipo_acceso);
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail) 
        ? detail.map((d: any) => `${d.loc?.[d.loc.length - 1] || 'Campo'}: ${d.msg}`).join(', ')
        : (typeof detail === 'string' ? detail : 'Error al guardar la credencial');
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit as any)} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        
        {/* Selector de Servidor (Solo en modo Standalone) */}
        {!serverId && (
          <>
            <TextField
              select
              fullWidth
              label="Servidor Destino"
              {...register('id_servidor', { valueAsNumber: true })}
              error={!!errors.id_servidor}
              helperText={errors.id_servidor?.message || 'Seleccione el activo al que pertenece esta credencial'}
              defaultValue=""
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <ComputerIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    </InputAdornment>
                  ),
                }
              }}
            >
              {servers.map((s) => (
                <MenuItem key={s.id_servidor} value={s.id_servidor}>
                  {s.nombre_servidor} ({s.direccion_ip})
                </MenuItem>
              ))}
            </TextField>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </>
        )}

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
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
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
            disabled={testing || !canTest}
            startIcon={testing ? <CircularProgress size={20} /> : <DnsIcon fontSize="small" />}
            sx={{ 
              py: 1.5, 
              fontWeight: 600,
              fontSize: '0.9rem',
              borderStyle: 'dashed',
              color: canTest ? 'text.secondary' : 'text.disabled',
              borderColor: canTest ? 'divider' : 'rgba(0,0,0,0.08)',
              opacity: canTest ? 1 : 0.6,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: canTest ? 'text.secondary' : 'rgba(0,0,0,0.08)',
                bgcolor: canTest ? 'action.hover' : 'transparent'
              },
              '&.Mui-disabled': {
                borderStyle: 'dashed',
                borderColor: 'rgba(0,0,0,0.08)',
                color: 'text.disabled'
              }
            }}
          >
            {testing ? 'Probando...' : 'Test Conexión'}
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