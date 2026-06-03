import { Box, Typography, Grid, Paper, Card, CardContent, Button, Stack, CircularProgress } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import StorageIcon from '@mui/icons-material/Storage';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../api/client';
import { useNotificationStore } from '../components/GlobalNotification';
import { useAlertStore } from '../store/useAlertStore';
import { useState } from 'react';

export const ReportsPage = () => {
  const { showNotification } = useNotificationStore();
  const { showAlert } = useAlertStore();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (endpoint: string, filename: string, label: string) => {
    setDownloading(endpoint);
    showNotification(`Generando y descargando ${label}...`, 'info');
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification(`${label} descargado exitosamente`, 'success');
    } catch (error) {
      console.error(`Error downloading ${label}:`, error);
      showAlert({
        title: 'Error de Descarga',
        description: `No se pudo generar o descargar el ${label}. Por favor, intente más tarde.`,
        severity: 'error'
      });
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      title: 'Reporte General de SRE',
      subtitle: 'Consolidado General (Offline)',
      description: 'Reporte ejecutivo en PDF de salud general de hosts, alertas activas de auditoría e inventario CMDB persistido de bases de datos.',
      endpoint: '/assets/sre-pdf-offline',
      filename: 'reporte_general_sre.pdf',
      icon: <PictureAsPdfIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning' as const,
      label: 'Reporte SRE'
    },
    {
      title: 'Reporte Mensual de SLA SRE',
      subtitle: 'Disponibilidad e Incidentes (Offline)',
      description: 'Reporte ejecutivo mensual en PDF que analiza el Uptime promedio global, menor SLA por host y el historial de alertas e incidentes.',
      endpoint: '/assets/sre-sla-pdf',
      filename: 'reporte_sre_sla.pdf',
      icon: <PictureAsPdfIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error' as const,
      label: 'Reporte SLA SRE'
    },
    {
      title: 'Reporte CMDB Detallado',
      subtitle: 'Sincronizado en Vivo (Online)',
      description: 'Genera un reporte A4 UAEMex consultando en tiempo real a los servidores remotos para obtener el estado del hardware y sus esquemas.',
      endpoint: '/assets/pdf',
      filename: `reporte_activos_${new Date().toISOString().split('T')[0]}.pdf`,
      icon: <PictureAsPdfIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success' as const,
      label: 'Reporte CMDB (Online)'
    },
    {
      title: 'Reporte CMDB Local',
      subtitle: 'Consulta PostgreSQL (Offline)',
      description: 'Reporte A4 UAEMex de bases de datos que lee únicamente los datos persistidos en la base PostgreSQL local sin conexiones de red remotas.',
      endpoint: '/assets/pdf-offline',
      filename: 'reporte_inventario_dbs_offline.pdf',
      icon: <PictureAsPdfIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info' as const,
      label: 'Reporte CMDB (Offline)'
    },
    {
      title: 'Reporte de Activos CSV',
      subtitle: 'Hoja de Cálculo (Excel)',
      description: 'Exporta los datos crudos y pesos en megabytes de todo el inventario de bases de datos en formato CSV compatible con Excel.',
      endpoint: '/assets/csv',
      filename: `reporte_activos_${new Date().toISOString().split('T')[0]}.csv`,
      icon: <StorageIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary' as const,
      label: 'Reporte CSV'
    }
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
          Centro de Reportes SRE
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Descarga reportes técnicos consolidados, estados de infraestructura en tiempo real y formatos crudos.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {reports.map((report, idx) => (
          <Grid size={{ xs: 12, md: 6 }} key={idx}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: 3, 
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                  borderColor: 'primary.light'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'flex-start' }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2.5, 
                      bgcolor: 'action.hover',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {report.icon}
                  </Paper>
                  <Box>
                    <Typography variant="caption" color={`${report.color}.main`} sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {report.subtitle}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, mb: 1 }}>
                      {report.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {report.description}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
              <Box sx={{ px: 3, pb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color={report.color}
                  startIcon={downloading === report.endpoint ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                  disabled={downloading !== null}
                  onClick={() => handleDownload(report.endpoint, report.filename, report.label)}
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.2, 
                    fontWeight: 700,
                    borderWidth: 1.5,
                    '&:hover': { borderWidth: 1.5 }
                  }}
                >
                  {downloading === report.endpoint ? 'Generando...' : 'Descargar Reporte'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
