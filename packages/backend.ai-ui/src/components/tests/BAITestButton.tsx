import { useTranslation } from 'react-i18next';

const BAITestButton = () => {
  const { t } = useTranslation();

  return <button>{t('comp:BAITestButton.Test')}</button>;
};

export default BAITestButton;
