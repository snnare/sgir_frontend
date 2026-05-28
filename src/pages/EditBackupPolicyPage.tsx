import { useEffect, useState } from 'react';
import { Box, Typography, Button, Skeleton, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { BackupPolicyForm } from '../components/BackupPolicyForm';
import { useBackupStore } from '../store/useBackupStore';
import { FormPageLayout } from '../components/FormPageLayout';
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
      <FormPageLayout
        title="Editar Política"
        subtitle="Cargando configuración de la política..."
        backTo="/backups/politicas"
        backLabel="Volver al listado"
        maxWidth="sm"
      >
        <Stack spacing={3} sx={{ py: 2 }}>
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={56} variant="rounded" />
          <Skeleton height={48} variant="rounded" sx={{ mt: 2 }} />
        </Stack>
      </FormPageLayout>
    );
  }

  if (!policy) {
    return (
      <FormPageLayout
        title="Política no encontrada"
        backTo="/backups/politicas"
        backLabel="Volver al listado"
        maxWidth="sm"
      >
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            La política solicitada no existe o ha sido eliminada.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/backups/politicas')}
            sx={{ fontWeight: 700 }}
          >
            Volver al listado
          </Button>
        </Box>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout
      title="Editar Política"
      subtitle="Modifica los parámetros de la política de respaldo."
      backTo="/backups/politicas"
      backLabel="Volver al listado"
      maxWidth="sm"
    >
      <BackupPolicyForm initialData={policy} isEdit />
    </FormPageLayout>
  );
};
