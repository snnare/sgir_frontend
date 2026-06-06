import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Stepper, Step, StepLabel, Box, Typography, 
  FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, Alert, Stack, Divider, Chip,
  FormControlLabel, Checkbox, Switch
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import KeyIcon from '@mui/icons-material/Key';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LanIcon from '@mui/icons-material/Lan';

import { getServers, getInstancesByServer, getCredentialsByServer } from '../api/infrastructureService';
import { getBackupPathsByServer } from '../api/backupService';
import { discoverBackups, discoverBackupsCustom, discoverInstanceBackups } from '../api/monitoringService';
import { 
  type Server, type Instance, type CredentialEnriched, type BackupPath, 
  type BackupDiscoveryResponse, type ServerBackupDiscoveryResponse 
} from '../api/types';

interface BackupDiscoveryWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (resultData: BackupDiscoveryResponse | ServerBackupDiscoveryResponse | null, mode: 'server' | 'instance') => void;
}

const steps = ['Destino', 'Acceso y Ruta', 'Parámetros', 'Resultado'];

export const BackupDiscoveryWizard = ({ open, onClose, onSuccess }: BackupDiscoveryWizardProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Resultados del escaneo
  const [result, setResult] = useState<BackupDiscoveryResponse | ServerBackupDiscoveryResponse | null>(null);
  const [scanMode, setScanMode] = useState<'server' | 'instance'>('server');

  // Datos para los pasos
  const [servers, setServers] = useState<Server[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [credentials, setCredentials] = useState<CredentialEnriched[]>([]);
  const [paths, setPaths] = useState<BackupPath[]>([]);

  // Selecciones
  const [selectedServerId, setSelectedServerId] = useState<number | ''>('');
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | ''>('');
  const [selectedCredentialId, setSelectedCredentialId] = useState<number | ''>('');
  const [selectedPathId, setSelectedPathId] = useState<number | ''>('');

  // Parámetros adicionales
  const [isCustomScan, setIsCustomScan] = useState(false);
  const [customDays, setCustomDays] = useState<number>(0);
  const [customDeep, setCustomDeep] = useState<boolean>(true);

  // 1. Cargar servidores al abrir
  useEffect(() => {
    if (open) {
      const fetchServers = async () => {
        setLoading(true);
        try {
          const data = await getServers();
          setServers(data);
        } catch (err) {
          setError('Error al cargar servidores');
        } finally {
          setLoading(false);
        }
      };
      fetchServers();
      // Resetear estado
      setActiveStep(0);
      setResult(null);
      setError(null);
      setSelectedServerId('');
      setSelectedInstanceId('');
      setSelectedCredentialId('');
      setSelectedPathId('');
      setIsCustomScan(false);
      setCustomDays(0);
      setCustomDeep(true);
      setScanMode('server');
    }
  }, [open]);

  // 2. Cargar detalles cuando cambia el servidor (en paso 1 o 2)
  useEffect(() => {
    if (selectedServerId && open) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const [credsData, pathsData, instancesData] = await Promise.all([
            getCredentialsByServer(Number(selectedServerId)),
            getBackupPathsByServer(Number(selectedServerId)),
            getInstancesByServer(Number(selectedServerId))
          ]);
          // Filtrar credenciales SSH
          const sshCreds = credsData.filter(c => c.tipo.id_tipo_acceso === 1);
          setCredentials(sshCreds);
          setPaths(pathsData);
          setInstances(instancesData);

          if (sshCreds.length > 0) {
            setSelectedCredentialId(sshCreds[0].id_credencial);
          } else {
            setSelectedCredentialId('');
          }
        } catch (err) {
          setError('Error al cargar detalles del servidor');
          setSelectedCredentialId('');
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [selectedServerId, open]);

  const handleNext = () => {
    if (activeStep === 0 && scanMode === 'server') {
      setSelectedInstanceId('');
    }
    setActiveStep((prev) => prev + 1);
  };
  
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleExecuteDiscovery = async () => {
    if (!selectedServerId || !selectedCredentialId || !selectedPathId) return;
    
    setExecuting(true);
    setError(null);
    try {
      let res: BackupDiscoveryResponse | ServerBackupDiscoveryResponse;
      if (scanMode === 'server') {
        if (isCustomScan) {
          res = await discoverBackupsCustom(
            Number(selectedServerId), 
            Number(selectedCredentialId), 
            Number(selectedPathId),
            customDays,
            customDeep
          );
        } else {
          res = await discoverBackups(
            Number(selectedServerId), 
            Number(selectedCredentialId), 
            Number(selectedPathId)
          );
        }
      } else {
        if (!selectedInstanceId) return;
        res = await discoverInstanceBackups(
          Number(selectedInstanceId), 
          Number(selectedCredentialId), 
          Number(selectedPathId)
        );
      }
      
      setResult(res);
      onSuccess(res, scanMode); // Refrescar tabla en la vista principal
      setActiveStep(3); // Ir al paso final
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error durante el descubrimiento de respaldos físico');
    } finally {
      setExecuting(false);
    }
  };

  const isNextDisabled = () => {
    if (activeStep === 0) {
      if (selectedServerId === '') return true;
      if (scanMode === 'instance' && selectedInstanceId === '') return true;
      return false;
    }
    if (activeStep === 1) {
      return selectedCredentialId === '' || selectedPathId === '';
    }
    return false;
  };

  // Cuenta de archivos encontrados en el resultado
  const filesCount = result
    ? (scanMode === 'server' && Array.isArray(result)
        ? (result as ServerBackupDiscoveryResponse).filter(d => d.archivo_encontrado).length
        : (result && !Array.isArray(result) && (result as BackupDiscoveryResponse).archivos_procesados !== undefined)
          ? (result as BackupDiscoveryResponse).archivos_procesados
          : 0)
    : 0;

  // Peso total
  const totalWeight = result
    ? (scanMode === 'server' && Array.isArray(result)
        ? (result as ServerBackupDiscoveryResponse).reduce((acc, d) => acc + (d.tamano_encontrado_mb || 0), 0)
        : (result && !Array.isArray(result) && (result as BackupDiscoveryResponse).detalles)
          ? (result as BackupDiscoveryResponse).detalles.reduce((acc, d) => acc + (d.tamano_encontrado_mb || 0), 0)
          : 0)
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AutoAwesomeIcon color="primary" /> Auto-Descubrimiento de Respaldos
      </DialogTitle>
      
      <DialogContent dividers>
        {activeStep < 3 ? (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
              {steps.slice(0, 3).map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <Box sx={{ minHeight: 180 }}>
                {/* PASO 1: SERVIDOR E INSTANCIA */}
                {activeStep === 0 && (
                  <Stack spacing={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Servidor Destino</InputLabel>
                      <Select
                        value={selectedServerId}
                        label="Servidor Destino"
                        onChange={(e) => {
                          setSelectedServerId(e.target.value as number);
                          setSelectedInstanceId('');
                        }}
                      >
                        {servers.map((s) => (
                          <MenuItem key={s.id_servidor} value={s.id_servidor}>
                            <DnsIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} /> {s.nombre_servidor} ({s.direccion_ip})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!selectedServerId}>
                      <InputLabel>Modo de Escaneo</InputLabel>
                      <Select
                        value={scanMode}
                        label="Modo de Escaneo"
                        onChange={(e) => setScanMode(e.target.value as 'server' | 'instance')}
                      >
                        <MenuItem value="server">
                          <LanIcon sx={{ fontSize: 16, mr: 1 }} /> Todo el Servidor (General)
                        </MenuItem>
                        <MenuItem value="instance">
                          <StorageIcon sx={{ fontSize: 16, mr: 1 }} /> Por Instancia RDBMS (Focalizado)
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {scanMode === 'instance' && (
                      <FormControl fullWidth size="small" disabled={!selectedServerId}>
                        <InputLabel>Instancia DBMS</InputLabel>
                        <Select
                          value={selectedInstanceId}
                          label="Instancia DBMS"
                          onChange={(e) => setSelectedInstanceId(e.target.value as number)}
                        >
                          {instances.length === 0 ? (
                            <MenuItem disabled>Sin instancias registradas</MenuItem>
                          ) : (
                            instances.map((inst) => (
                              <MenuItem key={inst.id_instancia} value={inst.id_instancia}>
                                <StorageIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /> {inst.nombre_instancia} (Puerto: {inst.puerto})
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    )}
                  </Stack>
                )}

                {/* PASO 2: ACCESO Y RUTA */}
                {activeStep === 1 && (
                  <Stack spacing={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Credencial SSH</InputLabel>
                      <Select
                        value={selectedCredentialId}
                        label="Credencial SSH"
                        onChange={(e) => setSelectedCredentialId(e.target.value as number)}
                      >
                        {credentials.length === 0 ? (
                          <MenuItem disabled>Sin credenciales SSH configuradas</MenuItem>
                        ) : (
                          credentials.map((c) => (
                            <MenuItem key={c.id_credencial} value={c.id_credencial}>
                              <KeyIcon sx={{ fontSize: 16, mr: 1, color: 'amber.main' }} /> {c.usuario} (ID: {c.id_credencial})
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Ruta de Almacenamiento</InputLabel>
                      <Select
                        value={selectedPathId}
                        label="Ruta de Almacenamiento"
                        onChange={(e) => setSelectedPathId(e.target.value as number)}
                      >
                        {paths.length === 0 ? (
                          <MenuItem disabled>Sin rutas configuradas</MenuItem>
                        ) : (
                          paths.map((p) => (
                            <MenuItem key={p.id_ruta} value={p.id_ruta}>
                              <FolderOpenIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /> {p.descripcion_ruta} ({p.path})
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                    
                    {selectedServerId && credentials.length === 0 && (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        Este servidor no posee credenciales SSH configuradas. Habilite accesos en Credenciales.
                      </Alert>
                    )}
                  </Stack>
                )}

                {/* PASO 3: PARÁMETROS */}
                {activeStep === 2 && (
                  <Stack spacing={3}>
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 2.5, bgcolor: 'action.hover' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isCustomScan}
                            onChange={(e) => setIsCustomScan(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              Escaneo en Caliente (Personalizado)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Filtra archivos por antigüedad y realiza búsquedas profundas.
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>

                    {isCustomScan && (
                      <Stack spacing={3} sx={{ pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                        <FormControl size="small" fullWidth>
                          <InputLabel>Antigüedad de los archivos</InputLabel>
                          <Select
                            value={customDays}
                            label="Antigüedad de los archivos"
                            onChange={(e) => setCustomDays(e.target.value as number)}
                          >
                            <MenuItem value={1}>Últimas 24 horas</MenuItem>
                            <MenuItem value={3}>Últimos 3 días</MenuItem>
                            <MenuItem value={7}>Última semana</MenuItem>
                            <MenuItem value={0}>Cualquier antigüedad</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={customDeep}
                              onChange={(e) => setCustomDeep(e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                Búsqueda profunda
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Buscar de forma recursiva en todas las subcarpetas del mountpoint.
                              </Typography>
                            </Box>
                          }
                        />
                      </Stack>
                    )}
                  </Stack>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            )}
          </>
        ) : (
          /* RESULTADOS */
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              ¡Escaneo Completado Exitosamente!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Se completó la exploración en la ruta física configurada.
            </Typography>

            <Stack spacing={2} divider={<Divider />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Archivos Encontrados</Typography>
                <Chip label={filesCount} color="primary" size="small" sx={{ fontWeight: 800 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Peso Total</Typography>
                <Chip label={`${totalWeight.toFixed(2)} MB`} variant="outlined" size="small" sx={{ fontWeight: 800 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Nuevos Respaldos Registrados</Typography>
                <Chip 
                  label={scanMode === 'server' ? 'N/A' : (result && !Array.isArray(result) ? (result as BackupDiscoveryResponse).nuevos_respaldos_registrados : 0)} 
                  color="success" 
                  size="small" 
                  sx={{ fontWeight: 800 }} 
                />
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {activeStep < 3 ? (
          <>
            <Button onClick={onClose} disabled={executing} color="inherit">
              Cancelar
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            {activeStep > 0 && (
              <Button onClick={handleBack} disabled={loading || executing} color="inherit">
                Atrás
              </Button>
            )}
            {activeStep < 2 ? (
              <Button 
                variant="contained" 
                onClick={handleNext} 
                disabled={isNextDisabled() || loading}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Siguiente
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleExecuteDiscovery}
                disabled={isNextDisabled() || executing}
                startIcon={executing && <CircularProgress size={16} color="inherit" />}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                {executing ? 'Escaneando...' : 'Iniciar Escaneo'}
              </Button>
            )}
          </>
        ) : (
          <Button variant="contained" fullWidth onClick={onClose} sx={{ fontWeight: 700, borderRadius: 2 }}>
            Entendido
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
