import { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Stack, MenuItem,
  InputAdornment, IconButton, Tooltip, Typography, Divider, Collapse
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInfrastructureStore } from '../store/useInfrastructureStore';
import { useNotificationStore } from './GlobalNotification';
import { createInstance } from '../api/infrastructureService';

export const InstanceForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryServerId = searchParams.get('serverId');

  const { servers, fetchServers, dbmsList, fetchDbmsList } = useInfrastructureStore();
  const { showNotification } = useNotificationStore();

  // Estados del Formulario
  const [serverId, setServerId] = useState<string>(queryServerId || '');
  const [dbmsId, setDbmsId] = useState<string>('');
  const [nombreInstancia, setNombreInstancia] = useState('');
  const [puerto, setPuerto] = useState('');
  const [estado, setEstado] = useState('1'); // 1: Activo, 2: Inactivo

  // Parámetros de Conexión Dinámicos
  const [sid, setSid] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [authSource, setAuthSource] = useState('');
  
  // Parámetros Avanzados
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customParams, setCustomParams] = useState('');

  useEffect(() => {
    if (servers.length === 0) {
      fetchServers();
    }
    if (dbmsList.length === 0) {
      fetchDbmsList();
    }
  }, [servers.length, dbmsList.length, fetchServers, fetchDbmsList]);

  const selectedDbmsObj = dbmsList.find(d => d.id_dbms === Number(dbmsId));
  const isOracle = selectedDbmsObj?.nombre_dbms.toLowerCase().includes('oracle');
  const isMongo = selectedDbmsObj?.nombre_dbms.toLowerCase().includes('mongo');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serverId || !dbmsId || !nombreInstancia || !puerto) {
      showNotification('Por favor, completa todos los campos requeridos', 'warning');
      return;
    }

    // Construir parametros_conexion
    let parametros_conexion: Record<string, any> | null = null;
    
    if (isOracle) {
      const oracleParams: Record<string, string> = {};
      if (sid.trim()) oracleParams.sid = sid.trim();
      if (serviceName.trim()) oracleParams.service_name = serviceName.trim();
      if (Object.keys(oracleParams).length > 0) {
        parametros_conexion = oracleParams;
      }
    } else if (isMongo) {
      if (authSource.trim()) {
        parametros_conexion = { authSource: authSource.trim() };
      }
    }

    // Parámetros Avanzados (JSON)
    if (customParams.trim()) {
      try {
        const parsed = JSON.parse(customParams);
        parametros_conexion = {
          ...parametros_conexion,
          ...parsed
        };
      } catch (err) {
        showNotification('El campo de Parámetros Avanzados debe ser un JSON válido', 'error');
        return;
      }
    }

    const payload = {
      nombre_instancia: nombreInstancia.trim(),
      puerto: Number(puerto),
      id_servidor: Number(serverId),
      id_dbms: Number(dbmsId),
      id_estado: Number(estado),
      parametros_conexion
    };

    if (isOracle) {
      console.log("LOG: [InstanceForm] Mandando sid en parametros_conexion:", parametros_conexion?.sid || "ninguno");
    }

    try {
      await createInstance(payload);
      showNotification('Instancia DBMS creada correctamente', 'success');
      navigate('/');
    } catch (error: any) {
      console.error('Error creating instance:', error);
      showNotification(
        error.response?.data?.detail || 'Ocurrió un error al crear la instancia DBMS',
        'error'
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        {/* Servidor */}
        <TextField
          select
          fullWidth
          required
          id="id_servidor"
          label="Servidor Asociado"
          value={serverId}
          onChange={(e) => setServerId(e.target.value)}
          disabled={!!queryServerId}
          helperText={queryServerId ? "Servidor pre-seleccionado desde el flujo" : "Selecciona el servidor físico o virtual"}
        >
          {servers.map((svr) => (
            <MenuItem key={svr.id_servidor} value={svr.id_servidor}>
              {svr.nombre_servidor} — {svr.direccion_ip}
            </MenuItem>
          ))}
        </TextField>

        {/* Fila DBMS + Botón Agregar */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextField
            select
            fullWidth
            required
            id="id_dbms"
            label="Motor de Base de Datos (DBMS)"
            value={dbmsId}
            onChange={(e) => setDbmsId(e.target.value)}
            helperText="Selecciona el motor y versión instalado en el host"
          >
            {dbmsList.map((option) => (
              <MenuItem key={option.id_dbms} value={option.id_dbms}>
                {option.nombre_dbms} {option.version} — {option.descripcion || 'Sin descripción'}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title="Registrar nuevo motor DBMS">
            <IconButton
              onClick={() => navigate('/add-dbms')}
              sx={{
                mt: 1,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <AddBoxIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <TextField
          required
          fullWidth
          id="nombre_instancia"
          label="Nombre de la Instancia"
          placeholder="ej. Oracle ERP Prod o mysql_3306"
          value={nombreInstancia}
          onChange={(e) => setNombreInstancia(e.target.value)}
        />

        <TextField
          required
          fullWidth
          id="puerto"
          label="Puerto de Conexión"
          type="number"
          value={puerto}
          onChange={(e) => setPuerto(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SettingsInputComponentIcon fontSize="small" />
                </InputAdornment>
              ),
            }
          }}
        />

        {/* --- Parámetros de Conexión Dinámicos --- */}
        {isOracle && (
          <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'primary.light', borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlinedIcon fontSize="small" /> Parámetros Avanzados Oracle (Opcionales)
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                id="oracle_sid"
                label="System Identifier (SID)"
                placeholder="ej. ERP_SID"
                value={sid}
                onChange={(e) => setSid(e.target.value)}
                helperText="Identificador del sistema (SID) específico de Oracle"
              />
              <TextField
                fullWidth
                id="oracle_service_name"
                label="Nombre del Servicio (Service Name)"
                placeholder="ej. service_prod"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                helperText="Nombre alternativo del servicio si no usas SID"
              />
            </Stack>
          </Box>
        )}

        {isMongo && (
          <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'primary.light', borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlinedIcon fontSize="small" /> Parámetros Avanzados MongoDB (Opcionales)
            </Typography>
            <TextField
              fullWidth
              id="mongo_auth_source"
              label="Base de Datos de Autenticación (authSource)"
              placeholder="ej. admin"
              value={authSource}
              onChange={(e) => setAuthSource(e.target.value)}
              helperText="Base de datos donde residen las credenciales del usuario de monitoreo"
            />
          </Box>
        )}

        {/* Sección Avanzada Genérica */}
        <Box>
          <Button
            variant="text"
            size="small"
            startIcon={<TuneIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            {showAdvanced ? 'Ocultar Parámetros Avanzados JSON' : 'Mostrar Parámetros Avanzados JSON'}
          </Button>
          <Collapse in={showAdvanced} sx={{ mt: 2 }}>
            <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                Puedes registrar configuraciones avanzadas adicionales en formato JSON libre:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                id="custom_params"
                label="Parámetros Avanzados (JSON)"
                placeholder='{\n  "ssl": true,\n  "timeout": 5000\n}'
                value={customParams}
                onChange={(e) => setCustomParams(e.target.value)}
                sx={{ fontFamily: '"JetBrains Mono", monospace' }}
                helperText="Debe ser un objeto JSON válido, ej: { 'ssl': true }"
              />
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 1 }} />

        <TextField
          select
          fullWidth
          id="estado"
          label="Estado de la Instancia"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <MenuItem value="1">Activo</MenuItem>
          <MenuItem value="2">Inactivo</MenuItem>
        </TextField>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          startIcon={<StorageIcon />}
          sx={{
            mt: 2,
            py: 1.5,
            fontWeight: 800,
            bgcolor: 'text.primary',
            color: 'background.paper',
            '&:hover': { bgcolor: 'action.active' }
          }}
        >
          Guardar Instancia
        </Button>
      </Stack>
    </Box>
  );
};