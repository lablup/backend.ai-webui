import { useTranslation } from 'react-i18next';

const BAITestButton = () => {
  const { t } = useTranslation();

  return <button>{t('BAITestButton.test')}</button>;
};

export default BAITestButton;
