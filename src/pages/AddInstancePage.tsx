import { FormPageLayout } from '../components/FormPageLayout';
import { InstanceForm } from '../components/InstanceForm';

export const AddInstancePage = () => {
  return (
    <FormPageLayout
      title="Nueva Instancia DBMS"
      subtitle="Asocia un motor de base de datos a un servidor para habilitar el monitoreo de performance."
      maxWidth="sm"
    >
      <InstanceForm />
    </FormPageLayout>
  );
};