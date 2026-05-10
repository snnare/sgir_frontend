import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Stepper, Step, StepLabel, Box, Typography, 
  FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, Alert, Stack, Divider, Chip
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import KeyIcon from '@mui/icons-material/Key';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { 
    getServers, getInstancesByServer, getCredentialsByServer, discoverInventory 
} from '../api/infrastructureService';
import { type Server, type Instance, type CredentialEnriched, type DiscoveryResponse } from '../api/types';

interface DiscoveryWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = ['Servidor', 'Instancia', 'Credencial'];

export const DiscoveryWizard = ({ open, onClose, onSuccess }: DiscoveryWizardProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [executing, setExecution] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiscoveryResponse | null>(null);

  // Datos para los pasos
  const [servers, setServers] = useState<Server[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [credentials, setCredentials] = useState<CredentialEnriched[]>([]);

  // Selecciones
  const [selectedServerId, setSelectedServerId] = useState<number | ''>('');
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | ''>('');
  const [selectedCredentialId, setSelectedCredentialId] = useState<number | ''>('');

  // 1. Cargar servidores al abrir
  useEffect(() => {
    if (open) {
      const fetchServers = async () => {
        setLoading(true);
        try {
          const data = await getServers();
          // Solo servidores con monitoreo de BD habilitado
          setServers(data.filter(s => s.monitoreo_db));
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
    }
  }, [open]);

  // 2. Cargar instancias cuando cambia el servidor
  useEffect(() => {
    if (selectedServerId && activeStep === 1) {
      const fetchInstances = async () => {
        setLoading(true);
        try {
          const data = await getInstancesByServer(Number(selectedServerId));
          setInstances(data);
        } catch (err) {
          setError('Error al cargar instancias');
        } finally {
          setLoading(false);
        }
      };
      fetchInstances();
    }
  }, [selectedServerId, activeStep]);

  // 3. Cargar credenciales cuando cambia el servidor (en el paso 3)
  useEffect(() => {
    if (selectedServerId && activeStep === 2) {
      const fetchCredentials = async () => {
        setLoading(true);
        try {
          const data = await getCredentialsByServer(Number(selectedServerId));
          // En CredentialEnriched, el tipo está anidado: c.tipo.id_tipo_acceso
          setCredentials(data.filter(c => c.tipo.id_tipo_acceso === 2));
        } catch (err) {
          setError('Error al cargar credenciales');
        } finally {
          setLoading(false);
        }
      };
      fetchCredentials();
    }
  }, [selectedServerId, activeStep]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleExecuteDiscovery = async () => {
    if (!selectedInstanceId || !selectedCredentialId) return;
    
    setExecution(true);
    setError(null);
    try {
      const res = await discoverInventory(Number(selectedInstanceId), Number(selectedCredentialId));
      setResult(res);
      onSuccess(); // Refrescar tabla de fondo
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error durante el descubrimiento');
    } finally {
      setExecution(false);
    }
  };

  const isNextDisabled = () => {
    if (activeStep === 0) return selectedServerId === '';
    if (activeStep === 1) return selectedInstanceId === '';
    if (activeStep === 2) return selectedCredentialId === '';
    return false;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AutoAwesomeIcon color="primary" /> Auto-Descubrimiento CMDB
      </DialogTitle>
      
      <DialogContent dividers>
        {!result ? (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
              {steps.map((label) => (
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
              <Box sx={{ minHeight: 120 }}>
                {/* PASO 1: SERVIDOR */}
                {activeStep === 0 && (
                  <FormControl fullWidth>
                    <InputLabel>Seleccione un Servidor</InputLabel>
                    <Select
                      value={selectedServerId}
                      label="Seleccione un Servidor"
                      onChange={(e) => setSelectedServerId(e.target.value as number)}
                    >
                      {servers.length === 0 ? (
                        <MenuItem disabled>No hay servidores con Monitoreo DB</MenuItem>
                      ) : (
                        servers.map((s) => (
                          <MenuItem key={s.id_servidor} value={s.id_servidor}>
                            <DnsIcon sx={{ fontSize: 16, mr: 1 }} /> {s.nombre_servidor} ({s.direccion_ip})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                )}

                {/* PASO 2: INSTANCIA */}
                {activeStep === 1 && (
                  <FormControl fullWidth>
                    <InputLabel>Seleccione Instancia DBMS</InputLabel>
                    <Select
                      value={selectedInstanceId}
                      label="Seleccione Instancia DBMS"
                      onChange={(e) => setSelectedInstanceId(e.target.value as number)}
                    >
                      {instances.length === 0 ? (
                        <MenuItem disabled>Este servidor no tiene instancias de BD</MenuItem>
                      ) : (
                        instances.map((i) => (
                          <MenuItem key={i.id_instancia} value={i.id_instancia}>
                            <StorageIcon sx={{ fontSize: 16, mr: 1 }} /> {i.nombre_instancia} (Puerto: {i.puerto})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {instances.length === 0 && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                            * Registre primero una instancia en este servidor para continuar.
                        </Typography>
                    )}
                  </FormControl>
                )}

                {/* PASO 3: CREDENCIAL */}
                {activeStep === 2 && (
                  <FormControl fullWidth>
                    <InputLabel>Seleccione Credencial de Acceso</InputLabel>
                    <Select
                      value={selectedCredentialId}
                      label="Seleccione Credencial de Acceso"
                      onChange={(e) => setSelectedCredentialId(e.target.value as number)}
                    >
                      {credentials.length === 0 ? (
                        <MenuItem disabled>No hay credenciales DB para este servidor</MenuItem>
                      ) : (
                        credentials.map((c) => (
                          <MenuItem key={c.id_credencial} value={c.id_credencial}>
                            <KeyIcon sx={{ fontSize: 16, mr: 1 }} /> {c.usuario} (ID: {c.id_credencial})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {credentials.length === 0 && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                            * Se requiere una credencial de tipo 'DB Native' para el descubrimiento.
                        </Typography>
                    )}
                  </FormControl>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
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
                ¡Descubrimiento Exitoso!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Se ha sincronizado el inventario para la instancia <strong>{result.instancia}</strong>.
            </Typography>

            <Stack spacing={2} divider={<Divider />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Encontradas</Typography>
                    <Chip label={result.total_encontradas} size="small" sx={{ fontWeight: 800 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Bases de Datos Creadas</Typography>
                    <Chip label={`+ ${result.creadas}`} size="small" color="success" sx={{ fontWeight: 800 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Actualizadas</Typography>
                    <Chip label={result.actualizadas} size="small" color="primary" sx={{ fontWeight: 800 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Desactivadas</Typography>
                    <Chip label={result.desactivadas} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!result ? (
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
              >
                {executing ? 'Descubriendo...' : 'Iniciar Descubrimiento'}
              </Button>
            )}
          </>
        ) : (
          <Button variant="contained" fullWidth onClick={onClose} sx={{ fontWeight: 700 }}>
            Entendido
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
