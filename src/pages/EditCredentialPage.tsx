import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, TextField, MenuItem, Stack, InputAdornment, IconButton, Skeleton, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SpeedIcon from '@mui/icons-material/Speed';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  getCredentialById, updateCredential, getServers,
  testConnectionDb, testConnectionSsh, getInstancesByServer, getDbms
} from '../api/infrastructureService';
import { 
  CredentialUpdateSchema, type CredentialUpdateInput, type Server 
} from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
import { FormPageLayout } from '../components/FormPageLayout';

export const EditCredentialPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [dbmsList, setDbmsList] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CredentialUpdateInput>({
    resolver: zodResolver(CredentialUpdateSchema),
    defaultValues: {
      id_servidor: '' as any,
      id_tipo_acceso: '' as any,
      usuario: '',
      password: '',
      id_estado_credencial: '' as any,
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [credData, serversData, dbmsData] = await Promise.all([
          getCredentialById(Number(id)),
          getServers(),
          getDbms()
        ]);
        setServers(serversData);
        setDbmsList(dbmsData);
        // Reseteamos el formulario con los valores actuales
        reset({
          usuario: credData.usuario,
          id_tipo_acceso: credData.id_tipo_acceso,
          id_servidor: credData.id_servidor,
          id_estado_credencial: credData.id_estado_credencial,
        });
      } catch (error) {
        console.error('Error fetching credential data:', error);
        showNotification('Error al cargar los datos de la credencial', 'error');
        navigate('/credenciales');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset, navigate, showNotification]);

  const handleTestConnection = async () => {
    const values = getValues();
    const serverId = values.id_servidor;
    if (!serverId) {
      showNotification('Seleccione un servidor válido para realizar el test', 'error');
      return;
    }
    const selectedServer = servers.find(s => s.id_servidor === serverId);

    if (!selectedServer) {
      showNotification('Seleccione un servidor válido para realizar el test', 'error');
      return;
    }

    if (!values.usuario || !values.password) {
      showNotification('Ingrese usuario y contraseña para realizar el test', 'warning');
      return;
    }

    setTesting(true);
    try {
      const payload: any = {
        direccion_ip: selectedServer.direccion_ip,
        puerto: values.id_tipo_acceso === 1 ? 22 : undefined,
        usuario: values.usuario,
        password: values.password
      };

      let response;
      if (values.id_tipo_acceso === 2) {
        // Consultar instancias del servidor para identificar el motor de base de datos
        const instances = await getInstancesByServer(serverId).catch(() => []);
        if (instances.length === 0) {
          showNotification('No se encontraron instancias de base de datos en este servidor para testear', 'warning');
          setTesting(false);
          return;
        }

        const firstInst = instances[0];
        const dbms = dbmsList.find(d => d.id_dbms === firstInst.id_dbms);
        const motorKey = (dbms?.nombre_dbms || 'oracle').toLowerCase().split(' ')[0];
        
        // Determinar motorKey
        const motorPath = motorKey === 'oracle' ? 'oracle/no-legacy' : motorKey;
        if (motorKey === 'oracle') {
          payload.oracle_sid = firstInst.nombre_instancia || 'ORCL';
        }
        
        response = await testConnectionDb(motorPath, payload);
      } else if (values.id_tipo_acceso === 1) {
        response = await testConnectionSsh(payload);
      } else {
        showNotification('El test de conexión solo está disponible para accesos SSH o DB Native', 'info');
        setTesting(false);
        return;
      }

      if (response.status === 'success') {
        showNotification(response.message, 'success');
      } else {
        showNotification(response.message || 'La conexión falló', 'error');
      }
    } catch (error: any) {
      console.error('Error en Test Conexión:', error);
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : 'Error al intentar conectar con el servidor';
      showNotification(message, 'error');
    } finally {
      setTesting(false);
    }
  };

  const onSubmit = async (data: CredentialUpdateInput) => {
    if (!id) return;
    setSaving(true);
    try {
      // Eliminamos campos vacíos para el PUT parcial
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
      );

      await updateCredential(Number(id), filteredData as CredentialUpdateInput);
      showNotification('Credencial actualizada correctamente', 'success');
      navigate('/credenciales');
    } catch (error: any) {
      console.error('Error updating credential:', error);
      showNotification(error.response?.data?.detail || 'Error al actualizar la credencial', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <FormPageLayout
        title="Editar Credencial"
        subtitle="Cargando configuración de la credencial de acceso..."
        backTo="/credenciales"
        backLabel="Volver a Credenciales"
        maxWidth="sm"
      >
        <Stack spacing={3} sx={{ py: 2 }}>
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={48} variant="rounded" sx={{ mt: 2 }} />
        </Stack>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout
      title="Editar Credencial"
      subtitle="Modifica los datos de acceso o el servidor vinculado."
      backTo="/credenciales"
      backLabel="Volver a Credenciales"
      maxWidth="sm"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* Servidor */}
          <TextField
            select
            fullWidth
            label="Servidor"
            value={watch('id_servidor') ?? ''}
            {...register('id_servidor', { valueAsNumber: true })}
            error={!!errors.id_servidor}
            helperText={errors.id_servidor?.message}
            required
          >
            {servers.map((server) => (
              <MenuItem key={server.id_servidor} value={server.id_servidor}>
                {server.nombre_servidor} ({server.direccion_ip})
              </MenuItem>
            ))}
          </TextField>

          {/* Tipo de Acceso */}
          <TextField
            select
            fullWidth
            label="Tipo de Acceso"
            value={watch('id_tipo_acceso') ?? ''}
            {...register('id_tipo_acceso', { valueAsNumber: true })}
            error={!!errors.id_tipo_acceso}
            helperText={errors.id_tipo_acceso?.message}
            required
          >
            <MenuItem value={1}>SSH (Monitoreo Básico)</MenuItem>
            <MenuItem value={2}>DB Native (Monitoreo BD)</MenuItem>
            <MenuItem value={3}>SFTP</MenuItem>
            <MenuItem value={4}>API</MenuItem>
          </TextField>

          {/* Usuario */}
          <TextField
            required
            fullWidth
            label="Nombre de Usuario"
            {...register('usuario')}
            error={!!errors.usuario}
            helperText={errors.usuario?.message}
          />

          {/* Password (Opcional en edición) */}
          <TextField
            fullWidth
            label="Nueva Contraseña (Dejar en blanco para no cambiar)"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Estado */}
          <TextField
            select
            fullWidth
            label="Estado"
            value={watch('id_estado_credencial') ?? ''}
            {...register('id_estado_credencial', { valueAsNumber: true })}
          >
            <MenuItem value={1}>Activo</MenuItem>
            <MenuItem value={2}>Inactivo</MenuItem>
          </TextField>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              disabled={testing || saving}
              onClick={handleTestConnection}
              startIcon={testing ? <CircularProgress size={20} color="inherit" /> : <SpeedIcon />}
              sx={{ py: 1.5, fontWeight: 700, borderRadius: 2.5 }}
            >
              {testing ? 'Probando...' : 'Test Conexión'}
            </Button>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={saving || testing}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ 
                py: 1.5, 
                fontWeight: 700, 
                bgcolor: 'text.primary',
                color: 'background.paper',
                '&:hover': { bgcolor: 'grey.800' }
              }}
            >
              {saving ? 'Procesando...' : 'Guardar'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </FormPageLayout>
  );
};
