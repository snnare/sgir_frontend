import { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Stack, Paper, 
  Button, Stepper, Step, StepLabel, Alert, 
  AlertTitle, Card, CardActionArea, CardContent, Chip,
  Tooltip, CircularProgress, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import IconButton from '@mui/material/IconButton';
import ShieldIcon from '@mui/icons-material/Shield';
import { ServerForm } from '../components/ServerForm';
import { CredentialForm } from '../components/CredentialForm';
import { createMonitoringSession } from '../api/monitoringService';
import { createServer, createInstance, createCredential, getDbms, updateServer, updateCredential } from '../api/infrastructureService';
import { useNotificationStore } from '../components/GlobalNotification';
import { type ServerCreateInput, type CredentialCreateInput, type Dbms } from '../api/types';

type MonitoringScope = 'basic' | 'database' | 'both';

export const AddServerPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const [activeStep, setActiveStep] = useState(0);
  const [scope, setScope] = useState<MonitoringScope | null>(null);

  // In-memory data collected during the wizard steps
  const [serverData, setServerData] = useState<ServerCreateInput | null>(null);
  const [dbInstanceData, setDbInstanceData] = useState<any | null>(null);
  const [sshCredential, setSshCredential] = useState<CredentialCreateInput | null>(null);
  const [dbCredential, setDbCredential] = useState<CredentialCreateInput | null>(null);

  // Connection status/extra data for UI display
  const [dbmsList, setDbmsList] = useState<Dbms[]>([]);
  const [credSubStep, setCredSubStep] = useState<'ssh' | 'db'>('ssh');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Track backend created IDs during steps
  const [createdServerId, setCreatedServerId] = useState<number | null>(null);
  const [createdInstanceId, setCreatedInstanceId] = useState<number | null>(null);
  const [createdSshCredId, setCreatedSshCredId] = useState<number | null>(null);
  const [createdDbCredId, setCreatedDbCredId] = useState<number | null>(null);

  const steps = ['Alcance', 'Datos Técnicos', 'Credenciales', 'Resumen', 'Finalizado'];

  // Load DBMS list once to display name in Summary
  useEffect(() => {
    getDbms()
      .then((data) => setDbmsList(data))
      .catch((err) => console.error("Error loading DBMS list:", err));
  }, []);

  const handleScopeSelect = (selectedScope: MonitoringScope) => {
    setScope(selectedScope);
    setActiveStep(1);
  };

  // Called when Step 1 (ServerForm) submits successfully in wizard mode
  const handleServerFormSubmit = async (serverFields: ServerCreateInput, dbInstanceFields: any) => {
    try {
      let serverId = createdServerId;
      const isDbMon = scope === 'both' || scope === 'database';
      const isSshMon = scope === 'both' || scope === 'basic';

      if (!serverId) {
        // Step A: Create the server node
        const newServer = await createServer(serverFields);
        serverId = newServer.id_servidor;
        setCreatedServerId(serverId);

        // Step B: Create DBMS Instance if database monitoring is selected
        if (isDbMon && dbInstanceFields) {
          const newInst = await createInstance({
            ...dbInstanceFields,
            id_servidor: serverId
          });
          setCreatedInstanceId(newInst.id_instancia);
        }
        showNotification('Servidor e instancia guardados como borrador inactivo', 'success');
      } else {
        // Update server
        await updateServer(serverId, serverFields);
        
        // If they checked DB monitoring and we didn't have an instance yet
        if (isDbMon && dbInstanceFields && !createdInstanceId) {
          const newInst = await createInstance({
            ...dbInstanceFields,
            id_servidor: serverId
          });
          setCreatedInstanceId(newInst.id_instancia);
        }
        showNotification('Datos técnicos del servidor actualizados', 'success');
      }

      setServerData(serverFields);
      setDbInstanceData(dbInstanceFields);
      
      // Choose initial sub-step for credentials
      if (isSshMon) {
        setCredSubStep('ssh');
      } else {
        setCredSubStep('db');
      }
      setActiveStep(2);
    } catch (error: any) {
      console.error('Error in step 1 submission:', error);
      showNotification('Error al guardar datos del servidor: ' + (error.response?.data?.detail || error.message), 'error');
      throw error; // Re-throw so form isSubmitting state stays correct
    }
  };

  // Called when Step 2 SSH form submits successfully
  const handleSshCredentialSubmit = async (credentialFields: CredentialCreateInput) => {
    try {
      if (!createdServerId) {
        showNotification('Error: El servidor no ha sido registrado correctamente.', 'error');
        return;
      }

      if (!createdSshCredId) {
        const newCred = await createCredential({
          ...credentialFields,
          id_servidor: createdServerId
        });
        setCreatedSshCredId(newCred.id_credencial);
        showNotification('Credencial SSH registrada correctamente', 'success');
      } else {
        await updateCredential(createdSshCredId, credentialFields);
        showNotification('Credencial SSH actualizada correctamente', 'success');
      }

      setSshCredential(credentialFields);
      if (scope === 'both') {
        setCredSubStep('db');
      } else {
        setActiveStep(3);
      }
    } catch (error: any) {
      console.error('Error in SSH credential submission:', error);
      showNotification('Error al guardar credencial SSH: ' + (error.response?.data?.detail || error.message), 'error');
      throw error;
    }
  };

  // Called when Step 2 DB form submits successfully
  const handleDbCredentialSubmit = async (credentialFields: CredentialCreateInput, extraData?: any) => {
    try {
      if (!createdServerId) {
        showNotification('Error: El servidor no ha sido registrado correctamente.', 'error');
        return;
      }

      if (!createdDbCredId) {
        const newCred = await createCredential({
          ...credentialFields,
          id_servidor: createdServerId
        });
        setCreatedDbCredId(newCred.id_credencial);
        showNotification('Credencial DBMS registrada correctamente', 'success');
      } else {
        await updateCredential(createdDbCredId, credentialFields);
        showNotification('Credencial DBMS actualizada correctamente', 'success');
      }

      setDbCredential(credentialFields);
      if (extraData?.oracle_sid !== undefined) {
        setDbInstanceData((prev: any) => prev ? {
          ...prev,
          sid: extraData.oracle_sid
        } : null);
      }
      setActiveStep(3);
    } catch (error: any) {
      console.error('Error in DB credential submission:', error);
      showNotification('Error al guardar credencial DBMS: ' + (error.response?.data?.detail || error.message), 'error');
      throw error;
    }
  };

  // Back navigation handler
  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/');
    } else if (activeStep === 1) {
      setActiveStep(0);
    } else if (activeStep === 2) {
      if (scope === 'both' && credSubStep === 'db') {
        setCredSubStep('ssh');
      } else {
        setActiveStep(1);
      }
    } else if (activeStep === 3) {
      if (scope === 'both') {
        setCredSubStep('db');
      }
      setActiveStep(2);
    }
  };

  // Transactional creation logic (Now just activates monitoring session)
  const handleRegisterEverything = async () => {
    if (!createdServerId) {
      showNotification('Faltan datos del servidor para completar el registro', 'error');
      return;
    }

    setIsRegistering(true);
    try {
      // Create active monitoring session
      await createMonitoringSession({
        id_servidor: createdServerId,
        id_estado_monitoreo: 1 // Active
      });

      showNotification('¡Servidor y componentes registrados con éxito!', 'success');
      setActiveStep(4); // Advance to completion screen
    } catch (error: any) {
      console.error('Error activating monitoring session:', error);
      const backendError = error.response?.data?.detail;
      const errorMessage = Array.isArray(backendError)
        ? backendError.map((d: any) => `${d.loc?.[d.loc.length - 1] || 'Campo'}: ${d.msg}`).join(', ')
        : (typeof backendError === 'string' ? backendError : 'Error al activar el monitoreo del servidor.');
      showNotification(`Error de Activación: ${errorMessage}`, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  // Helper to resolve DBMS engine name
  const getDbmsName = (id_dbms?: number) => {
    if (!id_dbms) return '';
    const match = dbmsList.find(d => d.id_dbms === id_dbms);
    return match ? `${match.nombre_dbms} ${match.version || ''}` : `ID ${id_dbms}`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Encabezado Principal */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title="Ir al Panel de Control">
          <IconButton 
            onClick={() => navigate('/')}
            sx={{ 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.selected' }
            }}
          >
            <HomeIcon fontSize="small" color="action" />
          </IconButton>
        </Tooltip>

        {activeStep > 0 && activeStep < 4 && (
          <Tooltip title="Paso anterior">
            <IconButton 
              onClick={handleBack}
              disabled={isRegistering}
              sx={{ 
                bgcolor: 'action.hover', 
                borderRadius: 2,
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 16 }} color="action" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ ml: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2 }}>
            Alta de Nuevo Servidor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Asistente de configuración transaccional para registro y monitoreo de activos.
          </Typography>
        </Box>
      </Box>

      {/* Stepper Superior */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Contenido de los Pasos */}
      <Box sx={{ animation: 'fadeIn 0.5s' }}>
        
        {/* PASO 0: ALCANCE DE MONITOREO */}
        {activeStep === 0 && (
          <Stack spacing={3}>
            <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 2 }}>
              ¿Qué deseas monitorear en este activo?
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              <ScopeCard 
                icon={<TerminalIcon sx={{ fontSize: 40 }} />}
                title="Solo Básico"
                description="Métricas de Hardware (CPU, RAM, Disco) vía SSH."
                onClick={() => handleScopeSelect('basic')}
              />
              <ScopeCard 
                icon={<StorageIcon sx={{ fontSize: 40 }} />}
                title="Solo Base de Datos"
                description="Estado del motor, conexiones y rendimiento de BD."
                onClick={() => handleScopeSelect('database')}
              />
              <ScopeCard 
                icon={<SpeedIcon sx={{ fontSize: 40 }} />}
                title="Completo"
                description="Visibilidad total: Hardware + Motores de BD."
                highlight
                onClick={() => handleScopeSelect('both')}
              />
            </Box>
          </Stack>
        )}

        {/* PASO 1: DATOS TÉCNICOS */}
        {activeStep === 1 && (
          <Box>
            <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Información del Activo
              </Typography>
              <ServerForm 
                isWizardMode={true}
                initialData={serverData}
                initialDbInstance={dbInstanceData}
                onSubmitData={handleServerFormSubmit} 
                monitoreoHost={scope === 'basic' || scope === 'both'}
                monitoreoDb={scope === 'database' || scope === 'both'}
              />
            </Paper>
          </Box>
        )}

        {/* PASO 2: SEGURIDAD Y CREDENCIALES */}
        {activeStep === 2 && (
          <Box>
            <Alert severity="info" icon={<ShieldIcon />} sx={{ mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
              <AlertTitle sx={{ fontWeight: 700 }}>Paso de Seguridad en Memoria</AlertTitle>
              Las credenciales ingresadas se validarán e integrarán en el resumen para su posterior creación conjunta.
            </Alert>

            {scope === 'both' && (
              <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: 'center' }}>
                <Chip 
                  icon={<TerminalIcon />} 
                  label="1. Credenciales SSH" 
                  color={credSubStep === 'ssh' ? 'primary' : 'default'} 
                  variant={credSubStep === 'ssh' ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700 }}
                />
                <Chip 
                  icon={<StorageIcon />} 
                  label="2. Credenciales DBMS" 
                  color={credSubStep === 'db' ? 'primary' : 'default'} 
                  variant={credSubStep === 'db' ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
            )}

            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
               <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  {credSubStep === 'ssh' ? 'Credenciales de Conexión SSH' : 'Credenciales del Motor de Base de Datos'}
               </Typography>
               {credSubStep === 'ssh' ? (
                 <CredentialForm 
                    key="ssh-form"
                    isWizardMode={true}
                    serverId={createdServerId || 9999}
                    serverIp={serverData?.direccion_ip}
                    initialData={sshCredential}
                    tipoAccesoFijo={1} // SSH
                    onSubmitData={handleSshCredentialSubmit} 
                    onBack={handleBack}
                    isServerLegacy={serverData?.es_legacy}
                 />
               ) : (
                  <CredentialForm 
                     key="db-form"
                     isWizardMode={true}
                     serverId={createdServerId || 9999}
                     serverIp={serverData?.direccion_ip}
                     initialData={dbCredential}
                     tipoAccesoFijo={2} // DB Native
                     onSubmitData={handleDbCredentialSubmit} 
                     onBack={handleBack}
                     isServerLegacy={serverData?.es_legacy}
                     oracleSid={dbInstanceData?.sid}
                  />
               )}
            </Paper>
          </Box>
        )}

        {/* PASO 3: RESUMEN Y CONFIRMACIÓN */}
        {activeStep === 3 && (
          <Stack spacing={4}>
            <Alert severity="success" icon={<InfoOutlinedIcon />} sx={{ borderRadius: 2 }}>
              <AlertTitle sx={{ fontWeight: 700 }}>Resumen de Alta de Activo</AlertTitle>
              Revise que todos los datos y credenciales sean correctos. Al presionar <strong>Confirmar y Registrar</strong>, se creará el servidor, su instancia de monitoreo y credenciales correspondientes.
            </Alert>

            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 3, sm: 5 }, 
                borderRadius: 4, 
                border: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.03)'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, letterSpacing: '-0.03em' }}>
                Detalles del Servidor a Crear
              </Typography>

              <Stack spacing={4}>
                {/* 1. Módulos y Alcance */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Alcance del Monitoreo
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      icon={<TerminalIcon />} 
                      label="Métricas de Hardware" 
                      color={scope === 'basic' || scope === 'both' ? 'success' : 'default'} 
                      variant="outlined" 
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip 
                      icon={<StorageIcon />} 
                      label="Observabilidad de RDBMS" 
                      color={scope === 'database' || scope === 'both' ? 'success' : 'default'} 
                      variant="outlined" 
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                </Box>

                <Divider sx={{ opacity: 0.6 }} />

                {/* 2. Servidor */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Dirección IP
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                      {serverData?.direccion_ip}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Nombre del Servidor
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {serverData?.nombre_servidor}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Criticidad
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {serverData?.id_nivel_criticidad === 1 ? 'Baja' : serverData?.id_nivel_criticidad === 2 ? 'Media' : serverData?.id_nivel_criticidad === 3 ? 'Alta' : 'Crítica'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Compatibilidad
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {serverData?.es_legacy ? 'Servidor Legacy (Protocolos antiguos)' : 'Servidor Estándar'}
                    </Typography>
                  </Box>
                  {serverData?.descripcion && (
                    <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Descripción
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {serverData.descripcion}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* 3. DBMS Instancia */}
                {scope !== 'basic' && dbInstanceData && (
                  <>
                    <Divider sx={{ opacity: 0.6 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 2, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Instancia de Base de Datos
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            Motor DBMS
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800 }}>
                            {getDbmsName(dbInstanceData.id_dbms)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            Nombre Instancia
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {dbInstanceData.nombre_instancia}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            Puerto
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {dbInstanceData.puerto}
                          </Typography>
                        </Box>
                        {dbInstanceData.sid && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                              Oracle SID
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                              {dbInstanceData.sid}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </>
                )}

                <Divider sx={{ opacity: 0.6 }} />

                {/* 4. Credenciales Configuradas */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 2, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Credenciales Configuradas
                  </Typography>
                  <Stack spacing={1.5}>
                    {(scope === 'basic' || scope === 'both') && (
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <TerminalIcon color="primary" fontSize="small" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>SSH Credential</Typography>
                            <Typography variant="caption" color="text.secondary">Usuario: {sshCredential?.usuario}</Typography>
                          </Box>
                        </Stack>
                        <Chip size="small" color="success" label="Configurada" variant="outlined" sx={{ fontWeight: 700 }} />
                      </Stack>
                    )}
                    {(scope === 'database' || scope === 'both') && (
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <StorageIcon color="primary" fontSize="small" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>Database Native Credential</Typography>
                            <Typography variant="caption" color="text.secondary">Usuario: {dbCredential?.usuario}</Typography>
                          </Box>
                        </Stack>
                        <Chip size="small" color="success" label="Configurada" variant="outlined" sx={{ fontWeight: 700 }} />
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Fila de Botones del Resumen */}
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={isRegistering}
                sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                Atrás
              </Button>
              <Button
                variant="contained"
                onClick={handleRegisterEverything}
                disabled={isRegistering}
                startIcon={isRegistering ? <CircularProgress size={20} color="inherit" /> : undefined}
                sx={{ 
                  px: 6, 
                  py: 1.5, 
                  borderRadius: 2, 
                  fontWeight: 750,
                  bgcolor: 'text.primary',
                  color: 'background.paper',
                  textTransform: 'none'
                }}
              >
                {isRegistering ? 'Registrando...' : 'Registrar'}
              </Button>
            </Stack>
          </Stack>
        )}

        {/* PASO 4: FINALIZAR */}
        {activeStep === 4 && (
          <Paper sx={{ textAlign: 'center', p: 6, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              ¡Configuración Completada!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              El servidor ha sido registrado exitosamente junto con todas sus instancias y credenciales asociadas de forma transaccional.
              <br/><br/>
              Por defecto, el sistema ya ha iniciado las tareas de monitoreo básico y de bases de datos.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/server/edit/${createdServerId}?tab=storage`)}
                sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 700 }}
              >
                Configurar Discos Adicionales
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/')}
                sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: 2, px: 6, py: 1.5, fontWeight: 700 }}
              >
                Ir al Panel de Control
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

interface ScopeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  highlight?: boolean;
}

const ScopeCard = ({ icon, title, description, onClick, highlight }: ScopeCardProps) => (
  <Card 
    sx={{ 
      height: '100%', 
      border: highlight ? '2px solid' : '1px solid',
      borderColor: highlight ? 'primary.main' : 'divider',
      boxShadow: highlight ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
      position: 'relative',
      overflow: 'visible',
      borderRadius: 3
    }}
  >
    {highlight && (
      <Box sx={{ 
        position: 'absolute', 
        top: -12, 
        left: '50%', 
        transform: 'translateX(-50%)',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        fontSize: '0.65rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        zIndex: 1
      }}>
        Recomendado
      </Box>
    )}
    <CardActionArea onClick={onClick} sx={{ height: '100%', p: 2 }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 2, color: highlight ? 'primary.main' : 'text.secondary' }}>
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);