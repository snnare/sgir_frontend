import { FormPageLayout } from '../components/FormPageLayout';
import { BackupPathForm } from '../components/BackupPathForm';

export const AddBackupPathPage = () => {
  return (
    <FormPageLayout
      title="Configurar Destino de Respaldo"
      subtitle="Define las rutas físicas o lógicas donde el orquestador depositará los dumps de base de datos."
      maxWidth="sm"
    >
      <BackupPathForm />
    </FormPageLayout>
  );
};