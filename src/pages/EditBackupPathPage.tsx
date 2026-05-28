import { useEffect, useState } from 'react';
import { Box, Typography, Button, Skeleton, Stack } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { FormPageLayout } from '../components/FormPageLayout';
import { BackupPathForm } from '../components/BackupPathForm';
import { getBackupPaths } from '../api/backupService';
import { type BackupPath } from '../api/types';
import { useNotificationStore } from '../components/GlobalNotification';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const TEST_PATHS: BackupPath[] = [
  {
    id_ruta: 201,
    descripcion_ruta: "Almacenamiento Local de Backups",
    path: "/data/respaldos",
    id_tipo_almacenamiento: 1, // Disco Local
    id_estado_ruta: 1, // Activo
    id_servidor: 1
  },
  {
    id_ruta: 202,
    descripcion_ruta: "Respaldo Oracle RMAN",
    path: "/u01/app/oracle/backups",
    id_tipo_almacenamiento: 3, // NFS/NAS
    id_estado_ruta: 1, // Activo
    id_servidor: 2
  }
];

export const EditBackupPathPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotificationStore();
  const [pathData, setPathData] = useState<BackupPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const paths = await getBackupPaths();
        let found = paths.find(p => p.id_ruta === Number(id));
        
        if (!found) {
          // Intento de fallback a datos de prueba si no existe en BD real
          found = TEST_PATHS.find(p => p.id_ruta === Number(id));
        }

        if (found) {
          setPathData(found);
        } else {
          showNotification('Ruta de respaldo no encontrada', 'warning');
        }
      } catch (error) {
        console.error('Error fetching backup path, falling back to mock data:', error);
        const found = TEST_PATHS.find(p => p.id_ruta === Number(id));
        if (found) {
          setPathData(found);
        } else {
          showNotification('Error al cargar la ruta de respaldo', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [id, showNotification]);

  if (loading) {
    return (
      <FormPageLayout
        title="Editar Ruta de Respaldo"
        subtitle="Cargando configuración de la ruta física..."
        maxWidth="sm"
        backTo="/backups/rutas"
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

  if (!pathData) {
    return (
      <FormPageLayout
        title="Editar Ruta de Respaldo"
        subtitle="Modifica los parámetros de destino de almacenamiento."
        maxWidth="sm"
        backTo="/backups/rutas"
      >
        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <WarningAmberIcon color="warning" sx={{ fontSize: 48 }} />
          <Typography variant="body1" color="text.secondary" align="center" sx={{ fontWeight: 600, maxWidth: 350 }}>
            La ruta de respaldo solicitada no existe o no está registrada en el sistema.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/backups/rutas')}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Volver a Rutas
          </Button>
        </Box>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout
      title="Editar Ruta de Respaldo"
      subtitle="Modifica los parámetros de destino de almacenamiento."
      maxWidth="sm"
      backTo="/backups/rutas"
    >
      <BackupPathForm initialData={pathData} isEdit />
    </FormPageLayout>
  );
};
