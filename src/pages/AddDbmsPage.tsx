import { FormPageLayout } from '../components/FormPageLayout';
import { DbmsForm } from '../components/DbmsForm';

export const AddDbmsPage = () => {
  return (
    <FormPageLayout
      title="Registrar Motor DBMS"
      subtitle="Añade un nuevo motor al catálogo global para que esté disponible al crear instancias."
      backLabel="Volver a Instancia"
      maxWidth="sm"
    >
      <DbmsForm />
    </FormPageLayout>
  );
};