import { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BackupPathForm } from '../components/BackupPathForm';
import { getBackupPaths } from '../api/backupService';
import { type BackupPath } from '../api/types';

export const EditBackupPathPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pathData, setPathData] = useState<BackupPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const paths = await getBackupPaths();
        const found = paths.find(p => p.id_ruta === Number(id));
        if (found) setPathData(found);
      } catch (error) {
        console.error('Error fetching backup path:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          Volver
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
          Editar Ruta de Respaldo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Modifica los parámetros de destino de almacenamiento.
        </Typography>
      </Box>

      <Box sx={{ 
        p: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        bgcolor: 'background.paper' 
      }}>
        {pathData && <BackupPathForm initialData={pathData} isEdit />}
      </Box>
    </Container>
  );
};
