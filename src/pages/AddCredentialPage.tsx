import { FormPageLayout } from '../components/FormPageLayout';
import { CredentialForm } from '../components/CredentialForm';

export const AddCredentialPage = () => {
  return (
    <FormPageLayout
      title="Configurar Credenciales"
      subtitle="Las credenciales se cifran de forma reversible (AES) para permitir el acceso remoto automatizado."
      maxWidth="sm"
    >
      <CredentialForm />
    </FormPageLayout>
  );
};