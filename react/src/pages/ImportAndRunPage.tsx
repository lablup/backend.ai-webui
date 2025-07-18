import ImportNotebook from '../components/ImportNotebook';
import { theme } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

const ImportAndRunPage = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  return (
    <BAICard
      title={t('import.ImportNotebook')}
      showDivider
      style={{
        maxWidth: 728,
        marginBottom: token.paddingMD,
      }}
    >
      <ImportNotebook />
    </BAICard>
  );
};

export default ImportAndRunPage;
