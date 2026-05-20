import { useState } from 'react';
import { 
  Container, Box, Typography, Stack, Paper, 
  Button, Stepper, Step, StepLabel, Alert, 
  AlertTitle, Card, CardActionArea, CardContent, Chip,
  Tooltip
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
import { ServerForm } from '../components/ServerForm';
import { CredentialForm } from '../components/CredentialForm';
import { createMonitoringSession } from '../api/monitoringService';

type MonitoringScope = 'basic' | 'database' | 'both';

export const AddServerPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [serverId, setServerId] = useState<number | null>(null);
  const [serverIp, setServerIp] = useState<string>(''); // Nuevo estado para la IP
  const [scope, setScope] = useState<MonitoringScope | null>(null);
  const [registeredTypes, setRegisteredTypes] = useState<number[]>([]);

  const steps = ['Alcance', 'Datos Técnicos', 'Credenciales', 'Finalizado'];

  const handleScopeSelect = (selectedScope: MonitoringScope) => {
    setScope(selectedScope);
    setActiveStep(1);
  };

  const handleServerSuccess = async (newServerId: number, ip: string) => {
    setServerId(newServerId);
    setServerIp(ip); // Guardamos la IP cuando el servidor se crea con éxito
    
    // Si se registró el servidor, creamos la sesión de monitoreo automáticamente
    try {
      await createMonitoringSession({
        id_servidor: newServerId,
        id_estado_monitoreo: 1 // Activo por defecto
      });
    } catch (error) {
      console.error('Error creating monitoring session:', error);
    }
    
    setActiveStep(2);
  };

  const handleCredentialSuccess = (typeId: number) => {
    setRegisteredTypes(prev => [...prev, typeId]);
    
    // Si el alcance es simple, o si ya registramos ambos en scope 'both', podemos terminar
    const needsBoth = scope === 'both';
    const hasSsh = [...registeredTypes, typeId].includes(1);
    const hasDb = [...registeredTypes, typeId].includes(2);

    if (!needsBoth) {
        setActiveStep(3);
    } else if (hasSsh && hasDb) {
        setActiveStep(3);
    }
    // Si falta alguno, nos quedamos en el paso 2 para que registre el otro
  };

  const isStepComplete = () => {
    if (scope === 'basic') return registeredTypes.includes(1);
    if (scope === 'database') return registeredTypes.includes(2);
    if (scope === 'both') return registeredTypes.includes(1) && registeredTypes.includes(2);
    return false;
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

        {activeStep > 0 && activeStep < 3 && (
          <Tooltip title="Paso anterior">
            <IconButton 
              onClick={() => setActiveStep(prev => prev - 1)}
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
            Asistente de configuración para registro y monitoreo de activos.
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
                description="Estado del motor, sesiones y rendimiento de BD."
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
                onSuccess={handleServerSuccess} 
                monitoreoHost={scope === 'basic' || scope === 'both'}
                monitoreoDb={scope === 'database' || scope === 'both'}
              />
            </Paper>
          </Box>
        )}

        {/* PASO 2: SEGURIDAD Y CREDENCIALES */}
        {activeStep === 2 && (
          <Box>
            {scope === 'database' || scope === 'both' ? (
              <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
                <AlertTitle sx={{ fontWeight: 700 }}>Configuración de Seguridad</AlertTitle>
                {scope === 'both' ? (
                    'Este servidor requiere credenciales SSH (Hardware) y Credenciales de BD (Motor).'
                ) : (
                    'Asegúrate de haber creado un usuario de monitoreo (ej. sgir_monitor) con permisos de lectura.'
                )}
              </Alert>
            ) : (
              <Alert severity="info" icon={<TerminalIcon />} sx={{ mb: 4, borderRadius: 2 }}>
                <AlertTitle sx={{ fontWeight: 700 }}>Conexión SSH</AlertTitle>
                El sistema requiere un usuario con permisos de lectura sobre <code>/proc</code>.
              </Alert>
            )}

            {registeredTypes.length > 0 && (
                <Stack spacing={1} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, px: 1 }}>
                        Credenciales Registradas:
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        {registeredTypes.includes(1) && (
                            <Chip icon={<TerminalIcon />} label="SSH Registrada" color="success" variant="outlined" />
                        )}
                        {registeredTypes.includes(2) && (
                            <Chip icon={<StorageIcon />} label="DB Registrada" color="success" variant="outlined" />
                        )}
                    </Stack>
                </Stack>
            )}

            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
               <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  {scope === 'both' && !registeredTypes.includes(1) ? 'Paso A: Credenciales SSH' : 
                   scope === 'both' && !registeredTypes.includes(2) ? 'Paso B: Credenciales de BD' : 
                   'Registro de Credenciales'}
               </Typography>
               {serverId && (
                 <CredentialForm 
                    key={registeredTypes.length} // Forzar re-render del formulario al registrar una
                    serverId={serverId} 
                    serverIp={serverIp}
                    onSuccess={handleCredentialSuccess} 
                 />
               )}
            </Paper>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Box sx={{ flexGrow: 1 }} />
              {isStepComplete() ? (
                  <Button onClick={() => setActiveStep(3)} variant="contained" color="primary" sx={{ px: 4, py: 1, fontWeight: 700 }}>
                      Finalizar Configuración
                  </Button>
              ) : (
                <Button onClick={() => navigate('/')} color="inherit">
                    Saltar este paso
                </Button>
              )}
            </Stack>
          </Box>
        )}

        {/* PASO 3: FINALIZAR */}
        {activeStep === 3 && (
          <Paper sx={{ textAlign: 'center', p: 6, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              ¡Configuración Completada!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              El servidor ha sido registrado y cuenta con credenciales para iniciar el monitoreo.
              <br/><br/>
              Por defecto, el sistema ya está monitoreando la partición raíz (/).
            </Typography>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/server/edit/${serverId}?tab=storage`)}
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