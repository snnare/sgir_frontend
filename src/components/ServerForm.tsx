import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, TextField, Button, Stack, 
  CircularProgress, FormControlLabel, Switch, Tooltip, IconButton,
  Collapse, Typography, MenuItem
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HelpIcon from '@mui/icons-material/Help';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';
import { ServerCreateSchema, type ServerCreateInput } from '../api/types';
import { createServer, checkServerByIp, pingServer, createInstance } from '../api/infrastructureService';
import { useNotificationStore } from './GlobalNotification';
import { CriticalitySelect } from './CriticalitySelect';
import { StatusSelect } from './StatusSelect';
import { useInfrastructureStore } from '../store/useInfrastructureStore';

interface ServerFormProps {
  onSuccess?: (serverId: number, ip: string) => void;
  monitoreoHost?: boolean;
  monitoreoDb?: boolean;
  isWizardMode?: boolean;
  initialData?: ServerCreateInput | null;
  initialDbInstance?: {
    id_dbms: number;
    nombre_instancia: string;
    puerto: number;
    sid?: string;
  } | null;
  onSubmitData?: (serverData: ServerCreateInput, dbInstanceData?: any) => Promise<void> | void;
}

export const ServerForm = ({ 
  onSuccess, 
  monitoreoHost = false, 
  monitoreoDb = false,
  isWizardMode = false,
  initialData = null,
  initialDbInstance = null,
  onSubmitData
}: ServerFormProps) => {
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const { dbmsList, fetchDbmsList } = useInfrastructureStore();
  
  // Estados para base de datos
  const [dbmsId, setDbmsId] = useState<string>(initialDbInstance?.id_dbms ? String(initialDbInstance.id_dbms) : '');
  const [nombreInstancia, setNombreInstancia] = useState(initialDbInstance?.nombre_instancia || '');
  const [puerto, setPuerto] = useState(initialDbInstance?.puerto ? String(initialDbInstance.puerto) : '');
  const [sid, setSid] = useState(initialDbInstance?.sid || '');

  // Cargar RDBMS list
  useEffect(() => {
    if (monitoreoDb && dbmsList.length === 0) {
      fetchDbmsList();
    }
  }, [monitoreoDb, dbmsList.length, fetchDbmsList]);

  const selectedDbmsObj = dbmsList.find(d => d.id_dbms === Number(dbmsId));
  const isOracle = selectedDbmsObj?.nombre_dbms.toLowerCase().includes('oracle');

  // Ajustar puertos por defecto según el motor seleccionado
  useEffect(() => {
    if (selectedDbmsObj) {
      const name = selectedDbmsObj.nombre_dbms.toLowerCase();
      if (name.includes('mysql')) setPuerto('3306');
      else if (name.includes('oracle')) setPuerto('1521');
      else if (name.includes('mongo')) setPuerto('27017');
      else if (name.includes('postgres')) setPuerto('5432');
    }
  }, [dbmsId, selectedDbmsObj]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ServerCreateInput>({
    resolver: zodResolver(ServerCreateSchema),
    defaultValues: initialData || {
      id_nivel_criticidad: 1, 
      id_estado_servidor: 1, 
      es_legacy: false,
      monitoreo_host: monitoreoHost,
      monitoreo_db: monitoreoDb,
    }
  });

  const ipValue = watch('direccion_ip');

  const handleCheckIp = async () => {
    if (!ipValue || errors.direccion_ip) {
      showNotification('Por favor, ingrese una IP válida para verificar', 'warning');
      return;
    }

    setChecking(true);
    try {
      // 1. Validación de Registro (DB)
      const checkData = await checkServerByIp(ipValue);
      
      // Si el backend devuelve el servidor (200), significa que ya existe.
      // Si devuelve 404, checkData suele tener un campo 'detail'.
      if (checkData && !checkData.detail) {
        showNotification('Esta IP ya se encuentra registrada en el sistema', 'error');
        setChecking(false);
        return;
      }

      // 2. Validación de Conectividad (Ping)
      const isReachable = await pingServer(ipValue);

      if (isReachable) {
        showNotification('IP disponible y alcanzable (Responde al Ping)', 'success');
      } else {
        showNotification('IP disponible para registro, pero el servidor NO responde al ping', 'warning');
      }

    } catch (error: any) {
      console.error('Error checking IP/Ping:', error);
      showNotification('Error al verificar la IP o conectividad', 'error');
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (data: ServerCreateInput) => {
    const payload = {
      nombre_servidor: data.nombre_servidor,
      direccion_ip: data.direccion_ip,
      es_legacy: data.es_legacy,
      id_nivel_criticidad: data.id_nivel_criticidad,
      id_estado_servidor: data.id_estado_servidor,
      descripcion: data.descripcion || "",
      monitoreo_host: monitoreoHost,
      monitoreo_db: monitoreoDb,
    };
    
    if (isWizardMode && onSubmitData) {
      let dbInstancePayload = null;
      if (monitoreoDb && dbmsId) {
        dbInstancePayload = {
          nombre_instancia: nombreInstancia.trim() || `${data.nombre_servidor}_${selectedDbmsObj?.nombre_dbms.replace(/\s+/g, '')}`,
          puerto: Number(puerto),
          id_dbms: Number(dbmsId),
          id_estado: 1, // Activo
          parametros_conexion: isOracle && sid.trim() ? { sid: sid.trim() } : {}
        };
        console.log("LOG: [ServerForm - Wizard] Mandando sid en parametros_conexion:", isOracle && sid.trim() ? sid.trim() : "ninguno");
      }
      setLoading(true);
      try {
        await onSubmitData(payload, dbInstancePayload);
      } catch (error) {
        // Handled in parent
      } finally {
        setLoading(false);
      }
      return;
    }

    console.log('Enviando payload al backend:', JSON.stringify(payload, null, 2));
    setLoading(true);
    try {
      // 1. Registrar el Servidor
      const newServer = await createServer(payload);
      
      // 2. Si monitoreoDb es true y se eligió un motor, registrar la InstanciaDBMS
      if (monitoreoDb && dbmsId) {
        try {
          const instancePayload = {
            nombre_instancia: nombreInstancia.trim() || `${data.nombre_servidor}_${selectedDbmsObj?.nombre_dbms.replace(/\s+/g, '')}`,
            puerto: Number(puerto),
            id_servidor: newServer.id_servidor,
            id_dbms: Number(dbmsId),
            id_estado: 1, // Activo
            parametros_conexion: isOracle && sid.trim() ? { sid: sid.trim() } : {}
          };
          console.log("LOG: [ServerForm - Standalone] Mandando sid en parametros_conexion:", isOracle && sid.trim() ? sid.trim() : "ninguno");
          
          await createInstance(instancePayload);
          showNotification('Servidor e instancia DBMS registrados correctamente', 'success');
        } catch (dbError: any) {
          console.error('Error al registrar la instancia DBMS:', dbError);
          showNotification(`Servidor creado, pero falló el registro de la instancia: ${dbError.response?.data?.detail || dbError.message}`, 'warning');
        }
      } else {
        showNotification('Servidor registrado correctamente', 'success');
      }
      
      if (onSuccess) {
        onSuccess(newServer.id_servidor, data.direccion_ip);
      } else {
        // Redirigimos al Wizard de configuración con el ID del servidor recién creado
        navigate(`/setup-wizard/${newServer.id_servidor}`); 
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const details = error.response.data.detail;
        const errorMessage = Array.isArray(details) 
          ? details.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', ')
          : 'Error de validación en el servidor';
        showNotification(`Error: ${errorMessage}`, 'error');
      } else if (error.response?.status === 400) {
        showNotification(error.response.data.detail || 'Ya existe un servidor con esa IP', 'error');
      } else {
        showNotification('Error al registrar el servidor', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextField
            required
            fullWidth
            label="Dirección IP del Servidor"
            placeholder="192.168.1.1"
            {...register('direccion_ip')}
            error={!!errors.direccion_ip}
            helperText={errors.direccion_ip?.message}
          />
          <Button 
            variant="outlined" 
            onClick={handleCheckIp}
            disabled={checking}
            sx={{ height: 56, minWidth: 100, borderStyle: 'dashed' }}
            startIcon={checking ? <CircularProgress size={20} /> : <CheckCircleOutlinedIcon />}
          >
            {checking ? '...' : 'Check'}
          </Button>
        </Stack>

        <TextField
          required
          fullWidth
          label="Nombre del Servidor"
          {...register('nombre_servidor')}
          error={!!errors.nombre_servidor}
          helperText={errors.nombre_servidor?.message}
        />

        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
          <Controller
            name="es_legacy"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch 
                    checked={field.value} 
                    onChange={(e) => field.onChange(e.target.checked)} 
                    color="primary" 
                  />
                }
                label="Servidor Legacy"
                sx={{ mr: 0 }}
              />
            )}
          />
          <Tooltip title="Un servidor es legacy si su sistema operativo tiene más de 10 años de antigüedad (ej. Windows Server 2012, CentOS 6). Requieren protocolos de conexión más antiguos y menos seguros.">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <CriticalitySelect name="id_nivel_criticidad" control={control} />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Descripción del Activo"
          {...register('descripcion')}
        />

        <StatusSelect 
          name="id_estado_servidor" 
          control={control} 
          label="Estado Inicial"
          filterIds={[1, 2]} 
        />

        {/* Sección de Configuración de Base de Datos Condicional */}
        {monitoreoDb && (
          <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'action.hover', mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon fontSize="small" color="primary" /> Configuración de Motor de Base de Datos
            </Typography>
            
            <Stack spacing={2.5}>
              <TextField
                select
                fullWidth
                id="id_dbms"
                label="Motor de Base de Datos (DBMS)"
                value={dbmsId}
                onChange={(e) => setDbmsId(e.target.value)}
                helperText="Selecciona el RDBMS instalado en este servidor"
              >
                {dbmsList.map((option) => (
                  <MenuItem key={option.id_dbms} value={option.id_dbms}>
                    {option.nombre_dbms} {option.version}
                  </MenuItem>
                ))}
              </TextField>

              {dbmsId && (
                <>
                  <TextField
                    required
                    fullWidth
                    label="Nombre de la Instancia"
                    placeholder="ej. bd_app_prod o mysql_3306"
                    value={nombreInstancia}
                    onChange={(e) => setNombreInstancia(e.target.value)}
                  />

                  <TextField
                    required
                    fullWidth
                    label="Puerto de Conexión"
                    type="number"
                    value={puerto}
                    onChange={(e) => setPuerto(e.target.value)}
                  />
                  
                  <Collapse in={isOracle}>
                    <Box sx={{ p: 2, border: '1px dashed', borderColor: 'primary.light', borderRadius: 1.5, bgcolor: 'background.paper', mt: 1 }}>
                      <Typography variant="caption" color="primary.main" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                        Parámetro Especial Oracle (Requerido para SID):
                      </Typography>
                      <TextField
                        fullWidth
                        label="System Identifier (SID)"
                        placeholder="ej. ERP_SID"
                        value={sid}
                        onChange={(e) => setSid(e.target.value)}
                        helperText="System Identifier (SID) para la conexión Oracle"
                      />
                    </Box>
                  </Collapse>
                </>
              )}
            </Stack>
          </Box>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ 
            mt: 2, 
            py: 1.5, 
            fontWeight: 700,
            bgcolor: 'text.primary',
            color: 'background.paper'
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : (isWizardMode ? 'Siguiente' : 'Registrar Servidor')}
        </Button>
      </Stack>
    </Box>
  );
};