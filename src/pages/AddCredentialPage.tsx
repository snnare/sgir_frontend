import { useNavigate } from 'react-router-dom';
import { FormPageLayout } from '../components/FormPageLayout';
import { CredentialForm } from '../components/CredentialForm';

export const AddCredentialPage = () => {
  const navigate = useNavigate();

  return (
    <FormPageLayout
      title="Configurar Credenciales"
      subtitle="Las credenciales se cifran de forma reversible (AES) para permitir el acceso remoto automatizado."
      maxWidth="sm"
    >
      <CredentialForm onSuccess={() => navigate('/credenciales')} />
    </FormPageLayout>
  );
};