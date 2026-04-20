import { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Stack, Paper, 
  Button, Stepper, Step, StepLabel, Alert, 
  AlertTitle, Card, CardActionArea, CardContent,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CredentialForm } from '../components/CredentialForm';
import { useInfrastructureStore } from '../store/useInfrastructureStore';

type MonitoringScope = 'basic' | 'database' | 'both';

export const PostRegisterWizard = () => {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { fetchServerById, currentServer } = useInfrastructureStore();

  const [activeStep, setActiveStep] = useState(0);
  const [scope, setScope] = useState<MonitoringScope | null>(null);

  useEffect(() => {
    if (serverId) {
      fetchServerById(Number(serverId));
    }
  }, [serverId, fetchServerById]);

  const handleScopeSelect = (selectedScope: MonitoringScope) => {
    setScope(selectedScope);
    setActiveStep(1);
  };

  const steps = ['Seleccionar Alcance', 'Configurar Monitoreo', 'Finalizar'];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Encabezado del Wizard */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Configuración de Monitoreo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Servidor: <strong>{currentServer?.nombre_servidor}</strong> ({currentServer?.direccion_ip})
        </Typography>
        
        <Stepper activeStep={activeStep} centered sx={{ mt: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* PASO 0: SELECCIÓN DE ALCANCE */}
      {activeStep === 0 && (
        <Stack spacing={3}>
          <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 2 }}>
            ¿Qué deseas monitorear en este activo?
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
            gap: 3 
          }}>
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
              title="Monitoreo Completo"
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
            Configurar más tarde
          </Button>
        </Stack>
      )}

      {/* PASO 1: CONFIGURACIÓN SEGÚN ALCANCE */}
      {activeStep === 1 && (
        <Box sx={{ animation: 'fadeIn 0.5s' }}>
          {scope === 'database' || scope === 'both' ? (
            <Alert 
              severity="info" 
              icon={<InfoOutlinedIcon />}
              sx={{ 
                mb: 4, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.light'
              }}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>Recomendación de Seguridad</AlertTitle>
              Antes de continuar, asegúrate de haber creado un usuario de monitoreo en tu base de datos (ej. <code>sgir_monitor</code>) con permisos de lectura para tablas de performance y sistema.
            </Alert>
          ) : (
            <Alert 
              severity="info" 
              icon={<TerminalIcon />}
              sx={{ mb: 4, borderRadius: 2 }}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>Conexión SSH</AlertTitle>
              El sistema requiere un usuario con permisos de lectura sobre <code>/proc</code> y comandos básicos de diagnóstico (<code>top</code>, <code>df</code>, <code>free</code>).
            </Alert>
          )}

          <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
             <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Registro de Credenciales de Acceso
             </Typography>
             <CredentialForm 
                serverId={Number(serverId)} 
                onSuccess={() => setActiveStep(2)} 
             />
          </Paper>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button onClick={() => setActiveStep(0)} variant="outlined" sx={{ borderRadius: 2 }}>
              Atrás
            </Button>
          </Stack>
        </Box>
      )}

      {/* PASO 2: FINALIZAR */}
      {activeStep === 2 && (
        <Box sx={{ textAlign: 'center', py: 4, animation: 'fadeIn 0.5s' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            ¡Configuración Completada!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            El servidor ahora cuenta con las credenciales necesarias para iniciar el monitoreo.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: 2, px: 6, py: 1.5 }}
          >
            Ir al Dashboard
          </Button>
        </Box>
      )}
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
      overflow: 'visible'
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