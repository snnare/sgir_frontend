import { FormPageLayout } from '../components/FormPageLayout';
import { BackupPolicyForm } from '../components/BackupPolicyForm';

export const AddBackupPolicyPage = () => {
  return (
    <FormPageLayout
      title="Nueva Política de Respaldo"
      subtitle="Define la periodicidad y el tiempo de vida de los respaldos automatizados."
      backTo="/backups/politicas"
      backLabel="Volver al listado"
      maxWidth="sm"
    >
      <BackupPolicyForm />
    </FormPageLayout>
  );
};