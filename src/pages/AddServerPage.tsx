import { useState } from 'react';
import { 
  Container, Box, Typography, Stack, Paper, 
  Button, Stepper, Step, StepLabel, Alert, 
  AlertTitle, Card, CardActionArea, CardContent 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ServerForm } from '../components/ServerForm';
import { CredentialForm } from '../components/CredentialForm';
import { BackButton } from '../components/BackButton';

type MonitoringScope = 'basic' | 'database' | 'both';

export const AddServerPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [serverId, setServerId] = useState<number | null>(null);
  const [scope, setScope] = useState<MonitoringScope | null>(null);

  const steps = ['Datos Técnicos', 'Alcance', 'Credenciales', 'Finalizado'];

  const handleServerSuccess = (newServerId: number) => {
    setServerId(newServerId);
    setActiveStep(1);
  };

  const handleScopeSelect = (selectedScope: MonitoringScope) => {
    setScope(selectedScope);
    setActiveStep(2);
  };

  const handleCredentialSuccess = () => {
    setActiveStep(3);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Encabezado Principal */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <BackButton to="/" label="Volver al Panel de Control" />
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em', mt: 0.5, lineHeight: 1.2 }}>
          Alta de Nuevo Servidor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Asistente de configuración para registro y monitoreo de activos.
        </Typography>
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
        
        {/* PASO 0: DATOS TÉCNICOS */}
        {activeStep === 0 && (
          <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              Información del Activo
            </Typography>
            <ServerForm onSuccess={handleServerSuccess} />
          </Paper>
        )}

        {/* PASO 1: ALCANCE DE MONITOREO */}
        {activeStep === 1 && (
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
            
            <Button 
              variant="text" 
              fullWidth 
              onClick={() => navigate('/')}
              sx={{ mt: 2, color: 'text.secondary' }}
            >
              Configurar credenciales más tarde
            </Button>
          </Stack>
        )}

        {/* PASO 2: SEGURIDAD Y CREDENCIALES */}
        {activeStep === 2 && (
          <Box>
            {scope === 'database' || scope === 'both' ? (
              <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
                <AlertTitle sx={{ fontWeight: 700 }}>Recomendación de Seguridad</AlertTitle>
                Asegúrate de haber creado un usuario de monitoreo (ej. <code>sgir_monitor</code>) con permisos de lectura.
              </Alert>
            ) : (
              <Alert severity="info" icon={<TerminalIcon />} sx={{ mb: 4, borderRadius: 2 }}>
                <AlertTitle sx={{ fontWeight: 700 }}>Conexión SSH</AlertTitle>
                El sistema requiere un usuario con permisos de lectura sobre <code>/proc</code>.
              </Alert>
            )}

            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
               <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  Registro de Credenciales
               </Typography>
               {serverId && (
                 <CredentialForm 
                    serverId={serverId} 
                    onSuccess={handleCredentialSuccess} 
                 />
               )}
            </Paper>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setActiveStep(1)} variant="outlined" sx={{ borderRadius: 2 }}>
                Atrás
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={() => navigate('/')} color="inherit">
                Saltar este paso
              </Button>
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
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: 2, px: 6, py: 1.5, fontWeight: 700 }}
            >
              Ir al Panel de Control
            </Button>
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
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <ArrowForwardIcon fontSize="small" color={highlight ? 'primary' : 'disabled'} />
        </Box>
      </CardContent>
    </CardActionArea>
  </Card>
);