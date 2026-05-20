import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { FormPageLayout } from '../components/FormPageLayout';
import { BackupPathForm } from '../components/BackupPathForm';
import { getBackupPaths } from '../api/backupService';
import { type BackupPath } from '../api/types';

export const EditBackupPathPage = () => {
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
    <FormPageLayout
      title="Editar Ruta de Respaldo"
      subtitle="Modifica los parámetros de destino de almacenamiento."
      maxWidth="sm"
    >
      {pathData && <BackupPathForm initialData={pathData} isEdit />}
    </FormPageLayout>
  );
};
