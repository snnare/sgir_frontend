import { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BackupPolicyForm } from '../components/BackupPolicyForm';
import { useBackupStore } from '../store/useBackupStore';
import type { BackupPolicy } from '../api/types';

export const EditBackupPolicyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { policies, fetchPolicies } = useBackupStore();
  const [policy, setPolicy] = useState<BackupPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolicy = async () => {
      if (policies.length === 0) {
        await fetchPolicies();
      }
      const found = policies.find(p => p.id_politica === Number(id));
      setPolicy(found || null);
      setLoading(false);
    };
    loadPolicy();
  }, [id, policies, fetchPolicies]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!policy) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Política no encontrada</Typography>
        <Button onClick={() => navigate('/backups/politicas')} sx={{ mt: 2 }}>
          Volver al listado
        </Button>
      </Container>
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
          Editar Política
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Modifica los parámetros de la política de respaldo.
        </Typography>
      </Box>

      <Box sx={{ 
        p: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        bgcolor: 'background.paper' 
      }}>
        <BackupPolicyForm initialData={policy} isEdit />
      </Box>
    </Container>
  );
};
